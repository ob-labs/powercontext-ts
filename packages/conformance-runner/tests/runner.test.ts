/**
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { listOperationIds } from '@powercontext/protocol'
import { loadProvenance, loadWireCases } from '../src/load.js'
import { REPO_ROOT } from '../src/paths.js'
import { runConformance } from '../src/run.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function openApiCoverageTags(): {
  readonly enumTags: ReadonlySet<string>
  readonly discriminatorTags: ReadonlySet<string>
} {
  const document = JSON.parse(
    readFileSync(
      join(
        REPO_ROOT,
        'packages',
        'protocol',
        'src',
        'generated',
        'openapi-document.json',
      ),
      'utf8',
    ),
  ) as unknown
  if (!isRecord(document) || !isRecord(document['components'])) {
    throw new Error('generated OpenAPI document has no components')
  }
  const schemas = document['components']['schemas']
  if (!isRecord(schemas)) {
    throw new Error('generated OpenAPI document has no component schemas')
  }
  const enumTags = new Set<string>()
  const discriminatorTags = new Set<string>()
  for (const [name, schema] of Object.entries(schemas)) {
    const visit = (value: unknown, path: readonly string[]): void => {
      if (!isRecord(value)) {
        return
      }
      if (Array.isArray(value['enum'])) {
        enumTags.add(`enum-node:${name}:${path.length === 0 ? '$' : path.join('/')}`)
      }
      for (const [key, child] of Object.entries(value)) {
        if (key !== '$ref' && key !== 'enum') {
          visit(child, [...path, key])
        }
      }
    }
    visit(schema, [])
    if (isRecord(schema) && isRecord(schema['discriminator'])) {
      discriminatorTags.add(`discriminator-node:${name}`)
    }
  }
  return { enumTags, discriminatorTags }
}

describe('TypeScript conformance runner', () => {
  it('does not own fixture truth and reads repository-root assets', () => {
    const provenance = loadProvenance()
    expect(provenance['schema']).toBe('powercontext.conformance.provenance.v1')
    expect(provenance['python_commit']).toHaveLength(40)
    expect(provenance['exporter_version']).toBe('0.3.0-core')
  })

  it('covers a request fixture for every frozen operation', () => {
    const ids = new Set(
      loadWireCases()
        .filter((row) => row.role === 'request')
        .map((row) => row.operationId),
    )
    expect([...listOperationIds()].every((id) => ids.has(id))).toBe(true)
    expect(ids.size).toBe(52)
  })

  it('covers every enum and discriminator definition with valid and invalid fixtures', () => {
    const cases = loadWireCases()
    const { enumTags, discriminatorTags } = openApiCoverageTags()
    expect(enumTags.size).toBe(61)
    for (const tag of [...enumTags, ...discriminatorTags]) {
      const expectations = new Set(
        cases.filter((row) => row.tags?.includes(tag)).map((row) => row.expect),
      )
      expect(expectations, tag).toEqual(new Set(['valid', 'invalid']))
    }
  })

  it('covers declared integer limits and the JavaScript safe-integer edge', () => {
    const cases = loadWireCases()
    const integerCases = cases.filter((row) => row.tags?.includes('integer'))
    expect(integerCases.some((row) => row.id.includes('valid.integer-min'))).toBe(true)
    expect(integerCases.some((row) => row.id.includes('valid.integer-max'))).toBe(true)
    expect(integerCases.some((row) => row.id.includes('valid.safe-integer-max'))).toBe(
      true,
    )
    expect(integerCases.some((row) => row.id.includes('unsafe-integer'))).toBe(true)
  })

  it('matches oracle expected results for wire and canonical fixtures', () => {
    const reports = runConformance()
    expect(reports.client.profile).toBe('client')
    expect(reports.client.level).toBe('C1')
    expect(reports.client.summary.failed).toBe(0)
    expect(reports.client.summary.passed).toBeGreaterThan(52)
    expect(reports.core.profile).toBe('sqlite-fts')
    expect(reports.core.level).toBe('C2')
    expect(reports.core.summary.failed).toBe(0)
    expect(reports.core.summary.passed).toBeGreaterThan(22)
  })
})

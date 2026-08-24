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
import { parse } from 'yaml'
import { CONFORMANCE_ROOT } from '../src/paths.js'
import {
  loadCanonicalCases,
  loadCanonicalExpected,
  loadManifest,
  loadProvenance,
  loadWireCases,
  loadWireExpected,
} from '../src/load.js'
import { assertConformanceDocument } from '../src/schema-validation.js'

function readSchema(name: string): { readonly $id?: string } {
  return JSON.parse(readFileSync(join(CONFORMANCE_ROOT, 'schemas', name), 'utf8')) as {
    readonly $id?: string
  }
}

describe('conformance schemas', () => {
  it('accepts the conformance manifest and provenance', () => {
    const manifest = loadManifest()
    const provenance = loadProvenance()
    expect(manifest.schema).toBe('powercontext.conformance.manifest.v1')
    expect(readSchema('manifest.schema.json').$id).toContain('manifest.schema.json')
    expect(provenance.schema).toBe('powercontext.conformance.provenance.v1')
    expect(readSchema('provenance.schema.json').$id).toContain('provenance.schema.json')
  })

  it('validates both fixture and expected-result suite wrappers', () => {
    expect(loadWireCases().length).toBeGreaterThan(52)
    expect(loadCanonicalCases().length).toBeGreaterThan(0)
    expect(Object.keys(loadWireExpected()).length).toBeGreaterThan(52)
    expect(Object.keys(loadCanonicalExpected()).length).toBeGreaterThan(0)
  })

  it('rejects malformed conformance documents instead of casting them', () => {
    expect(() =>
      assertConformanceDocument('scenario', {
        schema: 'powercontext.conformance.wire.v1',
        suite: 'wire',
        cases: [{ id: 'missing-required-case-fields' }],
      }),
    ).toThrow('invalid conformance scenario document')
    expect(() =>
      assertConformanceDocument('provenance', {
        schema: 'powercontext.conformance.provenance.v1',
        python_commit: 'not-a-commit',
      }),
    ).toThrow('invalid conformance provenance document')
  })

  it('keeps the runner protocol documents readable from the root kit', () => {
    const manifest = parse(
      readFileSync(join(CONFORMANCE_ROOT, 'manifest.yaml'), 'utf8'),
    ) as { capabilities: Array<{ capability: string }> }
    const names = manifest.capabilities.map((row) => row.capability)
    expect(names).toEqual(
      expect.arrayContaining([
        'protocol.wire-validation',
        'canonical.jcs',
        'canonical.hash',
        'canonical.sorting',
        'canonical.utf8-bytes',
      ]),
    )
  })
})

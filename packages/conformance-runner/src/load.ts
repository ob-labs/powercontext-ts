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

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { basename, dirname } from 'node:path'
import { parse } from 'yaml'
import { assertConformanceDocument } from './schema-validation.js'
import type {
  CanonicalCase,
  ConformanceManifest,
  ConformanceProvenance,
  ExpectedResult,
  WireCase,
} from './types.js'
import {
  CANONICAL_EXPECTED_PATH,
  CANONICAL_FIXTURE_PATH,
  MANIFEST_PATH,
  PROVENANCE_PATH,
  WIRE_EXPECTED_PATH,
  WIRE_FIXTURE_PATH,
} from './paths.js'

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown
}

export function loadManifest(): ConformanceManifest {
  const manifest = parse(readFileSync(MANIFEST_PATH, 'utf8')) as unknown
  assertConformanceDocument('manifest', manifest)
  const typed = manifest as ConformanceManifest
  assertUniqueStrings(
    'manifest capabilities',
    typed.capabilities.map((row) => row.capability),
  )
  return typed
}

export function loadProvenance(): ConformanceProvenance {
  const provenance = readJson(PROVENANCE_PATH)
  assertConformanceDocument('provenance', provenance)
  const typed = provenance as ConformanceProvenance
  assertSnapshotDigest(
    'fixtures',
    [CANONICAL_FIXTURE_PATH, WIRE_FIXTURE_PATH],
    typed.fixture_digest,
  )
  assertSnapshotDigest(
    'expected',
    [CANONICAL_EXPECTED_PATH, WIRE_EXPECTED_PATH],
    typed.expected_digest,
  )
  return typed
}

export function loadWireCases(): readonly WireCase[] {
  const document = readJson(WIRE_FIXTURE_PATH)
  assertConformanceDocument('scenario', document)
  const suite = document as {
    readonly suite: 'wire'
    readonly cases: WireCase[]
  }
  if (suite.suite !== 'wire') {
    throw new Error('wire fixture document has the wrong suite')
  }
  assertUniqueCaseIds('wire', suite.cases)
  return suite.cases
}

export function loadCanonicalCases(): readonly CanonicalCase[] {
  const document = readJson(CANONICAL_FIXTURE_PATH)
  assertConformanceDocument('scenario', document)
  const suite = document as {
    readonly suite: 'canonical'
    readonly cases: CanonicalCase[]
  }
  if (suite.suite !== 'canonical') {
    throw new Error('canonical fixture document has the wrong suite')
  }
  assertUniqueCaseIds('canonical', suite.cases)
  return suite.cases
}

function loadExpected(
  path: string,
  expectedSuite: 'wire' | 'canonical',
): Record<string, ExpectedResult> {
  const document = readJson(path)
  assertConformanceDocument('result', document)
  const suite = document as {
    readonly suite: 'wire' | 'canonical'
    readonly results: Record<string, ExpectedResult>
  }
  if (suite.suite !== expectedSuite) {
    throw new Error(`${expectedSuite} expected document has the wrong suite`)
  }
  return suite.results
}

export function loadWireExpected(): Record<string, ExpectedResult> {
  return loadExpected(WIRE_EXPECTED_PATH, 'wire')
}

export function loadCanonicalExpected(): Record<string, ExpectedResult> {
  return loadExpected(CANONICAL_EXPECTED_PATH, 'canonical')
}

function assertUniqueCaseIds(
  suite: string,
  cases: readonly { readonly id: string }[],
): void {
  const seen = new Set<string>()
  for (const caseRow of cases) {
    if (seen.has(caseRow.id)) {
      throw new Error(`${suite} fixture contains duplicate case id: ${caseRow.id}`)
    }
    seen.add(caseRow.id)
  }
}

function assertUniqueStrings(description: string, values: readonly string[]): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${description} must be unique`)
  }
}

export function assertExpectedCoverage(
  suite: string,
  cases: readonly { readonly id: string }[],
  expected: Readonly<Record<string, ExpectedResult>>,
): void {
  const caseIds = new Set(cases.map((caseRow) => caseRow.id))
  const expectedIds = new Set(Object.keys(expected))
  const missing = [...caseIds].filter((id) => !expectedIds.has(id))
  const extra = [...expectedIds].filter((id) => !caseIds.has(id))
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `${suite} expected case ids do not match fixtures; missing=${missing.join(',')}; extra=${extra.join(',')}`,
    )
  }
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

function assertSnapshotDigest(
  folder: 'fixtures' | 'expected',
  paths: readonly string[],
  expectedDigest: string,
): void {
  const entries = Object.fromEntries(
    [...paths]
      .sort()
      .map((path) => [
        `${folder}/${basename(path)}`,
        sha256(readFileSync(path, 'utf8')),
      ]),
  )
  const digest = sha256(`${JSON.stringify(entries, null, 2)}\n`)
  if (digest !== expectedDigest) {
    throw new Error(
      `${folder} snapshot digest ${digest} does not match provenance ${expectedDigest}; root=${dirname(paths[0] ?? '')}`,
    )
  }
}

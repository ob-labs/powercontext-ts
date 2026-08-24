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
import { canonicalizeStrict } from './jcs.js'
import type { CanonicalCase, CaseOutcome, ExpectedResult } from './types.js'

function utf8Bytes(text: string): number {
  return Buffer.byteLength(text, 'utf8')
}

function evaluateCanonical(
  caseRow: CanonicalCase,
  expected: ExpectedResult,
): string | undefined {
  if (caseRow.kind === 'jcs') {
    const actual = canonicalizeStrict(caseRow.input)
    return actual === expected.canonical ? undefined : `canonical mismatch: ${actual}`
  }
  if (caseRow.kind === 'hash') {
    const digest = createHash('sha256')
      .update(canonicalizeStrict(caseRow.input), 'utf8')
      .digest('hex')
    return digest === expected.sha256 ? undefined : `hash mismatch: ${digest}`
  }
  if (caseRow.kind === 'sorting') {
    const keys = caseRow.input as readonly string[]
    const actual = canonicalizeStrict(
      Object.fromEntries(keys.map((key) => [key, true])),
    )
    return actual === expected.canonical ? undefined : `sort mismatch: ${actual}`
  }
  const text = (caseRow.input as { text: string }).text
  const bytes = utf8Bytes(text)
  return bytes === expected.bytes ? undefined : `utf8 bytes ${String(bytes)}`
}

export function runCanonicalCase(
  caseRow: CanonicalCase,
  expected: ExpectedResult | undefined,
): CaseOutcome {
  if (expected === undefined) {
    return { id: caseRow.id, status: 'fail', detail: 'missing expected result' }
  }
  const detail = evaluateCanonical(caseRow, expected)
  return detail === undefined
    ? { id: caseRow.id, status: 'pass' }
    : { id: caseRow.id, status: 'fail', detail }
}

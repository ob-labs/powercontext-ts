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

import {
  ENTRY_CONTENT_HASH_DOMAIN,
  canonicalizeDomain,
  canonicalizeJson,
  hashDomain,
  materializeCanonicalInput,
  normalizeRefs,
  sha256Canonical,
  utf8ByteLength,
} from '@powercontext/core'
import type { CanonicalCase, CaseOutcome, ExpectedResult } from './types.js'

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('canonical fixture input must be an object')
  }
  return value as Record<string, unknown>
}

function materializeInput(caseRow: CanonicalCase): unknown {
  return materializeCanonicalInput(caseRow.inputMode, caseRow.kind, caseRow.input)
}

function evaluateCanonical(
  caseRow: CanonicalCase,
  expected: ExpectedResult,
): string | undefined {
  const input = materializeInput(caseRow)
  if (caseRow.kind === 'jcs') {
    const actual = canonicalizeJson(input)
    return actual === expected.canonical ? undefined : `canonical mismatch: ${actual}`
  }
  if (caseRow.kind === 'domain') {
    const actual = canonicalizeDomain(input)
    return actual === expected.canonical ? undefined : `domain mismatch: ${actual}`
  }
  if (caseRow.kind === 'hash') {
    const digest = sha256Canonical(Buffer.from(canonicalizeJson(input), 'utf8'))
    return digest === expected.sha256 ? undefined : `hash mismatch: ${digest}`
  }
  if (caseRow.kind === 'domain-hash') {
    const domainInput = record(input)
    if (domainInput['domain'] !== 'entry-content') {
      throw new Error(`unknown hash domain: ${String(domainInput['domain'])}`)
    }
    const digest = hashDomain(ENTRY_CONTENT_HASH_DOMAIN, domainInput['value'])
    return digest === expected.sha256 ? undefined : `domain hash mismatch: ${digest}`
  }
  if (caseRow.kind === 'refs') {
    if (!Array.isArray(input)) {
      throw new Error('refs input must be an array')
    }
    const actual = canonicalizeDomain(normalizeRefs(input))
    return actual === expected.canonical ? undefined : `refs mismatch: ${actual}`
  }
  if (caseRow.kind === 'sorting') {
    const keys = input as readonly string[]
    const actual = canonicalizeJson(Object.fromEntries(keys.map((key) => [key, true])))
    return actual === expected.canonical ? undefined : `sort mismatch: ${actual}`
  }
  const text = (input as { text: string }).text
  const bytes = utf8ByteLength(text)
  return bytes === expected.bytes ? undefined : `utf8 bytes ${String(bytes)}`
}

export function runCanonicalCase(
  caseRow: CanonicalCase,
  expected: ExpectedResult | undefined,
): CaseOutcome {
  if (expected === undefined) {
    return { id: caseRow.id, status: 'fail', detail: 'missing expected result' }
  }
  let detail: string | undefined
  try {
    detail = evaluateCanonical(caseRow, expected)
  } catch (error) {
    if (!expected.valid) {
      return { id: caseRow.id, status: 'pass' }
    }
    const message = error instanceof Error ? error.message : String(error)
    return { id: caseRow.id, status: 'fail', detail: `unexpected error: ${message}` }
  }
  if (!expected.valid) {
    return {
      id: caseRow.id,
      status: 'fail',
      detail: 'expected canonical input to be rejected',
    }
  }
  return detail === undefined
    ? { id: caseRow.id, status: 'pass' }
    : { id: caseRow.id, status: 'fail', detail }
}

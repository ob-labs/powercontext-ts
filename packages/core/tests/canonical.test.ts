/**
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CanonicalizationError,
  canonicalizeDomain,
  canonicalizeDomainBytes,
  canonicalizeJson,
  domainSeparatedHash,
  ENTRY_CONTENT_HASH_DOMAIN,
  normalizeRefs,
  sha256Canonical,
  utf8ByteLength,
  assertUtf8Budget,
} from '../src/index.js'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

interface CanonicalCase {
  readonly id: string
  readonly kind: 'jcs' | 'domain' | 'hash' | 'domain-hash' | 'refs' | 'sorting' | 'utf8'
  readonly inputMode: 'json' | 'unicode-code-units' | 'decimal-integer'
  readonly input: unknown
}

interface CanonicalExpected {
  readonly valid: boolean
  readonly canonical?: string
  readonly sha256?: string
  readonly bytes?: number
}

function materializeCase(row: CanonicalCase): unknown {
  if (row.inputMode === 'json') {
    return row.input
  }
  const input = row.input as {
    readonly codeUnits?: readonly number[]
    readonly decimal?: string
  }
  if (row.inputMode === 'unicode-code-units') {
    const text = String.fromCharCode(...(input.codeUnits ?? []))
    return row.kind === 'utf8' ? { text } : { value: text }
  }
  return { value: Number(input.decimal) }
}

function evaluateCase(row: CanonicalCase): Omit<CanonicalExpected, 'valid'> {
  const input = materializeCase(row)
  if (row.kind === 'jcs') {
    return { canonical: canonicalizeJson(input) }
  }
  if (row.kind === 'domain') {
    return { canonical: canonicalizeDomain(input) }
  }
  if (row.kind === 'hash') {
    return {
      sha256: sha256Canonical(Buffer.from(canonicalizeJson(input), 'utf8')),
    }
  }
  if (row.kind === 'domain-hash') {
    const domainInput = input as { readonly domain: string; readonly value: unknown }
    if (domainInput.domain !== 'entry-content') {
      throw new Error(`unknown hash domain: ${domainInput.domain}`)
    }
    return {
      sha256: domainSeparatedHash(
        ENTRY_CONTENT_HASH_DOMAIN,
        canonicalizeDomainBytes(domainInput.value),
      ),
    }
  }
  if (row.kind === 'refs') {
    return { canonical: canonicalizeDomain(normalizeRefs(input as readonly unknown[])) }
  }
  if (row.kind === 'sorting') {
    const keys = input as readonly string[]
    return {
      canonical: canonicalizeJson(Object.fromEntries(keys.map((key) => [key, true]))),
    }
  }
  return { bytes: utf8ByteLength((input as { text: string }).text) }
}

describe('project NFC and domain hash', () => {
  it('applies recursive NFC before JCS so combining marks compose', () => {
    const combining = { text: 'e\u0301' }
    const composed = { text: '\u00e9' }
    expect(canonicalizeJson(combining)).toBe(
      '{"text":"e\\u0301"}'.replace('\\u0301', '\u0301'),
    )
    expect(canonicalizeDomain(combining)).toBe(canonicalizeDomain(composed))
    expect(canonicalizeDomain(combining)).toBe('{"text":"é"}')
  })

  it('rejects object keys that collide after NFC', () => {
    const value = {
      'e\u0301': 1,
      é: 2,
    }
    expect(() => canonicalizeDomain(value)).toThrow(CanonicalizationError)
    expect(() => canonicalizeDomain(value)).toThrow(
      /keys collide after NFC normalization/,
    )
  })

  it('preserves object keys with JavaScript prototype semantics', () => {
    const value = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":"preserved"}',
    ) as unknown

    expect(canonicalizeDomain(value)).toBe(
      '{"__proto__":{"polluted":true},"constructor":"preserved"}',
    )
    expect((Object.prototype as { polluted?: boolean }).polluted).toBeUndefined()
  })

  it('keeps RFC Appendix B ±2^53 on raw JCS and rejects them in the domain path', () => {
    expect(canonicalizeJson({ value: 9007199254740992 })).toBe(
      '{"value":9007199254740992}',
    )
    expect(canonicalizeJson({ value: -9007199254740992 })).toBe(
      '{"value":-9007199254740992}',
    )
    expect(() => canonicalizeDomain({ value: 9007199254740992 })).toThrow(
      CanonicalizationError,
    )
    expect(() => canonicalizeDomain({ value: -9007199254740992 })).toThrow(
      CanonicalizationError,
    )
  })

  it('hashes already-canonical bytes and domain-separates Memory prefixes', () => {
    const canonical = canonicalizeDomain({ a: 2, b: 1 })
    const bytes = Buffer.from(canonical, 'utf8')
    expect(sha256Canonical(bytes)).toBe(
      createHash('sha256').update(bytes).digest('hex'),
    )
    const domain = domainSeparatedHash(ENTRY_CONTENT_HASH_DOMAIN, bytes)
    expect(domain).not.toBe(sha256Canonical(bytes))
    expect(domain).toBe(
      createHash('sha256')
        .update(Buffer.concat([ENTRY_CONTENT_HASH_DOMAIN, bytes]))
        .digest('hex'),
    )
  })

  it('measures UTF-8 byte budgets, not code points or UTF-16 units', () => {
    expect(utf8ByteLength('hello')).toBe(5)
    expect(utf8ByteLength('中文')).toBe(6)
    expect(utf8ByteLength('😀')).toBe(4)
    expect(utf8ByteLength('e\u0301')).toBe(3)
    expect(utf8ByteLength('PowerContext 中文 😀')).toBe(24)
    expect(() => utf8ByteLength('\ud800')).toThrow(CanonicalizationError)
    expect(() => assertUtf8Budget('\udc00', 3, 'text')).toThrow(CanonicalizationError)
    expect(() =>
      assertUtf8Budget('界'.repeat(2731), 8192, 'memory entry text'),
    ).toThrow(/8192 UTF-8 bytes/)
    expect(assertUtf8Budget('durable', 8192, 'memory entry text')).toBe(7)
  })
})

describe('shared C2 canonical fixtures', () => {
  const suite = JSON.parse(
    readFileSync(join(repoRoot, 'conformance', 'fixtures', 'canonical.json'), 'utf8'),
  ) as { readonly cases: readonly CanonicalCase[] }
  const expected = JSON.parse(
    readFileSync(join(repoRoot, 'conformance', 'expected', 'canonical.json'), 'utf8'),
  ) as { readonly results: Record<string, CanonicalExpected> }

  it.each(suite.cases)('matches the Python oracle for $id', (row) => {
    const result = expected.results[row.id]
    expect(result).toBeDefined()
    if (result?.valid === false) {
      expect(() => evaluateCase(row)).toThrow()
      return
    }
    expect(evaluateCase(row)).toEqual({
      ...(result?.canonical === undefined ? {} : { canonical: result.canonical }),
      ...(result?.sha256 === undefined ? {} : { sha256: result.sha256 }),
      ...(result?.bytes === undefined ? {} : { bytes: result.bytes }),
    })
  })
})

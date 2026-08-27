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

import canonicalizeModule from 'canonicalize'
import { CanonicalizationError } from '../errors.js'

const canonicalize = canonicalizeModule as unknown as (value: unknown) => string

export function assertUnicodeScalarString(value: string, path: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new CanonicalizationError(`${path} contains a lone high surrogate`)
      }
      index += 1
      continue
    }
    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new CanonicalizationError(`${path} contains a lone low surrogate`)
    }
  }
}

function assertPlainObject(value: object, path: string): void {
  const prototype = Object.getPrototypeOf(value) as object | null
  if (prototype !== Object.prototype && prototype !== null) {
    throw new CanonicalizationError(`${path} must be a plain JSON object`)
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new CanonicalizationError(`${path} must not contain symbol keys`)
  }
}

function assertJsonArray(
  value: unknown[],
  path: string,
  ancestors: WeakSet<object>,
): void {
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      throw new CanonicalizationError(`${path} must not contain sparse array holes`)
    }
    assertJsonValue(value[index], `${path}[${String(index)}]`, ancestors)
  }
}

export function assertJsonValue(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>,
): void {
  if (value === null || typeof value === 'boolean') {
    return
  }
  if (typeof value === 'string') {
    assertUnicodeScalarString(value, path)
    return
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new CanonicalizationError(`${path} must contain a finite JSON number`)
    }
    return
  }
  if (typeof value !== 'object') {
    throw new CanonicalizationError(`${path} is not a JSON value`)
  }
  if (ancestors.has(value)) {
    throw new CanonicalizationError(`${path} contains a cycle`)
  }
  ancestors.add(value)
  try {
    if (Array.isArray(value)) {
      assertJsonArray(value, path, ancestors)
      return
    }
    assertPlainObject(value, path)
    for (const [key, entry] of Object.entries(value)) {
      assertUnicodeScalarString(key, `${path} key`)
      assertJsonValue(entry, `${path}.${key}`, ancestors)
    }
  } finally {
    ancestors.delete(value)
  }
}

/**
 * RFC 8785 JCS. This is not `JSON.stringify` and does not apply project NFC.
 * Appendix B keeps ±2^53 as finite IEEE 754 numbers. Python rfc8785==0.1.4
 * rejects those Python ints; domain canonicalization follows that rejection.
 * See ADR 0006.
 */
export function canonicalizeJson(value: unknown): string {
  assertJsonValue(value, '$', new WeakSet())
  return canonicalize(value)
}

export function canonicalizeJsonBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalizeJson(value))
}

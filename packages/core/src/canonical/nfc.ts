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

import { CanonicalizationError } from '../errors.js'
import { assertJsonValue, assertUnicodeScalarString, canonicalizeJson } from './jcs.js'

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue }

function normalizeMapping(value: Record<string, unknown>): {
  [key: string]: JsonValue
} {
  const normalized = Object.create(null) as { [key: string]: JsonValue }
  for (const [rawKey, rawValue] of Object.entries(value)) {
    assertUnicodeScalarString(rawKey, 'canonical JSON object key')
    const key = rawKey.normalize('NFC')
    if (Object.hasOwn(normalized, key)) {
      throw new CanonicalizationError(
        'canonical JSON object keys collide after NFC normalization',
      )
    }
    normalized[key] = normalizeUnicode(rawValue)
  }
  return normalized
}

export function normalizeUnicode(value: unknown): JsonValue {
  if (value === null || typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new CanonicalizationError('canonical domain numbers must be finite')
    }
    return value
  }
  if (typeof value === 'string') {
    assertUnicodeScalarString(value, 'canonical text')
    return value.normalize('NFC')
  }
  if (typeof value !== 'object') {
    throw new CanonicalizationError(
      `value of type ${typeof value} is not JSON-compatible`,
    )
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeUnicode(item))
  }
  const prototype = Object.getPrototypeOf(value) as object | null
  if (prototype !== Object.prototype && prototype !== null) {
    throw new CanonicalizationError(
      `value of type ${value.constructor.name} is not JSON-compatible`,
    )
  }
  return normalizeMapping(value as Record<string, unknown>)
}

/**
 * Recursive NFC, then RFC 8785. Key collisions after NFC are rejected.
 * Unsafe integral numbers fail here so identity hashes match Python rfc8785.
 */
export function canonicalizeDomain(value: unknown): string {
  assertJsonValue(value, '$', new WeakSet())
  return canonicalizeJson(normalizeUnicode(value))
}

export function canonicalizeDomainBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalizeDomain(value))
}

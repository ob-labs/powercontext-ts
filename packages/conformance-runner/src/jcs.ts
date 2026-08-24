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

import canonicalizeModule from 'canonicalize'

const canonicalize = canonicalizeModule as unknown as (value: unknown) => string

export class JcsInputError extends TypeError {
  constructor(message: string) {
    super(message)
    this.name = 'JcsInputError'
  }
}

function assertUnicodeScalarString(value: string, path: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new JcsInputError(`${path} contains a lone high surrogate`)
      }
      index += 1
      continue
    }
    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new JcsInputError(`${path} contains a lone low surrogate`)
    }
  }
}

function assertPlainObject(value: object, path: string): void {
  const prototype = Object.getPrototypeOf(value) as object | null
  if (prototype !== Object.prototype && prototype !== null) {
    throw new JcsInputError(`${path} must be a plain JSON object`)
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new JcsInputError(`${path} must not contain symbol keys`)
  }
}

function assertJsonValue(
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
      throw new JcsInputError(`${path} must contain a finite JSON number`)
    }
    return
  }
  if (typeof value !== 'object') {
    throw new JcsInputError(`${path} is not a JSON value`)
  }
  if (ancestors.has(value)) {
    throw new JcsInputError(`${path} contains a cycle`)
  }
  ancestors.add(value)
  try {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        if (!Object.hasOwn(value, index)) {
          throw new JcsInputError(`${path} must not contain sparse array holes`)
        }
        assertJsonValue(entry, `${path}[${String(index)}]`, ancestors)
      })
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

export function canonicalizeStrict(value: unknown): string {
  assertJsonValue(value, '$', new WeakSet())
  return canonicalize(value)
}

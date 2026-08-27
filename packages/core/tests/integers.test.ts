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

import { describe, expect, it } from 'vitest'
import {
  JS_MAX_SAFE_INTEGER,
  JS_MIN_SAFE_INTEGER,
  SafeIntegerError,
  assertSafeInteger,
  bigintToSafeInteger,
  findUnsafeIntegerTokens,
  isSafeInteger,
} from '../src/index.js'

describe('ADR 0001 integer boundaries', () => {
  it('accepts the inclusive JavaScript safe bounds', () => {
    expect(assertSafeInteger(JS_MIN_SAFE_INTEGER, 'revision')).toBe(JS_MIN_SAFE_INTEGER)
    expect(assertSafeInteger(JS_MAX_SAFE_INTEGER, 'revision')).toBe(JS_MAX_SAFE_INTEGER)
    expect(isSafeInteger(0)).toBe(true)
  })

  it('rejects values that JSON number cannot represent exactly', () => {
    expect(() => assertSafeInteger(JS_MAX_SAFE_INTEGER + 1, 'position')).toThrow(
      SafeIntegerError,
    )
    expect(() => assertSafeInteger(1.5, 'position')).toThrow(SafeIntegerError)
    expect(() => assertSafeInteger('12', 'position')).toThrow(SafeIntegerError)
    expect(isSafeInteger(Number.NaN)).toBe(false)
    expect(isSafeInteger(Number.POSITIVE_INFINITY)).toBe(false)
  })

  it('converts in-range bigint values and refuses out-of-range ones', () => {
    expect(bigintToSafeInteger(42n, 'journal_position')).toBe(42)
    expect(() =>
      bigintToSafeInteger(BigInt(JS_MAX_SAFE_INTEGER) + 1n, 'journal_position'),
    ).toThrow(SafeIntegerError)
  })

  it('detects raw JSON integer tokens that JSON.parse would silently round', () => {
    const raw = '{"position":9007199254740993}'
    expect((JSON.parse(raw) as { position: number }).position).toBe(9007199254740992)
    expect(findUnsafeIntegerTokens(raw)).toEqual(['9007199254740993'])
    expect(findUnsafeIntegerTokens('{"position":42}')).toEqual([])
  })

  it('does not scan numeric text inside JSON strings', () => {
    const raw = JSON.stringify({
      text: 'ticket 9007199254740993',
      id: '9007199254740993',
    })
    expect(findUnsafeIntegerTokens(raw)).toEqual([])
  })
})

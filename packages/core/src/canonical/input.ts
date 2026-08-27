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
import { findUnsafeIntegerTokens, isSafeInteger } from '../integers.js'

export type CanonicalInputMode = 'json' | 'unicode-code-units' | 'decimal-integer'

export function parseDomainIntegerToken(decimal: string): number {
  if (findUnsafeIntegerTokens(decimal).length > 0) {
    throw new CanonicalizationError(
      'canonical domain integers must stay inside the JavaScript safe-integer range',
    )
  }
  const value = Number(decimal)
  if (!isSafeInteger(value)) {
    throw new CanonicalizationError(
      'canonical domain integers must stay inside the JavaScript safe-integer range',
    )
  }
  return value
}

function textFromCodeUnits(input: unknown, kind: string): unknown {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new CanonicalizationError('unicode-code-units input must be an object')
  }
  const codeUnits = (input as { codeUnits?: unknown }).codeUnits
  if (!Array.isArray(codeUnits)) {
    throw new CanonicalizationError('unicode-code-units input must contain codeUnits')
  }
  const text = String.fromCharCode(
    ...codeUnits.map((value) => {
      if (typeof value !== 'number') {
        throw new CanonicalizationError('unicode code units must be numbers')
      }
      return value
    }),
  )
  return kind === 'utf8' ? { text } : { value: text }
}

/** Shared C2 fixture materialization. Decimal-integer tokens follow Python ints. */
export function materializeCanonicalInput(
  inputMode: CanonicalInputMode,
  kind: string,
  input: unknown,
): unknown {
  if (inputMode === 'json') {
    return input
  }
  if (inputMode === 'unicode-code-units') {
    return textFromCodeUnits(input, kind)
  }
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new CanonicalizationError('decimal-integer input must be an object')
  }
  const decimal = (input as { decimal?: unknown }).decimal
  if (typeof decimal !== 'string') {
    throw new CanonicalizationError('decimal-integer input must contain decimal text')
  }
  return { value: parseDomainIntegerToken(decimal) }
}

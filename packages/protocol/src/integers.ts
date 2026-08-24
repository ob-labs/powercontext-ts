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

/** Inclusive JavaScript safe-integer bounds from ADR 0001. */
export const JS_MAX_SAFE_INTEGER = 9007199254740991
export const JS_MIN_SAFE_INTEGER = -9007199254740991

export class SafeIntegerError extends Error {
  readonly field: string
  readonly received: unknown

  constructor(field: string, received: unknown) {
    super(
      `${field} must be a JSON integer inside [${String(JS_MIN_SAFE_INTEGER)}, ${String(JS_MAX_SAFE_INTEGER)}]`,
    )
    this.name = 'SafeIntegerError'
    this.field = field
    this.received = received
  }
}

export function isSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value)
}

export function assertSafeInteger(value: unknown, field: string): number {
  if (!isSafeInteger(value)) {
    throw new SafeIntegerError(field, value)
  }
  return value
}

export function bigintToSafeInteger(value: bigint, field: string): number {
  if (value < BigInt(JS_MIN_SAFE_INTEGER) || value > BigInt(JS_MAX_SAFE_INTEGER)) {
    throw new SafeIntegerError(field, value)
  }
  return Number(value)
}

const JSON_NUMBER_TOKEN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/

function isDigit(value: string | undefined): boolean {
  return value !== undefined && value >= '0' && value <= '9'
}

function listJsonNumberTokens(jsonText: string): string[] {
  const tokens: string[] = []
  let inString = false
  let escaped = false
  for (let index = 0; index < jsonText.length; index += 1) {
    const character = jsonText[index]
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === '"') {
        inString = false
      }
      continue
    }
    if (character === '"') {
      inString = true
      continue
    }
    if (character !== '-' && !isDigit(character)) {
      continue
    }
    const match = JSON_NUMBER_TOKEN.exec(jsonText.slice(index))
    if (match === null) {
      continue
    }
    tokens.push(match[0])
    index += match[0].length - 1
  }
  return tokens
}

function expandIntegerToken(token: string): bigint | null {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(token)
  if (match === null) {
    return null
  }
  const sign = match[1] === '-' ? -1n : 1n
  const integer = match[2] ?? ''
  const fraction = match[3] ?? ''
  const rawExponent = match[4] ?? '0'
  const exponentSign = rawExponent.startsWith('-') ? -1 : 1
  const exponentDigits = rawExponent.replace(/^[+-]?0*/, '') || '0'
  const parsedExponent =
    exponentDigits.length > 6
      ? exponentSign * Number.POSITIVE_INFINITY
      : exponentSign * Number.parseInt(exponentDigits, 10)
  const exponent = parsedExponent - fraction.length
  const digits = `${integer}${fraction}`
  if (/^0+$/.test(digits)) {
    return 0n
  }
  if (exponent === Number.POSITIVE_INFINITY) {
    return sign * (BigInt(JS_MAX_SAFE_INTEGER) + 1n)
  }
  if (exponent === Number.NEGATIVE_INFINITY) {
    return null
  }
  if (exponent >= 0) {
    const significant = digits.replace(/^0+/, '')
    if (significant.length + exponent > String(JS_MAX_SAFE_INTEGER).length) {
      return sign * (BigInt(JS_MAX_SAFE_INTEGER) + 1n)
    }
    return sign * BigInt(`${significant}${'0'.repeat(exponent)}`)
  }
  const fractionalDigits = -exponent
  if (fractionalDigits > digits.length) {
    return null
  }
  const suffix = digits.slice(digits.length - fractionalDigits)
  if (!/^0*$/.test(suffix)) {
    return null
  }
  const whole = (digits.slice(0, digits.length - fractionalDigits) || '0').replace(
    /^0+(?=\d)/,
    '',
  )
  if (whole.length > String(JS_MAX_SAFE_INTEGER).length) {
    return sign * (BigInt(JS_MAX_SAFE_INTEGER) + 1n)
  }
  return sign * BigInt(whole)
}

/**
 * Detect integer tokens that `JSON.parse` would silently round.
 * Standard `JSON.parse` cannot implement ADR 0001 by itself.
 */
export function findUnsafeIntegerTokens(jsonText: string): string[] {
  const unsafe: string[] = []
  for (const token of listJsonNumberTokens(jsonText)) {
    const value = expandIntegerToken(token)
    if (value === null) {
      continue
    }
    if (value < BigInt(JS_MIN_SAFE_INTEGER) || value > BigInt(JS_MAX_SAFE_INTEGER)) {
      unsafe.push(token)
    }
  }
  return unsafe
}

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
import { assertUnicodeScalarString } from './jcs.js'

const encoder = new TextEncoder()

export function utf8ByteLength(text: string): number {
  assertUnicodeScalarString(text, 'UTF-8 text')
  return encoder.encode(text).byteLength
}

export function assertUtf8Budget(
  text: string,
  maxBytes: number,
  field: string,
): number {
  const bytes = utf8ByteLength(text)
  if (bytes > maxBytes) {
    throw new CanonicalizationError(
      `${field} must not exceed ${String(maxBytes)} UTF-8 bytes`,
    )
  }
  return bytes
}

export function codePointLength(text: string): number {
  return [...text].length
}

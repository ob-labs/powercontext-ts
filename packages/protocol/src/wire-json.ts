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

import { findUnsafeIntegerTokens } from './integers.js'
import { validateWireValue } from './generated/validators.js'
import type { WireValidationResult } from './validator-runtime.js'

function invalid(message: string): WireValidationResult {
  return { valid: false, errors: [{ message }] }
}

export function validateWireJson(name: string, jsonText: string): WireValidationResult {
  const unsafe = findUnsafeIntegerTokens(jsonText)
  if (unsafe.length > 0) {
    return invalid(`unsafe JSON integer token: ${unsafe.join(', ')}`)
  }
  try {
    return validateWireValue(name, JSON.parse(jsonText) as unknown)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return invalid(`invalid JSON: ${message}`)
  }
}

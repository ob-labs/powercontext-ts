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

import AjvImport from 'ajv'
import addFormatsImport from 'ajv-formats'

export interface WireValidationResult {
  readonly valid: boolean
  readonly errors: unknown
}

export interface CompiledValidator {
  (data: unknown): boolean
  errors?: unknown
}

interface AjvInstance {
  addSchema(schema: unknown): void
  getSchema(id: string): CompiledValidator | undefined
}

type AjvConstructor = new (options: Record<string, unknown>) => AjvInstance
type FormatPlugin = (ajv: AjvInstance) => void

function interopDefault<T>(module: T | { default: T }): T {
  if (typeof module === 'object' && module !== null && 'default' in module) {
    return module.default
  }
  return module
}

const Ajv = interopDefault(AjvImport) as unknown as AjvConstructor
const addFormats = interopDefault(addFormatsImport) as unknown as FormatPlugin
const DOCUMENT_ID = 'https://powercontext.local/openapi.json'

export function createWireValidator(schemas: Record<string, unknown>): {
  compileComponentValidator: (name: string) => CompiledValidator
  validateWireValue: (name: string, value: unknown) => WireValidationResult
} {
  const ajv = new Ajv({
    allErrors: true,
    coerceTypes: false,
    useDefaults: false,
    removeAdditional: false,
    strict: false,
    validateSchema: false,
  })
  addFormats(ajv)
  ajv.addSchema({
    $id: DOCUMENT_ID,
    components: { schemas },
  })

  function compileComponentValidator(name: string): CompiledValidator {
    const validator = ajv.getSchema(`${DOCUMENT_ID}#/components/schemas/${name}`)
    if (validator === undefined) {
      throw new Error(`unknown OpenAPI component schema: ${name}`)
    }
    return validator
  }

  function validateWireValue(name: string, value: unknown): WireValidationResult {
    const validator = compileComponentValidator(name)
    return { valid: validator(value) === true, errors: validator.errors ?? [] }
  }

  return { compileComponentValidator, validateWireValue }
}

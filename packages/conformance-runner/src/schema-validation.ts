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

import { readFileSync } from 'node:fs'
import AjvImport from 'ajv'
import {
  MANIFEST_SCHEMA_PATH,
  PROVENANCE_SCHEMA_PATH,
  REPORT_SCHEMA_PATH,
  RESULT_SCHEMA_PATH,
  SCENARIO_SCHEMA_PATH,
} from './paths.js'

export type ConformanceSchemaName =
  'manifest' | 'provenance' | 'scenario' | 'result' | 'report'

interface CompiledValidator {
  (data: unknown): boolean
  errors?: readonly unknown[] | null
}

interface AjvInstance {
  compile(schema: unknown): CompiledValidator
}

type AjvConstructor = new (options: Record<string, unknown>) => AjvInstance

function interopDefault<T>(module: T | { default: T }): T {
  if (typeof module === 'object' && module !== null && 'default' in module) {
    return module.default
  }
  return module
}

const Ajv = interopDefault(AjvImport) as unknown as AjvConstructor
const ajv = new Ajv({
  allErrors: true,
  coerceTypes: false,
  removeAdditional: false,
  strict: false,
  useDefaults: false,
})

const schemaPaths: Record<ConformanceSchemaName, string> = {
  manifest: MANIFEST_SCHEMA_PATH,
  provenance: PROVENANCE_SCHEMA_PATH,
  scenario: SCENARIO_SCHEMA_PATH,
  result: RESULT_SCHEMA_PATH,
  report: REPORT_SCHEMA_PATH,
}

let validators: Record<ConformanceSchemaName, CompiledValidator> | undefined

function getValidators(): Record<ConformanceSchemaName, CompiledValidator> {
  validators ??= Object.fromEntries(
    Object.entries(schemaPaths).map(([name, path]) => [
      name,
      ajv.compile(JSON.parse(readFileSync(path, 'utf8')) as unknown),
    ]),
  ) as Record<ConformanceSchemaName, CompiledValidator>
  return validators
}

export function assertConformanceDocument(
  name: ConformanceSchemaName,
  value: unknown,
): void {
  const validator = getValidators()[name]
  if (validator(value)) {
    return
  }
  const detail = JSON.stringify(validator.errors ?? [])
  throw new Error(`invalid conformance ${name} document: ${detail}`)
}

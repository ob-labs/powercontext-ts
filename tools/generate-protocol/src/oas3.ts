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

import {
  JS_MAX_SAFE_INTEGER,
  JS_MIN_SAFE_INTEGER,
} from '../../../packages/protocol/src/integers.js'

export const OAS3_CONVERSION_ID = 'oas3-to-json-schema.v1'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function field(record: JsonRecord, key: string): unknown {
  return record[key]
}

function setField(record: JsonRecord, key: string, value: unknown): void {
  record[key] = value
}

function cloneJson(value: unknown): unknown {
  return structuredClone(value)
}

function convertExclusiveBound(
  schema: JsonRecord,
  flagKey: 'exclusiveMinimum' | 'exclusiveMaximum',
  boundKey: 'minimum' | 'maximum',
): void {
  const flag = schema[flagKey]
  if (typeof flag !== 'boolean') {
    return
  }
  const bound = schema[boundKey]
  if (flag && typeof bound === 'number') {
    schema[flagKey] = bound
    delete schema[boundKey]
    return
  }
  delete schema[flagKey]
}

function applyIntegerBounds(schema: JsonRecord): void {
  if (field(schema, 'type') !== 'integer') {
    return
  }
  if (typeof field(schema, 'minimum') !== 'number') {
    setField(schema, 'minimum', JS_MIN_SAFE_INTEGER)
  }
  if (typeof field(schema, 'maximum') !== 'number') {
    setField(schema, 'maximum', JS_MAX_SAFE_INTEGER)
  }
}

function convertChildren(schema: JsonRecord): void {
  const properties = field(schema, 'properties')
  if (isRecord(properties)) {
    for (const [key, value] of Object.entries(properties)) {
      setField(properties, key, oas3ToJsonSchema(value))
    }
  }
  if (field(schema, 'items') !== undefined) {
    setField(schema, 'items', oas3ToJsonSchema(field(schema, 'items')))
  }
  if (field(schema, 'additionalProperties') !== undefined) {
    setField(
      schema,
      'additionalProperties',
      oas3ToJsonSchema(field(schema, 'additionalProperties')),
    )
  }
  for (const key of ['allOf', 'oneOf', 'anyOf'] as const) {
    const parts = schema[key]
    if (Array.isArray(parts)) {
      schema[key] = parts.map((part) => oas3ToJsonSchema(part))
    }
  }
}

/**
 * Convert one OpenAPI 3.0 Schema Object into a JSON Schema Ajv can compile.
 * This is not "treat OAS3 as Draft 07". Boolean exclusiveMin/Max, nullable,
 * and integer safe-range are rewritten explicitly.
 */
export function oas3ToJsonSchema(schema: unknown): unknown {
  if (!isRecord(schema)) {
    return schema
  }
  const converted = cloneJson(schema) as JsonRecord
  const nullable = field(converted, 'nullable') === true
  delete converted['nullable']
  convertExclusiveBound(converted, 'exclusiveMinimum', 'minimum')
  convertExclusiveBound(converted, 'exclusiveMaximum', 'maximum')
  applyIntegerBounds(converted)
  convertChildren(converted)
  if (!nullable) {
    return converted
  }
  const withoutTypeNull = { ...converted }
  return {
    anyOf: [withoutTypeNull, { type: 'null' }],
  }
}

export function convertComponentSchemas(
  schemas: Record<string, unknown>,
): Record<string, unknown> {
  const converted: Record<string, unknown> = {}
  for (const [name, schema] of Object.entries(schemas)) {
    converted[name] = oas3ToJsonSchema(schema)
  }
  return converted
}

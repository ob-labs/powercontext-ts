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

import type { OpenApiDocument, OperationObject, PathItem } from './load-openapi.js'

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]
export type RequestLocation = 'body' | 'query' | null

export interface OperationMetadata {
  readonly operationId: string
  readonly method: Uppercase<HttpMethod>
  readonly path: string
  readonly location: RequestLocation
  readonly scope: boolean
}

type JsonRecord = Record<string, unknown>

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function field(record: JsonRecord, key: string): unknown {
  return record[key]
}

export function resolveRef(
  document: OpenApiDocument,
  ref: string,
  seen = new Set<string>(),
): unknown {
  if (!ref.startsWith('#/') || seen.has(ref)) {
    return undefined
  }
  seen.add(ref)
  let current: unknown = document
  for (const raw of ref.slice(2).split('/')) {
    const key = raw.replaceAll('~1', '/').replaceAll('~0', '~')
    if (!isRecord(current) || !(key in current)) {
      return undefined
    }
    current = current[key]
  }
  return current
}

export function deref(
  document: OpenApiDocument,
  node: unknown,
  seen = new Set<string>(),
): unknown {
  if (!isRecord(node) || typeof field(node, '$ref') !== 'string') {
    return node
  }
  return deref(
    document,
    resolveRef(document, field(node, '$ref') as string, seen),
    seen,
  )
}

function schemaHasScope(
  document: OpenApiDocument,
  schema: unknown,
  seen = new Set<string>(),
): boolean {
  const resolved = deref(document, schema, seen)
  if (!isRecord(resolved)) {
    return false
  }
  const properties = field(resolved, 'properties')
  if (isRecord(properties) && 'scope_id' in properties) {
    return true
  }
  return ['allOf', 'oneOf', 'anyOf'].some((key) => {
    const parts = resolved[key]
    return (
      Array.isArray(parts) &&
      parts.some((part) => schemaHasScope(document, part, new Set(seen)))
    )
  })
}

function jsonBodySchema(
  document: OpenApiDocument,
  operation: OperationObject,
): unknown {
  const body = deref(document, operation.requestBody)
  const content = isRecord(body) ? field(body, 'content') : undefined
  if (!isRecord(content)) {
    return undefined
  }
  const json = field(content, 'application/json')
  return isRecord(json) ? field(json, 'schema') : undefined
}

function collectParameters(
  document: OpenApiDocument,
  pathItem: PathItem,
  operation: OperationObject,
): JsonRecord[] {
  const listed = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]
  return listed
    .map((item) => deref(document, item))
    .filter((item): item is JsonRecord => isRecord(item))
}

function requestLocation(
  bodySchema: unknown,
  parameters: JsonRecord[],
): RequestLocation {
  if (bodySchema !== undefined) {
    return 'body'
  }
  if (parameters.some((parameter) => field(parameter, 'in') === 'query')) {
    return 'query'
  }
  return null
}

export function parseOperations(document: OpenApiDocument): OperationMetadata[] {
  const rows: OperationMetadata[] = []
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isRecord(pathItem)) {
      continue
    }
    const item = pathItem as PathItem
    for (const method of HTTP_METHODS) {
      const operation = item[method]
      if (operation?.operationId === undefined) {
        continue
      }
      const parameters = collectParameters(document, item, operation)
      const bodySchema = jsonBodySchema(document, operation)
      rows.push({
        operationId: operation.operationId,
        method: method.toUpperCase() as Uppercase<HttpMethod>,
        path,
        location: requestLocation(bodySchema, parameters),
        scope:
          (bodySchema !== undefined && schemaHasScope(document, bodySchema)) ||
          parameters.some(
            (parameter) =>
              field(parameter, 'in') === 'query' &&
              field(parameter, 'name') === 'scope_id',
          ),
      })
    }
  }
  return rows
}

export function listComponentSchemaNames(document: OpenApiDocument): string[] {
  return Object.keys(document.components?.schemas ?? {}).sort()
}

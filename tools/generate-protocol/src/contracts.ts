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
import { deref, isRecord, type OperationMetadata } from './operations.js'

export type MediaKind = 'json' | 'text' | 'bytes'

export interface RequestContract {
  readonly location: OperationMetadata['location']
  readonly contentType: string | null
  readonly schemaName: string | null
}

export interface MediaContract {
  readonly status: number
  readonly contentType: string
  readonly schemaName: string | null
  readonly kind: MediaKind
}

export interface OperationContract {
  readonly operationId: string
  readonly request: RequestContract
  readonly success: readonly MediaContract[]
  readonly errors: readonly MediaContract[]
}

type JsonRecord = Record<string, unknown>

function field(record: JsonRecord, key: string): unknown {
  return record[key]
}

function schemaRefName(schema: unknown): string | null {
  if (!isRecord(schema) || typeof field(schema, '$ref') !== 'string') {
    return null
  }
  const match = /^#\/components\/schemas\/([^/]+)$/.exec(
    field(schema, '$ref') as string,
  )
  return match?.[1] ?? null
}

function classifyMedia(contentType: string): MediaKind {
  if (contentType === 'application/json') {
    return 'json'
  }
  if (contentType.startsWith('text/')) {
    return 'text'
  }
  return 'bytes'
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

function queryParameterNames(
  document: OpenApiDocument,
  pathItem: PathItem,
  operation: OperationObject,
): { readonly required: readonly string[]; readonly all: readonly string[] } {
  const listed = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]
  const query = listed
    .map((item) => deref(document, item))
    .filter((item): item is JsonRecord => isRecord(item))
    .filter((item) => field(item, 'in') === 'query')
    .map((item) => ({
      name: String(field(item, 'name') ?? ''),
      required: field(item, 'required') === true,
    }))
    .filter((item) => item.name !== '')
  return {
    required: query.filter((item) => item.required).map((item) => item.name),
    all: query.map((item) => item.name),
  }
}

function matchingRequestSchema(
  document: OpenApiDocument,
  names: { readonly required: readonly string[]; readonly all: readonly string[] },
): string | null {
  const schemas = document.components?.schemas ?? {}
  const wanted = [...names.all].sort()
  const required = [...names.required].sort()
  const matches: string[] = []
  for (const [name, schema] of Object.entries(schemas)) {
    if (!isRecord(schema) || field(schema, 'type') !== 'object') {
      continue
    }
    const properties = field(schema, 'properties')
    if (!isRecord(properties)) {
      continue
    }
    const propertyNames = Object.keys(properties).sort()
    const schemaRequired = Array.isArray(field(schema, 'required'))
      ? [...(field(schema, 'required') as string[])].sort()
      : []
    if (
      propertyNames.join('\0') === wanted.join('\0') &&
      schemaRequired.join('\0') === required.join('\0')
    ) {
      matches.push(name)
    }
  }
  return (
    matches.find((name) => name.endsWith('Request')) ??
    matches.sort((left, right) => left.localeCompare(right))[0] ??
    null
  )
}

function requestContract(
  document: OpenApiDocument,
  metadata: OperationMetadata,
  pathItem: PathItem,
  operation: OperationObject,
): RequestContract {
  const bodySchema = jsonBodySchema(document, operation)
  if (bodySchema !== undefined) {
    return {
      location: 'body',
      contentType: 'application/json',
      schemaName: schemaRefName(bodySchema),
    }
  }
  if (metadata.location === 'query') {
    return {
      location: 'query',
      contentType: null,
      schemaName: matchingRequestSchema(
        document,
        queryParameterNames(document, pathItem, operation),
      ),
    }
  }
  return { location: null, contentType: null, schemaName: null }
}

function mediaFromContent(status: number, content: JsonRecord): MediaContract[] {
  const rows: MediaContract[] = []
  for (const [contentType, media] of Object.entries(content)) {
    if (!isRecord(media)) {
      continue
    }
    rows.push({
      status,
      contentType,
      schemaName: schemaRefName(field(media, 'schema')),
      kind: classifyMedia(contentType),
    })
  }
  return rows
}

function parseResponseObject(
  document: OpenApiDocument,
  status: number,
  response: unknown,
): MediaContract[] {
  const resolved = deref(document, response)
  if (!isRecord(resolved)) {
    return []
  }
  const content = field(resolved, 'content')
  return isRecord(content) ? mediaFromContent(status, content) : []
}

function parseResponses(
  document: OpenApiDocument,
  operation: OperationObject,
): { readonly success: MediaContract[]; readonly errors: MediaContract[] } {
  const success: MediaContract[] = []
  const errors: MediaContract[] = []
  for (const [code, response] of Object.entries(operation.responses ?? {})) {
    const status = Number(code)
    if (!Number.isInteger(status)) {
      continue
    }
    const media = parseResponseObject(document, status, response)
    if (status >= 200 && status < 300) {
      success.push(...media)
    } else {
      errors.push(...media)
    }
  }
  return { success, errors }
}

function findPathOperation(
  document: OpenApiDocument,
  metadata: OperationMetadata,
): { readonly pathItem: PathItem; readonly operation: OperationObject } {
  const pathItem = document.paths?.[metadata.path]
  if (!isRecord(pathItem)) {
    throw new Error(`missing path item for ${metadata.operationId}`)
  }
  const item = pathItem as PathItem
  const method = metadata.method.toLowerCase() as
    'get' | 'post' | 'put' | 'patch' | 'delete'
  const operation = item[method]
  if (operation?.operationId === undefined) {
    throw new Error(`missing operation object for ${metadata.operationId}`)
  }
  return { pathItem: item, operation }
}

export function parseOperationContracts(
  document: OpenApiDocument,
  operations: readonly OperationMetadata[],
): OperationContract[] {
  return operations.map((metadata) => {
    const { pathItem, operation } = findPathOperation(document, metadata)
    const responses = parseResponses(document, operation)
    return {
      operationId: metadata.operationId,
      request: requestContract(document, metadata, pathItem, operation),
      success: responses.success,
      errors: responses.errors,
    }
  })
}

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

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

export interface OpenApiDocument {
  readonly openapi?: string
  readonly info?: { readonly version?: string }
  readonly paths?: Record<string, PathItem | undefined>
  readonly components?: {
    readonly schemas?: Record<string, unknown>
  }
}

export interface PathItem {
  readonly parameters?: readonly unknown[]
  readonly get?: OperationObject
  readonly post?: OperationObject
  readonly put?: OperationObject
  readonly patch?: OperationObject
  readonly delete?: OperationObject
}

export interface OperationObject {
  readonly operationId?: string
  readonly parameters?: readonly unknown[]
  readonly requestBody?: unknown
}

export function readOpenApiText(path: string): string {
  return readFileSync(path, 'utf8').replaceAll('\r\n', '\n').replaceAll('\r', '\n')
}

export function digestOpenApiText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

export function loadOpenApi(path: string): {
  readonly document: OpenApiDocument
  readonly text: string
  readonly digest: string
} {
  const text = readOpenApiText(path)
  const document = parse(text) as OpenApiDocument
  if (document.openapi !== '3.0.3') {
    throw new Error(`expected OpenAPI 3.0.3, received ${String(document.openapi)}`)
  }
  return { document, text, digest: digestOpenApiText(text) }
}

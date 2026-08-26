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
  OPERATION_METADATA,
  listOperationIds,
  validateOperationRequest,
  type OperationId,
} from '@powercontext/protocol'
import { acceptForOperation } from './content-type.js'
import { InvalidRequestError, UnknownOperationError } from './errors.js'
import { buildRequestHeaders } from './headers.js'
import type { CallOptions, ResolvedClientOptions } from './types.js'
import { buildRequestUrl } from './url.js'

export interface PreparedRequest {
  readonly operationId: OperationId
  readonly path: string
  readonly url: string
  readonly init: RequestInit
  readonly payload: Record<string, unknown> | undefined
}

function asPayload(
  operationId: OperationId,
  value: unknown,
): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  throw new InvalidRequestError(operationId, 'payload must be a JSON object')
}

export function resolveOperationId(operationId: string): OperationId {
  if (!listOperationIds().includes(operationId as OperationId)) {
    throw new UnknownOperationError(operationId)
  }
  return operationId as OperationId
}

export function validateRequestPayload(
  operationId: OperationId,
  payload: unknown,
): void {
  const result = validateOperationRequest(operationId, payload)
  if (!result.valid) {
    throw new InvalidRequestError(operationId)
  }
}

export function prepareRequest(
  options: ResolvedClientOptions,
  operationId: OperationId,
  payload: unknown,
  call: CallOptions | undefined,
  signal: AbortSignal,
): PreparedRequest {
  const metadata = OPERATION_METADATA[operationId]
  const record = asPayload(operationId, payload)
  validateRequestPayload(operationId, payload)
  const headers = buildRequestHeaders({
    accept: acceptForOperation(operationId, record),
    userAgent: options.userAgent,
    authorization: options.authorization,
    contentType: metadata.location === 'body' ? 'application/json' : undefined,
    extra: call?.headers,
  })
  const init: RequestInit = {
    method: metadata.method,
    headers,
    redirect: 'manual',
    signal,
  }
  if (metadata.location === 'body') {
    init.body = JSON.stringify(record ?? {})
  }
  return {
    operationId,
    path: metadata.path,
    url: buildRequestUrl(options.baseUrl, metadata.path, metadata.location, record),
    init,
    payload: record,
  }
}

export function operationPath(operationId: OperationId): string {
  return OPERATION_METADATA[operationId].path
}

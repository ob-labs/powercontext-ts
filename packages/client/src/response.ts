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
  findUnsafeIntegerTokens,
  validateOperationSuccess,
  validateWireValue,
} from '@powercontext/protocol'
import { decodeUtf8 } from './body.js'
import { REQUEST_ID_HEADER } from './constants.js'
import { isDownloadRequest, mediaType } from './content-type.js'
import { InvalidResponseError, ServerResponseError } from './errors.js'
import type { ClientSuccess } from './types.js'

function requestIdOf(response: Response): string | undefined {
  return response.headers.get(REQUEST_ID_HEADER) ?? undefined
}

function parseJsonValue(text: string): unknown {
  const unsafe = findUnsafeIntegerTokens(text)
  if (unsafe.length > 0) {
    throw new Error(`unsafe JSON integer token: ${unsafe.join(', ')}`)
  }
  return JSON.parse(text) as unknown
}

function decodeErrorBody(bytes: Uint8Array): {
  code?: string | undefined
  message?: string | undefined
  details?: Record<string, unknown> | null | undefined
} {
  try {
    const parsed = parseJsonValue(decodeUtf8(bytes))
    const result = validateWireValue('ErrorResponse', parsed)
    if (!result.valid || typeof parsed !== 'object' || parsed === null) {
      return {}
    }
    const error = (parsed as { error?: Record<string, unknown> }).error
    if (error === undefined) {
      return {}
    }
    return {
      code: typeof error['code'] === 'string' ? error['code'] : undefined,
      message: typeof error['message'] === 'string' ? error['message'] : undefined,
      details:
        error['details'] === null ||
        (typeof error['details'] === 'object' && error['details'] !== null)
          ? (error['details'] as Record<string, unknown> | null)
          : undefined,
    }
  } catch {
    return {}
  }
}

export function serverErrorFromResponse(
  response: Response,
  bytes: Uint8Array,
): ServerResponseError {
  const decoded = decodeErrorBody(bytes)
  return new ServerResponseError({
    statusCode: response.status,
    requestId: requestIdOf(response),
    code: decoded.code,
    message: decoded.message,
    details: decoded.details,
  })
}

function validatedJson(
  operationId: string,
  status: number,
  contentType: string,
  path: string,
  requestId: string | undefined,
  bytes: Uint8Array,
): unknown {
  try {
    const value = parseJsonValue(decodeUtf8(bytes))
    const result = validateOperationSuccess(operationId, status, contentType, value)
    if (!result.valid) {
      throw new InvalidResponseError(path, requestId)
    }
    return value
  } catch (error) {
    if (error instanceof InvalidResponseError) {
      throw error
    }
    throw new InvalidResponseError(path, requestId)
  }
}

export function parseSuccessResponse(
  operationId: string,
  path: string,
  payload: Record<string, unknown> | undefined,
  response: Response,
  bytes: Uint8Array,
): ClientSuccess {
  const requestId = requestIdOf(response)
  const contentType = mediaType(response.headers.get('content-type'))
  if (isDownloadRequest(operationId, payload)) {
    return { kind: 'bytes', value: bytes, status: response.status, requestId }
  }
  if (contentType === 'text/markdown' || contentType === 'text/plain') {
    let text: string
    try {
      text = decodeUtf8(bytes)
    } catch {
      throw new InvalidResponseError(path, requestId)
    }
    const result = validateOperationSuccess(
      operationId,
      response.status,
      contentType,
      text,
    )
    if (!result.valid) {
      throw new InvalidResponseError(path, requestId)
    }
    return { kind: 'text', value: text, status: response.status, requestId }
  }
  if (contentType !== 'application/json') {
    throw new InvalidResponseError(path, requestId)
  }
  return {
    kind: 'json',
    value: validatedJson(
      operationId,
      response.status,
      contentType,
      path,
      requestId,
      bytes,
    ),
    status: response.status,
    requestId,
  }
}

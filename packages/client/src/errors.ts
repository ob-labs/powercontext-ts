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

export class ClientError extends Error {
  readonly requestId: string | undefined

  constructor(message: string, requestId?: string | undefined) {
    super(message)
    this.name = new.target.name
    this.requestId = requestId
  }
}

export class TransportError extends ClientError {
  readonly path: string

  constructor(path: string, cause?: unknown, requestId?: string) {
    super(`request to ${path} failed`, requestId)
    this.path = path
    this.cause = cause
  }
}

export class UnavailableError extends TransportError {}

export class InvalidRequestError extends ClientError {
  readonly operationId: string

  constructor(operationId: string, detail?: string) {
    const suffix = detail === undefined ? '' : `: ${detail}`
    super(`request for ${operationId} is invalid${suffix}`)
    this.operationId = operationId
  }
}

export class InvalidResponseError extends ClientError {
  readonly path: string

  constructor(path: string, requestId?: string | undefined) {
    super(`response from ${path} violated the API schema`, requestId)
    this.path = path
  }
}

export class UnknownOperationError extends ClientError {
  readonly operationId: string

  constructor(operationId: string) {
    super(`unknown PowerContext operation: ${operationId}`)
    this.operationId = operationId
  }
}

export class ServerResponseError extends ClientError {
  readonly statusCode: number
  readonly code: string | undefined
  readonly serverMessage: string | undefined
  readonly details: Record<string, unknown> | null | undefined

  constructor(options: {
    statusCode: number
    requestId?: string | undefined
    code?: string | undefined
    message?: string | undefined
    details?: Record<string, unknown> | null | undefined
  }) {
    const suffix = options.code === undefined ? '' : ` (${options.code})`
    super(
      `PowerContext Server returned HTTP ${String(options.statusCode)}${suffix}`,
      options.requestId,
    )
    this.statusCode = options.statusCode
    this.code = options.code
    this.serverMessage = options.message
    this.details = options.details
  }
}

export function isClientError(error: unknown): error is ClientError {
  return error instanceof ClientError
}

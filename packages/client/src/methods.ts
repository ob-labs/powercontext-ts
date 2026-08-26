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

import { listOperationIds, type OperationId } from '@powercontext/protocol'
import { ClientError, InvalidResponseError } from './errors.js'
import type { OperationResult, TypedClientMethods } from './operation-types.js'
import { operationPath } from './request-prepare.js'
import type { CallOptions, ClientSuccess } from './types.js'

export type TypedInvoke = (
  operationId: OperationId,
  payload: unknown,
  options?: CallOptions,
) => Promise<ClientSuccess>

function isDownloadPayload(payload: unknown): boolean {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'download' in payload &&
    payload.download === true
  )
}

export function unwrapTypedResult<Id extends OperationId>(
  operationId: Id,
  result: ClientSuccess,
): OperationResult<Id> {
  if (operationId === 'get_handoff_report') {
    if (result.kind === 'bytes') {
      throw new InvalidResponseError(operationPath(operationId), result.requestId)
    }
    return result.value as OperationResult<Id>
  }
  if (result.kind !== 'json') {
    throw new InvalidResponseError(operationPath(operationId), result.requestId)
  }
  return result.value as OperationResult<Id>
}

export function createTypedMethods(invoke: TypedInvoke): TypedClientMethods {
  const methods = {} as TypedClientMethods
  for (const operationId of listOperationIds()) {
    Object.assign(methods, {
      [operationId]: (payloadOrOptions?: unknown, maybeOptions?: CallOptions) => {
        const hasRequest =
          payloadOrOptions !== undefined &&
          !isCallOptionsOnly(operationId, payloadOrOptions)
        const payload = hasRequest ? payloadOrOptions : undefined
        const options = hasRequest
          ? maybeOptions
          : (payloadOrOptions as CallOptions | undefined)
        if (operationId === 'get_handoff_report' && isDownloadPayload(payload)) {
          throw new ClientError('use download_handoff_report when download is true')
        }
        return invoke(operationId, payload, options).then((result) =>
          unwrapTypedResult(operationId, result),
        )
      },
    })
  }
  return methods
}

function isCallOptionsOnly(operationId: OperationId, value: unknown): boolean {
  if (
    operationId !== 'get_liveness' &&
    operationId !== 'get_readiness' &&
    operationId !== 'get_capabilities'
  ) {
    return false
  }
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

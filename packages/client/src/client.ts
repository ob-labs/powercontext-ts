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

import { getOperationContract, type OperationId } from '@powercontext/protocol'
import { readLimitedBody } from './body.js'
import { isRedirectStatus } from './content-type.js'
import { InvalidResponseError } from './errors.js'
import { createTypedMethods } from './methods.js'
import type { OperationRequest, TypedClientMethods } from './operation-types.js'
import { resolveClientOptions } from './options.js'
import { operationPath, prepareRequest, resolveOperationId } from './request-prepare.js'
import { parseSuccessResponse, serverErrorFromResponse } from './response.js'
import { createRequestSignal } from './signals.js'
import { finishSpan, injectSpan, outcomeFromError, startSpan } from './tracing.js'
import { sendRequest, wrapTransportError } from './transport.js'
import type {
  CallOptions,
  ClientOptions,
  ClientSuccess,
  ResolvedClientOptions,
} from './types.js'

class PowerContextClientImpl {
  private readonly options: ResolvedClientOptions

  constructor(options: ClientOptions) {
    this.options = resolveClientOptions(options)
    Object.assign(this, createTypedMethods(this.invoke))
  }

  async request<Id extends OperationId>(
    operationId: Id | string,
    payload?: OperationRequest<Id>,
    options?: CallOptions,
  ): Promise<ClientSuccess<Id>> {
    const id = resolveOperationId(operationId)
    const timeoutMs = options?.timeoutMs ?? this.options.timeoutMs
    const requestSignal = createRequestSignal(timeoutMs, options?.signal)
    const span = startSpan(this.options.tracer, id)
    try {
      return (await this.execute(
        id,
        payload,
        options,
        requestSignal.signal,
        span,
      )) as ClientSuccess<Id>
    } finally {
      requestSignal.dispose()
    }
  }

  async download_handoff_report(
    request: OperationRequest<'get_handoff_report'>,
    options?: CallOptions,
  ): Promise<Uint8Array> {
    const payload = { ...(request as Record<string, unknown>), download: true }
    const result = await this.request('get_handoff_report', payload as never, options)
    if (result.kind !== 'bytes') {
      throw new InvalidResponseError(
        operationPath('get_handoff_report'),
        result.requestId,
      )
    }
    return result.value
  }

  private readonly invoke = (
    operationId: OperationId,
    payload: unknown,
    options?: CallOptions,
  ): Promise<ClientSuccess> => this.request(operationId, payload as never, options)

  private async execute(
    operationId: OperationId,
    payload: unknown,
    options: CallOptions | undefined,
    signal: AbortSignal,
    span: ReturnType<typeof startSpan>,
  ): Promise<ClientSuccess> {
    const prepared = prepareRequest(this.options, operationId, payload, options, signal)
    injectSpan(span, prepared.init.headers as Record<string, string>)
    try {
      const response = await sendRequest(
        this.options.fetch,
        prepared.url,
        prepared.init,
      )
      const result = await this.readResponse(
        prepared.path,
        operationId,
        prepared.payload,
        response,
      )
      finishSpan(span, 'success', { status: result.status })
      return result
    } catch (error) {
      finishSpan(span, outcomeFromError(error, options?.signal), { error })
      throw wrapTransportError(prepared.path, error)
    }
  }

  private async readResponse(
    path: string,
    operationId: OperationId,
    payload: Record<string, unknown> | undefined,
    response: Response,
  ): Promise<ClientSuccess> {
    if (isRedirectStatus(response.status)) {
      throw new InvalidResponseError(path)
    }
    const bytes = await readLimitedBody(response, this.options.maxResponseBytes)
    const declaredSuccess = getOperationContract(operationId).success.some(
      (media) => media.status === response.status,
    )
    if (!declaredSuccess) {
      throw serverErrorFromResponse(response, bytes)
    }
    return parseSuccessResponse(operationId, path, payload, response, bytes)
  }
}

export type PowerContextClient = PowerContextClientImpl & TypedClientMethods

export const PowerContextClient = PowerContextClientImpl as {
  new (options: ClientOptions): PowerContextClient
}

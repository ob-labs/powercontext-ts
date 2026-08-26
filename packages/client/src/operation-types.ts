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

import type { OperationId, operations } from '@powercontext/protocol'
import type { CallOptions } from './call-options.js'

type JsonBody<Id extends OperationId> = operations[Id] extends {
  requestBody: { content: { 'application/json': infer Body } }
}
  ? Body
  : never

type QueryParams<Id extends OperationId> = operations[Id] extends {
  parameters: { query: infer Query }
}
  ? [Query] extends [never]
    ? never
    : Query
  : never

export type OperationRequest<Id extends OperationId> = [JsonBody<Id>] extends [never]
  ? [QueryParams<Id>] extends [never]
    ? undefined
    : QueryParams<Id>
  : JsonBody<Id>

type SuccessStatus = 200 | 201 | 202

type JsonFromStatus<Response, Status extends number> = Status extends keyof Response
  ? Response[Status] extends { content: { 'application/json': infer Json } }
    ? Json
    : never
  : never

export type OperationJsonSuccess<Id extends OperationId> = JsonFromStatus<
  operations[Id]['responses'],
  SuccessStatus
>

export type OperationResult<Id extends OperationId> = Id extends 'get_handoff_report'
  ? OperationJsonSuccess<Id> | string
  : OperationJsonSuccess<Id>

export type OperationMethod<Id extends OperationId> = [OperationRequest<Id>] extends [
  undefined,
]
  ? (options?: CallOptions) => Promise<OperationResult<Id>>
  : (
      request: OperationRequest<Id>,
      options?: CallOptions,
    ) => Promise<OperationResult<Id>>

export type TypedClientMethods = {
  [Id in OperationId]: OperationMethod<Id>
}

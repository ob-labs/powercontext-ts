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

import type { OperationId } from '@powercontext/protocol'
import type { CallOptions } from './call-options.js'

export type { CallOptions }

export type FetchFn = (input: string, init: RequestInit) => Promise<Response>

export type ClientTraceOutcome = 'success' | 'failure' | 'cancelled'

export interface ClientTraceDetails {
  readonly status?: number
  readonly error?: unknown
}

export interface ClientSpanHandle {
  inject(headers: Record<string, string>): void
  finish(outcome: ClientTraceOutcome, details?: ClientTraceDetails): void
}

export interface ClientTracer {
  start(operationId: string): ClientSpanHandle
}

export interface ClientOptions {
  readonly baseUrl: string
  readonly authorization?: string
  readonly token?: string
  readonly timeoutMs?: number
  readonly fetch?: FetchFn
  readonly maxResponseBytes?: number
  readonly userAgent?: string
  readonly tracer?: ClientTracer
}

export interface ResolvedClientOptions {
  readonly baseUrl: string
  readonly authorization: string | undefined
  readonly timeoutMs: number
  readonly fetch: FetchFn
  readonly maxResponseBytes: number
  readonly userAgent: string
  readonly tracer: ClientTracer | undefined
}

export interface ClientSuccessBase {
  readonly status: number
  readonly requestId: string | undefined
}

export type ClientSuccess<_Id extends OperationId = OperationId> =
  | ({
      readonly kind: 'json'
      readonly value: unknown
    } & ClientSuccessBase)
  | ({
      readonly kind: 'text'
      readonly value: string
    } & ClientSuccessBase)
  | ({
      readonly kind: 'bytes'
      readonly value: Uint8Array
    } & ClientSuccessBase)

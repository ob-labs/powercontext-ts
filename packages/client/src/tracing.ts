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

import type {
  ClientSpanHandle,
  ClientTraceDetails,
  ClientTraceOutcome,
  ClientTracer,
} from './types.js'

const noopSpan: ClientSpanHandle = {
  inject(): void {},
  finish(): void {},
}

export function startSpan(
  tracer: ClientTracer | undefined,
  operationId: string,
): ClientSpanHandle {
  if (tracer === undefined) {
    return noopSpan
  }
  try {
    return tracer.start(operationId)
  } catch {
    return noopSpan
  }
}

export function injectSpan(
  span: ClientSpanHandle,
  headers: Record<string, string>,
): void {
  try {
    span.inject(headers)
  } catch {
    // Tracing must never fail the request.
  }
}

export function finishSpan(
  span: ClientSpanHandle,
  outcome: ClientTraceOutcome,
  details?: ClientTraceDetails,
): void {
  try {
    span.finish(outcome, details)
  } catch {
    // Tracing must never fail the request.
  }
}

export function outcomeFromError(
  error: unknown,
  signal?: AbortSignal,
): ClientTraceOutcome {
  if (
    signal?.aborted === true &&
    !(error instanceof Error && error.name === 'TimeoutError')
  ) {
    return 'cancelled'
  }
  return 'failure'
}

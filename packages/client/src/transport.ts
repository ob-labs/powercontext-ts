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

import { ClientError, UnavailableError } from './errors.js'
import { isAbortError, isTimeoutError } from './signals.js'
import type { FetchFn } from './types.js'

export function wrapTransportError(path: string, error: unknown): UnavailableError {
  if (error instanceof ClientError) {
    throw error
  }
  return new UnavailableError(path, error)
}

export function isTransportFailure(error: unknown): boolean {
  return isTimeoutError(error) || isAbortError(error)
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The operation was aborted.', 'AbortError')
}

export async function sendRequest(
  fetchImpl: FetchFn,
  url: string,
  init: RequestInit,
): Promise<Response> {
  const signal = init.signal
  if (signal === undefined || signal === null) {
    return await fetchImpl(url, init)
  }
  if (signal.aborted) {
    throw abortReason(signal)
  }
  return await new Promise<Response>((resolve, reject) => {
    const onAbort = (): void => {
      reject(abortReason(signal))
    }
    signal.addEventListener('abort', onAbort, { once: true })
    fetchImpl(url, init).then(
      (response) => {
        signal.removeEventListener('abort', onAbort)
        resolve(response)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort)
        reject(error)
      },
    )
  })
}

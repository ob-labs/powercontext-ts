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

export interface RequestSignal {
  readonly signal: AbortSignal
  dispose(): void
}

function timeoutError(): DOMException {
  return new DOMException('The operation timed out.', 'TimeoutError')
}

export function createRequestSignal(
  timeoutMs: number,
  caller?: AbortSignal,
): RequestSignal {
  const controller = new AbortController()
  const listeners: Array<{ signal: AbortSignal; handler: () => void }> = []
  const timer = setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort(timeoutError())
    }
  }, timeoutMs)

  if (caller !== undefined) {
    if (caller.aborted) {
      clearTimeout(timer)
      controller.abort(caller.reason)
    } else {
      const handler = (): void => {
        if (!controller.signal.aborted) {
          controller.abort(caller.reason)
        }
      }
      caller.addEventListener('abort', handler, { once: true })
      listeners.push({ signal: caller, handler })
    }
  }

  return {
    signal: controller.signal,
    dispose(): void {
      clearTimeout(timer)
      for (const { signal, handler } of listeners) {
        signal.removeEventListener('abort', handler)
      }
    },
  }
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError'
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

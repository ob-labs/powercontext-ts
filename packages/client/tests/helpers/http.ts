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

import type { FetchFn } from '../../src/index.js'

export function jsonResponse(
  status: number,
  body: unknown,
  headers?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export function textResponse(
  status: number,
  body: string,
  contentType = 'text/markdown',
): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': contentType },
  })
}

export function recordingFetch(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
): { fetch: FetchFn; calls: Array<{ url: string; init: RequestInit }> } {
  const calls: Array<{ url: string; init: RequestInit }> = []
  return {
    calls,
    fetch: async (url, init) => {
      calls.push({ url, init })
      return handler(url, init)
    },
  }
}

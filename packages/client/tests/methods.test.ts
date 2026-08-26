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
  OPERATION_METADATA,
  listOperationIds,
  validateOperationRequest,
} from '@powercontext/protocol'
import { describe, expect, it } from 'vitest'
import { PowerContextClient, ServerResponseError } from '../src/index.js'
import { CALL_THROUGH_REQUESTS } from './fixtures/requests.js'
import { jsonResponse, recordingFetch } from './helpers/http.js'

describe('typed Client methods', () => {
  it('exposes one typed method per operation id', () => {
    const client = new PowerContextClient({
      baseUrl: 'http://example.test',
      fetch: async () =>
        jsonResponse(401, {
          error: { code: 'unauthorized', message: 'n', details: null },
        }),
    })
    for (const id of listOperationIds()) {
      expect(typeof client[id]).toBe('function')
    }
  })

  it('keeps every call-through fixture schema-valid', () => {
    for (const id of listOperationIds()) {
      const result = validateOperationRequest(id, CALL_THROUGH_REQUESTS[id])
      expect(result.valid, `${id}: ${JSON.stringify(result.errors)}`).toBe(true)
    }
  })

  it('emits the generated method and path for every operation', async () => {
    const { fetch, calls } = recordingFetch(() =>
      jsonResponse(401, {
        error: { code: 'unauthorized', message: 'n', details: null },
      }),
    )
    const client = new PowerContextClient({
      baseUrl: 'http://example.test',
      fetch,
      timeoutMs: 1000,
    })
    for (const id of listOperationIds()) {
      await expect(
        client.request(id, CALL_THROUGH_REQUESTS[id] as never),
      ).rejects.toBeInstanceOf(ServerResponseError)
    }
    expect(calls).toHaveLength(52)
    listOperationIds().forEach((id, index) => {
      const spec = OPERATION_METADATA[id]
      expect(calls[index]?.init.method).toBe(spec.method)
      expect(calls[index]?.url.startsWith(`http://example.test${spec.path}`)).toBe(true)
      expect(Boolean(calls[index]?.init.body)).toBe(
        spec.method === 'POST' && spec.location === 'body',
      )
    })
  })
})

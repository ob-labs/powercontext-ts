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

import { describe, expect, it } from 'vitest'
import {
  PowerContextClient,
  type ClientSpanHandle,
  type ClientTracer,
} from '../src/index.js'
import { jsonResponse, recordingFetch } from './helpers/http.js'

describe('OpenTelemetry injection hook', () => {
  it('injects tracer headers without requiring an SDK', async () => {
    const finishes: string[] = []
    const tracer: ClientTracer = {
      start(operationId): ClientSpanHandle {
        return {
          inject(headers): void {
            headers['traceparent'] = `00-${operationId}-01`
          },
          finish(outcome): void {
            finishes.push(`${operationId}:${outcome}`)
          },
        }
      },
    }
    const { fetch, calls } = recordingFetch(() => jsonResponse(200, { status: 'ok' }))
    const client = new PowerContextClient({
      baseUrl: 'http://127.0.0.1:8000',
      fetch,
      tracer,
    })
    await client.get_liveness()
    expect(new Headers(calls[0]?.init.headers).get('traceparent')).toBe(
      '00-get_liveness-01',
    )
    expect(finishes).toEqual(['get_liveness:success'])
  })

  it('swallows tracer failures so the request still proceeds', async () => {
    const tracer: ClientTracer = {
      start(): ClientSpanHandle {
        throw new Error('otel missing')
      },
    }
    const client = new PowerContextClient({
      baseUrl: 'http://127.0.0.1:8000',
      fetch: async () => jsonResponse(200, { status: 'ok' }),
      tracer,
    })
    await expect(client.get_liveness()).resolves.toMatchObject({ status: 'ok' })
  })
})

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

import { getOperationContract, listOperationIds } from '@powercontext/protocol'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PowerContextClient, ServerResponseError } from '../src/index.js'
import { CALL_THROUGH_REQUESTS, SCOPE_ID } from './fixtures/requests.js'
import {
  oracleEnvironmentReady,
  startPinnedPythonServer,
  type StartedPythonServer,
} from './helpers/python-server.js'

const required = process.env['POWERCONTEXT_CLIENT_CALLTHROUGH'] === '1'

describe.skipIf(!oracleEnvironmentReady() && !required)(
  'TypeScript Client -> Python Server call-through',
  () => {
    let server: StartedPythonServer
    let client: PowerContextClient

    beforeAll(async () => {
      if (!oracleEnvironmentReady()) {
        throw new Error(
          'POWERCONTEXT_CLIENT_CALLTHROUGH=1 requires a bootstrapped oracle environment',
        )
      }
      server = await startPinnedPythonServer()
      client = new PowerContextClient({
        baseUrl: server.baseUrl,
        timeoutMs: 15_000,
      })
    }, 90_000)

    afterAll(async () => {
      await server?.stop()
    })

    it(
      'reaches liveness, readiness and capabilities',
      { timeout: 30_000 },
      async () => {
        const live = await client.get_liveness()
        expect(live).toMatchObject({ status: 'ok' })
        const ready = await client.get_readiness()
        expect(['ready', 'degraded']).toContain(ready.status)
        const capabilities = await client.get_capabilities()
        expect(capabilities).toBeTypeOf('object')
      },
    )

    it(
      'remembers, searches, prepares and captures over HTTP',
      { timeout: 60_000 },
      async () => {
        const text = 'Keep the official Client on the public HTTP contract.'
        const remembered = await client.remember_memory({
          scope_id: SCOPE_ID,
          kind: 'decision',
          text,
        })
        expect(remembered.memory.family).toBe('memory')
        const found = await client.search_memory({
          scope_id: SCOPE_ID,
          query: 'official Client public HTTP',
        })
        expect(found.hits.some((hit) => hit.text === text)).toBe(true)
        const prepared = await client.prepare_context({
          scope_id: SCOPE_ID,
          query: 'official Client public HTTP',
        })
        expect(typeof prepared.content === 'string' || prepared.content === null).toBe(
          true,
        )
        const captured = await client.capture_content_source({
          scope_id: SCOPE_ID,
          source_id: 'client-e2e-turn-1',
          content: 'Call through the official Client without a model.',
        })
        expect(captured.status).toBe('accepted')
      },
    )

    it(
      'covers all 52 operations against the pinned Python Server',
      { timeout: 180_000 },
      async () => {
        const seen = new Set<string>()
        for (const id of listOperationIds()) {
          try {
            await client.request(id, CALL_THROUGH_REQUESTS[id] as never)
            seen.add(id)
          } catch (error) {
            expect(error, id).toBeInstanceOf(ServerResponseError)
            if (!(error instanceof ServerResponseError)) {
              throw error
            }
            const declaredErrorStatuses = getOperationContract(id).errors.map(
              (media) => media.status,
            )
            expect(declaredErrorStatuses, id).toContain(error.statusCode)
            seen.add(id)
          }
        }
        expect(seen.size).toBe(52)
      },
    )
  },
)

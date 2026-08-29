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

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ExperimentalHttpServer } from '../src/index.js'
import { experimentalServe } from '../src/serve.js'

describe('experimental serve entry', () => {
  let server: ExperimentalHttpServer | undefined
  let directory: string | undefined

  afterEach(async () => {
    await server?.close()
    server = undefined
    if (directory !== undefined) {
      rmSync(directory, { recursive: true, force: true })
      directory = undefined
    }
    vi.restoreAllMocks()
  })

  it('binds loopback and prints the shared REST/MCP base URL', async () => {
    directory = mkdtempSync(join(tmpdir(), 'powercontext-serve-'))
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    server = await experimentalServe({
      dbPath: join(directory, 'runtime.sqlite3'),
      port: 0,
    })
    const address = server.app.server.address()
    if (address === null || typeof address === 'string') {
      throw new Error('experimental serve did not expose a TCP address')
    }
    expect(address.address).toBe('127.0.0.1')
    expect(output).toHaveBeenCalledWith(`http://127.0.0.1:${String(address.port)}`)
    const live = await fetch(`http://127.0.0.1:${String(address.port)}/health/live`)
    expect(live.status).toBe(200)
    const mcp = await fetch(`http://127.0.0.1:${String(address.port)}/mcp`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'serve-test', version: '0.0.0' },
        },
      }),
    })
    expect(mcp.status).toBe(200)
  })
})

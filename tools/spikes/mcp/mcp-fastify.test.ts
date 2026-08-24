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

import { readFileSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

describe('MCP spike C pins', () => {
  it('locks the official TypeScript SDK v2 and Fastify adapter', () => {
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      devDependencies: Record<string, string>
    }
    expect(manifest.devDependencies['@modelcontextprotocol/server']).toBe('2.0.0')
    expect(manifest.devDependencies['@modelcontextprotocol/fastify']).toBe('2.0.0')
    expect(manifest.devDependencies['@modelcontextprotocol/node']).toBe('2.0.0')
  })

  it('can construct an in-process MCP server with one allowlisted tool', async () => {
    const [
      { createMcpFastifyApp },
      { NodeStreamableHTTPServerTransport },
      { McpServer },
    ] = await Promise.all([
      import('@modelcontextprotocol/fastify'),
      import('@modelcontextprotocol/node'),
      import('@modelcontextprotocol/server'),
    ])
    const app = createMcpFastifyApp()
    const server = new McpServer({
      name: 'powercontext-spike',
      version: '0.0.0',
    })
    server.registerTool(
      'search_memory',
      {
        title: 'Search memory',
        description: 'Allowlisted read-only probe',
      },
      async () => ({
        content: [{ type: 'text', text: 'spike' }],
      }),
    )
    app.post('/mcp', async (request, reply) => {
      const transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      })
      await server.connect(transport)
      reply.raw.on('close', () => {
        void transport.close()
      })
      await transport.handleRequest(request.raw, reply.raw, request.body)
    })
    try {
      await app.listen({ host: '127.0.0.1', port: 0 })
      const address = app.server.address() as AddressInfo
      const response = await fetch(`http://127.0.0.1:${String(address.port)}/mcp`, {
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
            clientInfo: { name: 'phase-1-spike', version: '0.0.0' },
          },
        }),
      })
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/event-stream')
      const dataLine = (await response.text())
        .split(/\r?\n/)
        .find((line) => line.startsWith('data: '))
      expect(dataLine).toBeDefined()
      const payload = JSON.parse(dataLine?.slice('data: '.length) ?? '') as {
        result: { protocolVersion: string; serverInfo: { name: string } }
      }
      expect(payload.result.protocolVersion).toBe('2025-03-26')
      expect(payload.result.serverInfo.name).toBe('powercontext-spike')
    } finally {
      await server.close()
      await app.close()
    }
  })
})

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
import { afterEach, describe, expect, it } from 'vitest'
import {
  EXPERIMENTAL_MCP_TOOL_IDS,
  listen,
  type ExperimentalHttpServer,
} from '../src/index.js'

type JsonRpcResponse = {
  readonly result?: unknown
  readonly error?: { readonly code: number; readonly message: string }
}

type McpResponse = {
  readonly message: JsonRpcResponse
  readonly sessionId: string | null
}

function parseMcpResponse(response: Response, text: string): JsonRpcResponse {
  if (response.headers.get('content-type')?.includes('text/event-stream') === true) {
    const dataLine = text.split(/\r?\n/).find((line) => line.startsWith('data: '))
    if (dataLine === undefined) {
      throw new Error(`MCP response did not contain an SSE data event: ${text}`)
    }
    return JSON.parse(dataLine.slice('data: '.length)) as JsonRpcResponse
  }
  return JSON.parse(text) as JsonRpcResponse
}

describe('experimental subset MCP Server', () => {
  const servers: ExperimentalHttpServer[] = []
  const directories: string[] = []

  afterEach(async () => {
    for (const server of servers.splice(0)) {
      await server.close()
    }
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  async function start(): Promise<string> {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-mcp-'))
    directories.push(directory)
    const server = await listen({
      host: '127.0.0.1',
      port: 0,
      dbPath: join(directory, 'runtime.sqlite3'),
    })
    servers.push(server)
    const address = server.app.server.address()
    if (address === null || typeof address === 'string') {
      throw new Error('MCP test server did not expose a TCP address')
    }
    return `http://127.0.0.1:${String(address.port)}/mcp`
  }

  async function request(
    url: string,
    body: Record<string, unknown>,
    sessionId?: string,
  ): Promise<McpResponse> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
        'mcp-protocol-version': '2025-03-26',
        ...(sessionId === undefined ? {} : { 'mcp-session-id': sessionId }),
      },
      body: JSON.stringify(body),
    })
    expect(response.status).toBeLessThan(300)
    return {
      message: parseMcpResponse(response, await response.text()),
      sessionId: response.headers.get('mcp-session-id'),
    }
  }

  async function initialize(url: string): Promise<McpResponse> {
    return request(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'powercontext-test', version: '0.0.0' },
      },
    })
  }

  async function callTool(
    url: string,
    id: number,
    name: string,
    args: Record<string, unknown>,
    sessionId: string,
  ): Promise<{
    readonly content: readonly { readonly type: string; readonly text: string }[]
    readonly isError?: boolean
  }> {
    const response = await request(
      url,
      {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name, arguments: args },
      },
      sessionId,
    )
    expect(response.message.error).toBeUndefined()
    return response.message.result as {
      readonly content: readonly { readonly type: string; readonly text: string }[]
      readonly isError?: boolean
    }
  }

  function toolJson(result: {
    readonly content: readonly { readonly type: string; readonly text: string }[]
  }): unknown {
    const text = result.content.find((content) => content.type === 'text')?.text
    if (text === undefined) {
      throw new Error('MCP tool result did not contain text JSON')
    }
    return JSON.parse(text) as unknown
  }

  it('negotiates the pinned protocol and lists exactly five implemented tools', async () => {
    const url = await start()
    const initialized = await initialize(url)
    expect(initialized.message.result).toMatchObject({
      protocolVersion: '2025-03-26',
      serverInfo: { name: '@powercontext/server-experimental' },
    })
    expect(initialized.sessionId).toEqual(expect.any(String))
    const sessionId = initialized.sessionId
    if (sessionId === null) {
      throw new Error('MCP initialize did not return a session ID')
    }
    const stream = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'text/event-stream',
        'mcp-protocol-version': '2025-03-26',
        'mcp-session-id': sessionId,
      },
    })
    expect(stream.status).toBe(200)
    expect(stream.headers.get('content-type')).toContain('text/event-stream')
    expect(stream.headers.get('mcp-session-id')).toBe(sessionId)
    await stream.body?.cancel()
    const listed = await request(
      url,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      },
      sessionId,
    )
    const toolNames = (
      listed.message.result as {
        readonly tools: readonly { readonly name: string }[]
      }
    ).tools.map((tool) => tool.name)
    expect(toolNames).toEqual([...EXPERIMENTAL_MCP_TOOL_IDS])
    expect(toolNames).not.toContain('prepare_context')
    expect(toolNames).not.toContain('create_work_contract')
    expect(toolNames).not.toContain('revise_memory_entry')

    const secondSession = await initialize(url)
    expect(secondSession.sessionId).toEqual(expect.any(String))
    expect(secondSession.sessionId).not.toBe(sessionId)
    const secondList = await request(
      url,
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/list',
        params: {},
      },
      secondSession.sessionId ?? undefined,
    )
    expect(
      (
        secondList.message.result as {
          readonly tools: readonly { readonly name: string }[]
        }
      ).tools.map((tool) => tool.name),
    ).toEqual([...EXPERIMENTAL_MCP_TOOL_IDS])
  })

  it('captures, remembers, and finds CJK Memory through real MCP tools', async () => {
    const url = await start()
    const initialized = await initialize(url)
    const sessionId = initialized.sessionId
    expect(sessionId).toEqual(expect.any(String))
    if (sessionId === null) {
      throw new Error('MCP initialize did not return a session ID')
    }
    const captured = await callTool(
      url,
      2,
      'capture_content_source',
      {
        scope_id: 'mcp-scope',
        source_id: 'source-1',
        content: 'captured without extraction',
      },
      sessionId,
    )
    expect(toolJson(captured)).toMatchObject({
      status: 'accepted',
      source: { name: 'content', source_id: 'source-1' },
      position: 1,
    })
    const beforeRemember = await callTool(
      url,
      3,
      'list_memory_entries',
      { scope_id: 'mcp-scope' },
      sessionId,
    )
    expect(toolJson(beforeRemember)).toMatchObject({ entries: [] })
    const remembered = await callTool(
      url,
      4,
      'remember_memory',
      {
        scope_id: 'mcp-scope',
        kind: 'note',
        text: '中文 through MCP',
      },
      sessionId,
    )
    const rememberedJson = toolJson(remembered) as {
      readonly entry: { readonly citation: Record<string, unknown> }
    }
    const searched = await callTool(
      url,
      5,
      'search_memory',
      { scope_id: 'mcp-scope', query: '中文' },
      sessionId,
    )
    expect(toolJson(searched)).toMatchObject({
      mode: 'fts',
      hits: [{ text: '中文 through MCP' }],
    })
    const fetched = await callTool(
      url,
      6,
      'get_memory_entry',
      {
        scope_id: 'mcp-scope',
        citation: rememberedJson.entry.citation,
      },
      sessionId,
    )
    expect(toolJson(fetched)).toMatchObject({ text: '中文 through MCP' })
    const unavailable = await callTool(
      url,
      7,
      'search_memory',
      { scope_id: 'mcp-scope', query: '中文', mode: 'vector' },
      sessionId,
    )
    expect(unavailable.isError).toBe(true)
    expect(unavailable.content[0]?.text).toContain('unavailable')
    const hybridUnavailable = await callTool(
      url,
      8,
      'search_memory',
      { scope_id: 'mcp-scope', query: '中文', mode: 'hybrid' },
      sessionId,
    )
    expect(hybridUnavailable.isError).toBe(true)
    expect(hybridUnavailable.content[0]?.text).toContain('unavailable')
  })
})

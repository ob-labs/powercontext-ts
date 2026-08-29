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
import { utf8ByteLength } from '../../core/src/index.js'
import { PowerContextClient } from '../../client/src/index.js'
import { listen, type ExperimentalHttpServer } from '../src/index.js'

describe('experimental subset HTTP Server', () => {
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

  async function start(): Promise<{
    server: ExperimentalHttpServer
    client: PowerContextClient
  }> {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-http-'))
    directories.push(directory)
    const server = await listen({
      host: '127.0.0.1',
      port: 0,
      dbPath: join(directory, 'runtime.sqlite3'),
    })
    servers.push(server)
    const address = server.app.server.address()
    if (address === null || typeof address === 'string') {
      throw new Error('test server did not expose a TCP address')
    }
    return {
      server,
      client: new PowerContextClient({
        baseUrl: `http://127.0.0.1:${String(address.port)}`,
      }),
    }
  }

  it('serves liveness, readiness, capabilities, and request IDs', async () => {
    const { server, client } = await start()
    const live = await client.get_liveness()
    expect(live.status).toBe('ok')
    const ready = await client.get_readiness()
    expect(ready.status).toBe('ready')
    const capabilities = await client.get_capabilities()
    expect(capabilities.search_modes).toEqual(['fts'])
    expect(capabilities.memory_extraction).toBe(false)
    expect(capabilities.handoff_generation).toBe(false)
    expect(capabilities.context_versions).toContain('powercontext.prepared-context.v1')
    const response = await server.app.inject({ method: 'GET', url: '/health/live' })
    expect(response.headers['x-powercontext-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('appends content positions across restart without extracting Memory', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-capture-restart-'))
    directories.push(directory)
    const dbPath = join(directory, 'runtime.sqlite3')
    const first = await listen({ host: '127.0.0.1', port: 0, dbPath })
    servers.push(first)
    const firstAddress = first.app.server.address()
    if (firstAddress === null || typeof firstAddress === 'string') {
      throw new Error('first capture server did not expose a TCP address')
    }
    const firstClient = new PowerContextClient({
      baseUrl: `http://127.0.0.1:${String(firstAddress.port)}`,
    })
    const firstCapture = await firstClient.capture_content_source({
      scope_id: 'http-scope',
      source_id: 'source-1',
      content: 'first content',
    })
    expect(firstCapture).toEqual({
      status: 'accepted',
      source: { name: 'content', source_id: 'source-1' },
      position: 1,
    })
    const secondCapture = await firstClient.capture_content_source({
      scope_id: 'http-scope',
      source_id: 'source-1',
      content: 'second content',
    })
    expect(secondCapture.position).toBe(2)
    expect(
      await firstClient.list_memory_entries({ scope_id: 'http-scope' }),
    ).toMatchObject({ entries: [] })
    expect(
      await firstClient.search_memory({ scope_id: 'http-scope', query: 'content' }),
    ).toMatchObject({ hits: [] })
    await first.close()
    servers.splice(servers.indexOf(first), 1)

    const second = await listen({ host: '127.0.0.1', port: 0, dbPath })
    servers.push(second)
    const secondAddress = second.app.server.address()
    if (secondAddress === null || typeof secondAddress === 'string') {
      throw new Error('second capture server did not expose a TCP address')
    }
    const secondClient = new PowerContextClient({
      baseUrl: `http://127.0.0.1:${String(secondAddress.port)}`,
    })
    const thirdCapture = await secondClient.capture_content_source({
      scope_id: 'http-scope',
      source_id: 'source-1',
      content: 'third content',
    })
    expect(thirdCapture.position).toBe(3)
    await secondClient.remember_memory({
      scope_id: 'http-scope',
      kind: 'note',
      text: 'remembered separately',
    })
    expect(
      await secondClient.list_memory_entries({ scope_id: 'http-scope' }),
    ).toMatchObject({ entries: [{ text: 'remembered separately' }] })
  })

  it('prepares matching CJK memory as a bounded ready context', async () => {
    const { client } = await start()
    await client.remember_memory({
      scope_id: 'http-scope',
      kind: 'note',
      text: '中文 context hit',
    })
    const prepared = await client.prepare_context({
      scope_id: 'http-scope',
      query: '中文',
    })
    expect(prepared.status).toBe('ready')
    expect(prepared.schema).toBe('powercontext.prepared-context.v1')
    expect(prepared.content).toContain('中文 context hit')
    if (prepared.content === null) {
      throw new Error('prepared context did not contain content')
    }
    expect(prepared.content_bytes).toBe(utf8ByteLength(prepared.content))
  })

  it('returns an honest empty context when no memory matches', async () => {
    const { client } = await start()
    const prepared = await client.prepare_context({
      scope_id: 'http-scope',
      query: 'no matching memory',
    })
    expect(prepared).toEqual({
      schema: 'powercontext.prepared-context.v1',
      status: 'empty',
      content: null,
      content_bytes: 0,
    })
  })

  it('skips an oversized hit instead of truncating it', async () => {
    const { client } = await start()
    await client.remember_memory({
      scope_id: 'http-scope',
      kind: 'note',
      text: 'a'.repeat(513),
    })
    const prepared = await client.prepare_context({
      scope_id: 'http-scope',
      query: 'a',
      max_bytes: 512,
    })
    expect(prepared).toEqual({
      schema: 'powercontext.prepared-context.v1',
      status: 'empty',
      content: null,
      content_bytes: 0,
    })
  })

  it('rejects max_bytes outside the protocol budget', async () => {
    const { server } = await start()
    const response = await server.app.inject({
      method: 'POST',
      url: '/v1/context/prepare',
      payload: {
        scope_id: 'http-scope',
        query: 'memory',
        max_bytes: 511,
      },
    })
    expect(response.statusCode).toBe(422)
    expect(response.json()).toMatchObject({
      error: { code: 'invalid_request' },
    })
  })

  it('remembers and finds CJK text after a close and new listen', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-http-restart-'))
    directories.push(directory)
    const dbPath = join(directory, 'runtime.sqlite3')
    const first = await listen({ host: '127.0.0.1', port: 0, dbPath })
    servers.push(first)
    const firstAddress = first.app.server.address()
    if (firstAddress === null || typeof firstAddress === 'string') {
      throw new Error('first test server did not expose a TCP address')
    }
    const firstClient = new PowerContextClient({
      baseUrl: `http://127.0.0.1:${String(firstAddress.port)}`,
    })
    const remembered = await firstClient.remember_memory({
      scope_id: 'http-scope',
      kind: 'note',
      text: '中文 over HTTP',
    })
    await first.close()
    servers.splice(servers.indexOf(first), 1)

    const second = await listen({ host: '127.0.0.1', port: 0, dbPath })
    servers.push(second)
    const secondAddress = second.app.server.address()
    if (secondAddress === null || typeof secondAddress === 'string') {
      throw new Error('second test server did not expose a TCP address')
    }
    const secondClient = new PowerContextClient({
      baseUrl: `http://127.0.0.1:${String(secondAddress.port)}`,
    })
    const found = await secondClient.search_memory({
      scope_id: 'http-scope',
      query: '中文',
    })
    expect(found.hits.map((hit) => hit.text)).toContain('中文 over HTTP')
    const listed = await secondClient.list_memory_entries({ scope_id: 'http-scope' })
    expect(listed.entries).toHaveLength(1)
    if (remembered.entry === undefined) {
      throw new Error('remember response did not include its entry')
    }
    const fetched = await secondClient.get_memory_entry({
      scope_id: 'http-scope',
      citation: remembered.entry.citation,
    })
    expect(fetched.text).toBe('中文 over HTTP')
    expect(remembered.memory.family).toBe('memory')
  })

  it('reports vector and hybrid as unavailable and does not register work routes', async () => {
    const { client } = await start()
    await expect(
      client.search_memory({ scope_id: 'http-scope', query: '中文', mode: 'vector' }),
    ).rejects.toMatchObject({
      statusCode: 503,
      code: 'unavailable',
    })
    await expect(
      client.search_memory({ scope_id: 'http-scope', query: '中文', mode: 'hybrid' }),
    ).rejects.toMatchObject({
      statusCode: 503,
      code: 'unavailable',
    })
    await expect(
      client.request('create_work_contract', {
        scope_id: 'http-scope',
        source_id: 'source-1',
        contract: {
          schema: 'powercontext.work-contract.v1',
          trust: 'untrusted_input',
          objective: 'test objective',
          facts: [],
          in_scope: ['test'],
          exclusions: [],
          completion_criteria: ['done'],
          authorization_notes: [],
          open_questions: [],
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'unavailable',
    })
  })

  it('maps runtime source refs to SourceReference names on the wire', async () => {
    const { server, client } = await start()
    const runtime = server.runtime
    if (runtime === undefined) {
      throw new Error('server runtime was not ready')
    }
    const entry = await runtime.remember({
      scope_id: 'http-scope',
      kind: 'note',
      text: 'source ref mapping',
      source_refs: [{ sourceType: 'content', sourceId: 'source-1' }],
    })
    const listed = await client.list_memory_entries({ scope_id: 'http-scope' })
    expect(listed.entries).toHaveLength(1)
    expect(listed.entries[0]?.source_refs).toEqual([
      { name: 'content', source_id: 'source-1' },
    ])
    const fetched = await client.get_memory_entry({
      scope_id: 'http-scope',
      citation: {
        memory_ref: {
          family: 'memory',
          artifact_id: entry.artifact.artifactId,
          revision: entry.artifact.revision,
        },
        entry_id: entry.entry_id,
        entry_version_id: entry.entry_id,
      },
    })
    expect(fetched.source_refs).toEqual([{ name: 'content', source_id: 'source-1' }])
  })
})

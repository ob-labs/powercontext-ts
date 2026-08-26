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
  CLIENT_USER_AGENT,
  InvalidRequestError,
  InvalidResponseError,
  PowerContextClient,
  ServerResponseError,
  UnavailableError,
  UnknownOperationError,
} from '../src/index.js'
import { jsonResponse, recordingFetch, textResponse } from './helpers/http.js'

function clientWith(
  fetchImpl: (url: string, init: RequestInit) => Response | Promise<Response>,
  extra?: {
    token?: string
    timeoutMs?: number
    maxResponseBytes?: number
  },
): PowerContextClient {
  return new PowerContextClient({
    baseUrl: 'http://127.0.0.1:8000/',
    fetch: async (url, init) => fetchImpl(url, init),
    timeoutMs: extra?.timeoutMs ?? 1000,
    ...(extra?.token === undefined ? {} : { token: extra.token }),
    ...(extra?.maxResponseBytes === undefined
      ? {}
      : { maxResponseBytes: extra.maxResponseBytes }),
  })
}

describe('PowerContextClient transport', () => {
  it('normalizes the base URL and rejects credentials or query tokens', () => {
    expect(
      () => new PowerContextClient({ baseUrl: 'https://user:secret@example.test' }),
    ).toThrow(/credentials/)
    expect(
      () =>
        new PowerContextClient({ baseUrl: 'https://example.test/api?token=secret' }),
    ).toThrow(/query/)
    expect(() => new PowerContextClient({ baseUrl: 'ftp://example.test' })).toThrow(
      /http/,
    )
  })

  it('POSTs JSON, Authorization, User-Agent and captures the request ID', async () => {
    const { fetch, calls } = recordingFetch(() =>
      jsonResponse(
        200,
        { memory: { family: 'memory', artifact_id: 'm1', revision: 1 } },
        { 'X-PowerContext-Request-ID': 'req-1' },
      ),
    )
    const client = clientWith(fetch, { token: 'secret-token' })
    const result = await client.request('remember_memory', {
      scope_id: 'project:demo',
      kind: 'decision',
      text: 'keep API async',
    })
    expect(result).toMatchObject({ kind: 'json', status: 200, requestId: 'req-1' })
    expect(calls).toHaveLength(1)
    const headers = new Headers(calls[0]?.init.headers)
    expect(calls[0]?.url).toBe('http://127.0.0.1:8000/v1/memory/remember')
    expect(calls[0]?.init.method).toBe('POST')
    expect(calls[0]?.init.redirect).toBe('manual')
    expect(headers.get('Authorization')).toBe('Bearer secret-token')
    expect(headers.get('User-Agent')).toBe(CLIENT_USER_AGENT)
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('sends get_stats as a GET query string without a body', async () => {
    const { fetch, calls } = recordingFetch(() =>
      jsonResponse(401, {
        error: { code: 'unauthorized', message: 'missing token', details: null },
      }),
    )
    const client = clientWith(fetch)
    await expect(
      client.request('get_stats', { scope_id: 'project:demo', period: '7d' }),
    ).rejects.toBeInstanceOf(ServerResponseError)
    expect(calls[0]?.url).toBe(
      'http://127.0.0.1:8000/v1/stats?scope_id=project%3Ademo&period=7d',
    )
    expect(calls[0]?.init.method).toBe('GET')
    expect(calls[0]?.init.body).toBeUndefined()
  })

  it('returns markdown text and raw bytes for get_handoff_report', async () => {
    const markdown = clientWith(() => textResponse(200, '# Report'))
    await expect(
      markdown.request('get_handoff_report', { project_id: 'p1', format: 'markdown' }),
    ).resolves.toMatchObject({ kind: 'text', value: '# Report' })
    const bytesClient = clientWith(
      () => new Response(new Uint8Array([1, 2, 3]), { status: 200 }),
    )
    const downloaded = await bytesClient.request('get_handoff_report', {
      project_id: 'p1',
      download: true,
    })
    expect(downloaded.kind).toBe('bytes')
    if (downloaded.kind === 'bytes') {
      expect([...downloaded.value]).toEqual([1, 2, 3])
    }
    await expect(
      bytesClient.download_handoff_report({ project_id: 'p1' }),
    ).resolves.toBeInstanceOf(Uint8Array)
  })

  it('maps server errors, unknown operations and invalid requests', async () => {
    const client = clientWith(() =>
      jsonResponse(
        409,
        { error: { code: 'conflict', message: 'citation mismatch', details: null } },
        { 'X-PowerContext-Request-ID': 'req-9' },
      ),
    )
    await expect(
      client.request('revise_memory_entry', {
        scope_id: 'project:demo',
        citation: {
          memory_ref: { family: 'memory', artifact_id: 'm1', revision: 1 },
          entry_id: 'e1',
          entry_version_id: 'v1',
        },
        kind: 'decision',
        text: 'next',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'conflict',
      requestId: 'req-9',
    } satisfies Partial<ServerResponseError>)
    await expect(client.request('not_an_operation')).rejects.toBeInstanceOf(
      UnknownOperationError,
    )
    await expect(
      client.request('get_liveness', { extra: true } as never),
    ).rejects.toBeInstanceOf(InvalidRequestError)
  })

  it('maps an undeclared 2xx status to a server response error', async () => {
    const client = clientWith(() =>
      jsonResponse(200, {
        status: 'accepted',
        source_id: 'source-1',
      }),
    )
    await expect(
      client.capture_content_source({
        scope_id: 'project:demo',
        source_id: 'source-1',
        content: 'capture me',
      }),
    ).rejects.toMatchObject({ statusCode: 200 } satisfies Partial<ServerResponseError>)
  })

  it('maps network failure, timeout, abort, redirect and oversize', async () => {
    const down = clientWith(() => {
      throw new TypeError('fetch failed')
    })
    await expect(down.request('get_liveness')).rejects.toBeInstanceOf(UnavailableError)

    const redirected = clientWith(
      () =>
        new Response(null, {
          status: 302,
          headers: { Location: 'https://evil.example' },
        }),
    )
    await expect(redirected.request('get_liveness')).rejects.toBeInstanceOf(
      InvalidResponseError,
    )

    const oversized = clientWith(() => new Response('x'.repeat(32), { status: 200 }), {
      maxResponseBytes: 16,
    })
    await expect(oversized.request('get_liveness')).rejects.toBeInstanceOf(
      InvalidResponseError,
    )

    const delayed = clientWith(() => new Promise(() => undefined), { timeoutMs: 20 })
    await expect(delayed.request('get_liveness')).rejects.toBeInstanceOf(
      UnavailableError,
    )

    const controller = new AbortController()
    controller.abort()
    const aborted = clientWith(() => jsonResponse(200, { status: 'ok' }))
    await expect(
      aborted.request('get_liveness', undefined, { signal: controller.signal }),
    ).rejects.toBeInstanceOf(UnavailableError)
  })

  it('rejects invalid JSON and extra fields on success bodies', async () => {
    const invalidJson = clientWith(
      () =>
        new Response('{', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )
    await expect(invalidJson.request('get_liveness')).rejects.toBeInstanceOf(
      InvalidResponseError,
    )
    const extra = clientWith(() =>
      jsonResponse(
        200,
        { status: 'ok', unexpected: true },
        {
          'X-PowerContext-Request-ID': 'request-123',
        },
      ),
    )
    await expect(extra.request('get_liveness')).rejects.toMatchObject({
      requestId: 'request-123',
    })
  })

  it('rejects invalid UTF-8 in JSON and text success bodies', async () => {
    const invalidBytes = new Uint8Array([0xc3, 0x28])
    const invalidJson = clientWith(
      () =>
        new Response(invalidBytes, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )
    await expect(invalidJson.get_liveness()).rejects.toBeInstanceOf(
      InvalidResponseError,
    )

    const invalidText = clientWith(
      () =>
        new Response(invalidBytes, {
          status: 200,
          headers: { 'Content-Type': 'text/markdown' },
        }),
    )
    await expect(
      invalidText.get_handoff_report({ project_id: 'p1' }),
    ).rejects.toBeInstanceOf(InvalidResponseError)
  })
})

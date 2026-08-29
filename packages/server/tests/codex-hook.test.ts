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

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import {
  deriveScopeId,
  runUserPromptSubmit,
} from '../codex-plugin/plugins/powercontext-experimental/scripts/user-prompt-submit.mjs'

const INPUT = {
  cwd: process.cwd(),
  hook_event_name: 'UserPromptSubmit',
  model: 'test',
  permission_mode: 'default',
  prompt: 'Find 中文 memory',
  session_id: 'session-1',
  transcript_path: null,
  turn_id: 'turn-1',
}

describe('experimental Codex UserPromptSubmit hook', () => {
  it('prepares context and captures the prompt in the same derived scope', async () => {
    const calls: { readonly url: string; readonly body: Record<string, unknown> }[] = []
    const fetchImpl = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        calls.push({
          url,
          body: JSON.parse(String(init?.body)) as Record<string, unknown>,
        })
        return Response.json(
          url.endsWith('/v1/context/prepare')
            ? {
                schema: 'powercontext.prepared-context.v1',
                status: 'ready',
                content: 'remembered context',
                content_bytes: 18,
              }
            : {
                status: 'accepted',
                source: { name: 'content', source_id: 'source' },
                position: 1,
              },
        )
      },
    )

    const result = await runUserPromptSubmit(INPUT, {
      fetchImpl,
      env: { POWERCONTEXT_BASE_URL: 'http://127.0.0.1:9999/' },
    })

    expect(result.errors).toEqual([])
    expect(result.output).toEqual({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: 'remembered context',
      },
    })
    expect(calls.map((call) => call.url)).toEqual([
      'http://127.0.0.1:9999/v1/context/prepare',
      'http://127.0.0.1:9999/v1/sources/content',
    ])
    expect(calls[0]?.body).toEqual({
      scope_id: deriveScopeId(INPUT.cwd),
      query: INPUT.prompt,
    })
    expect(calls[1]?.body).toMatchObject({
      scope_id: deriveScopeId(INPUT.cwd),
      content: INPUT.prompt,
      metadata: { host: 'codex', cwd: INPUT.cwd },
    })
  })

  it('fails open and reports prepare and capture failures', async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      if (String(input).endsWith('/v1/context/prepare')) {
        return new Response('unavailable', { status: 503 })
      }
      throw new Error('connection refused')
    })

    const result = await runUserPromptSubmit(INPUT, {
      fetchImpl,
      env: { POWERCONTEXT_SCOPE_ID: 'documented-default' },
    })

    expect(result.output).toEqual({
      continue: true,
      hookSpecificOutput: { hookEventName: 'UserPromptSubmit' },
    })
    expect(
      [...result.errors].sort((left, right) =>
        left.operation.localeCompare(right.operation),
      ),
    ).toEqual([
      expect.objectContaining({
        operation: 'capture_content_source',
        error: 'connection refused',
      }),
      expect.objectContaining({ operation: 'prepare_context', error: 'HTTP 503' }),
    ])
  })

  it('exits zero with JSON stderr diagnostics when the Server is down', () => {
    const script = fileURLToPath(
      new URL(
        '../codex-plugin/plugins/powercontext-experimental/scripts/user-prompt-submit.mjs',
        import.meta.url,
      ),
    )
    const result = spawnSync(process.execPath, [script], {
      encoding: 'utf8',
      input: JSON.stringify(INPUT),
      env: {
        ...process.env,
        POWERCONTEXT_BASE_URL: 'http://127.0.0.1:1',
        POWERCONTEXT_HOOK_TIMEOUT_MS: '100',
      },
    })

    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout)).toEqual({
      continue: true,
      hookSpecificOutput: { hookEventName: 'UserPromptSubmit' },
    })
    const diagnostics = result.stderr
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { readonly operation: string })
    expect(diagnostics.map((diagnostic) => diagnostic.operation).sort()).toEqual([
      'capture_content_source',
      'prepare_context',
    ])
  })
})

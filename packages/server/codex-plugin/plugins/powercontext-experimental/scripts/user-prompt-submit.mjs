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

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_BASE_URL = 'http://127.0.0.1:8787'
const DEFAULT_TIMEOUT_MS = 2000

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function gitRoot(cwd) {
  try {
    return execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return resolve(cwd)
  }
}

export function deriveScopeId(cwd) {
  const root = gitRoot(cwd)
  const label = basename(root).replaceAll(/[^A-Za-z0-9._-]/g, '-') || 'workspace'
  return `codex:${label}:${hash(root).slice(0, 16)}`
}

export function normalizeBaseUrl(value) {
  let configuredBaseUrl = DEFAULT_BASE_URL
  try {
    const config = JSON.parse(
      readFileSync(new URL('../powercontext.json', import.meta.url), 'utf8'),
    )
    if (typeof config.baseUrl === 'string' && config.baseUrl.trim().length > 0) {
      configuredBaseUrl = config.baseUrl
    }
  } catch {
    configuredBaseUrl = DEFAULT_BASE_URL
  }
  const baseUrl = value?.trim() || configuredBaseUrl
  return baseUrl.replace(/\/+$/, '')
}

function timeoutMs(value) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS
}

async function postJson(fetchImpl, url, body, timeout) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeout),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${String(response.status)}`)
  }
  return response.json()
}

function hookOutput(content) {
  return {
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      ...(content === undefined ? {} : { additionalContext: content }),
    },
  }
}

function errorRecord(operation, error) {
  return {
    component: 'powercontext-experimental-hook',
    operation,
    error: error instanceof Error ? error.message : String(error),
  }
}

export async function runUserPromptSubmit(input, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  const env = options.env ?? process.env
  const errors = []
  const cwd = typeof input?.cwd === 'string' && input.cwd.length > 0 ? input.cwd : '.'
  const prompt = typeof input?.prompt === 'string' ? input.prompt : ''
  const scopeId = env.POWERCONTEXT_SCOPE_ID?.trim() || deriveScopeId(cwd)
  const baseUrl = normalizeBaseUrl(env.POWERCONTEXT_BASE_URL)
  const timeout = timeoutMs(env.POWERCONTEXT_HOOK_TIMEOUT_MS)
  const promptIdentity = `${input?.session_id ?? ''}\0${input?.turn_id ?? ''}\0${prompt}`
  const sourceId = `codex-prompt-${hash(promptIdentity).slice(0, 24)}`

  const prepare = postJson(
    fetchImpl,
    `${baseUrl}/v1/context/prepare`,
    { scope_id: scopeId, query: prompt },
    timeout,
  ).catch((error) => {
    errors.push(errorRecord('prepare_context', error))
    return undefined
  })
  const capture = postJson(
    fetchImpl,
    `${baseUrl}/v1/sources/content`,
    {
      scope_id: scopeId,
      source_id: sourceId,
      content: prompt,
      metadata: {
        host: 'codex',
        cwd,
        session_id: input?.session_id ?? null,
        turn_id: input?.turn_id ?? null,
      },
    },
    timeout,
  ).catch((error) => {
    errors.push(errorRecord('capture_content_source', error))
    return undefined
  })

  const [prepared] = await Promise.all([prepare, capture])
  const content =
    prepared?.status === 'ready' && typeof prepared.content === 'string'
      ? prepared.content
      : undefined
  return { output: hookOutput(content), errors }
}

async function readStdin() {
  let value = ''
  for await (const chunk of process.stdin) {
    value += chunk
  }
  return JSON.parse(value)
}

async function main() {
  try {
    const result = await runUserPromptSubmit(await readStdin())
    for (const error of result.errors) {
      process.stderr.write(`${JSON.stringify(error)}\n`)
    }
    process.stdout.write(`${JSON.stringify(result.output)}\n`)
  } catch (error) {
    process.stderr.write(`${JSON.stringify(errorRecord('hook', error))}\n`)
    process.stdout.write(`${JSON.stringify(hookOutput())}\n`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main()
}

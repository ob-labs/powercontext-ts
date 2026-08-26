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

import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const oracleVenv = join(repoRoot, 'conformance', 'runners', 'python', '.venv')

export interface StartedPythonServer {
  readonly baseUrl: string
  stop(): Promise<void>
}

const CLI_BOOTSTRAP =
  "from powercontext.cli.app import main; import sys; sys.argv=['powercontext']+sys.argv[1:]; raise SystemExit(main())"

function existingPath(...candidates: string[]): string | undefined {
  return candidates.find((candidate) => existsSync(candidate))
}

function oraclePython(): string | undefined {
  return existingPath(
    join(oracleVenv, 'Scripts', 'python.exe'),
    join(oracleVenv, 'bin', 'python'),
  )
}

function oracleCli(): { command: string; args: string[] } | undefined {
  const script = existingPath(
    join(oracleVenv, 'Scripts', 'powercontext.exe'),
    join(oracleVenv, 'bin', 'powercontext'),
  )
  if (script !== undefined) {
    return { command: script, args: ['server', 'run'] }
  }
  const python = oraclePython()
  if (python === undefined) {
    return undefined
  }
  return { command: python, args: ['-c', CLI_BOOTSTRAP, 'server', 'run'] }
}

export function oracleEnvironmentReady(): boolean {
  const python = oraclePython()
  if (python === undefined || oracleCli() === undefined) {
    return false
  }
  try {
    execFileSync(
      python,
      [
        '-c',
        'from powercontext.cli.app import main; from powercontext.server.cli import app',
      ],
      { stdio: 'ignore', timeout: 30_000 },
    )
    return true
  } catch {
    return false
  }
}

function unusedPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address === null || typeof address === 'string') {
        server.close()
        reject(new Error('could not allocate a TCP port'))
        return
      }
      const { port } = address
      server.close((error) => {
        if (error !== null && error !== undefined) {
          reject(error)
          return
        }
        resolve(port)
      })
    })
    server.on('error', reject)
  })
}

async function waitForUrl(
  url: string,
  timeoutMs: number,
  child: ChildProcess,
): Promise<void> {
  const deadline = Date.now() + timeoutMs
  let lastError: unknown
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Server process exited with ${String(child.exitCode)}`)
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) })
      if (response.ok || response.status === 503) {
        return
      }
      lastError = new Error(`HTTP ${String(response.status)}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Server at ${url} did not become ready: ${String(lastError)}`)
}

export async function startPinnedPythonServer(): Promise<StartedPythonServer> {
  const cli = oracleCli()
  if (cli === undefined) {
    throw new Error('oracle environment is not bootstrapped')
  }
  const port = await unusedPort()
  const home = mkdtempSync(join(tmpdir(), 'pc-client-e2e-'))
  const child: ChildProcess = spawn(cli.command, cli.args, {
    cwd: home,
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PYTHONNOUSERSITE: '1',
      POWERCONTEXT_HOME: home,
      POWERCONTEXT_SERVER_HTTP_HOST: '127.0.0.1',
      POWERCONTEXT_SERVER_HTTP_PORT: String(port),
      POWERCONTEXT_SERVER_DASHBOARD_ENABLED: 'false',
      POWERCONTEXT_SERVER_MCP_ENABLED: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  const logs: string[] = []
  child.stdout?.on('data', (chunk: Buffer) => logs.push(chunk.toString()))
  child.stderr?.on('data', (chunk: Buffer) => logs.push(chunk.toString()))
  const baseUrl = `http://127.0.0.1:${String(port)}`
  try {
    await waitForUrl(`${baseUrl}/health/live`, 60_000, child)
  } catch (error) {
    child.kill()
    throw new Error(`${String(error)}\n${logs.join('')}`)
  }
  return {
    baseUrl,
    async stop(): Promise<void> {
      if (child.killed !== true) {
        child.kill()
      }
      await new Promise<void>((resolve) => {
        if (child.exitCode !== null) {
          resolve()
          return
        }
        child.once('exit', () => resolve())
        setTimeout(resolve, 3000)
      })
    },
  }
}

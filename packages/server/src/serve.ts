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

import { fileURLToPath } from 'node:url'
import { ValidationError } from '@powercontext/core'
import { listen, type ExperimentalHttpServer } from './index.js'

export interface ExperimentalServeOptions {
  readonly dbPath: string
  readonly port?: number
}

export async function experimentalServe(
  options: ExperimentalServeOptions,
): Promise<ExperimentalHttpServer> {
  const server = await listen({
    host: '127.0.0.1',
    port: options.port ?? 8787,
    dbPath: options.dbPath,
  })
  const address = server.app.server.address()
  if (address === null || typeof address === 'string') {
    await server.close()
    throw new ValidationError('experimental Server did not expose a TCP address')
  }
  console.log(`http://127.0.0.1:${String(address.port)}`)
  return server
}

function argumentValue(argv: readonly string[], name: string): string | undefined {
  const index = argv.indexOf(name)
  return index === -1 ? undefined : argv[index + 1]
}

function parsePort(value: string | undefined): number {
  if (value === undefined) {
    return 8787
  }
  const port = Number(value)
  if (!Number.isSafeInteger(port) || port < 0 || port > 65535) {
    throw new ValidationError('--port must be an integer from 0 to 65535')
  }
  return port
}

async function main(argv: readonly string[]): Promise<void> {
  const dbPath = argumentValue(argv, '--db') ?? process.env['POWERCONTEXT_DB']
  if (dbPath === undefined || dbPath.length === 0) {
    throw new ValidationError('provide --db <path> or POWERCONTEXT_DB')
  }
  const port = parsePort(
    argumentValue(argv, '--port') ?? process.env['POWERCONTEXT_PORT'],
  )
  await experimentalServe({ dbPath, port })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

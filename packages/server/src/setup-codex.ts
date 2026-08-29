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

import { cpSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ValidationError } from '@powercontext/core'

const DEFAULT_BASE_URL = 'http://127.0.0.1:8787'
const PLUGIN_NAME = 'powercontext-experimental'

export interface ExperimentalCodexSetupOptions {
  readonly outputDir: string
  readonly baseUrl?: string
}

export interface ExperimentalCodexSetupResult {
  readonly marketplaceDir: string
  readonly pluginDir: string
  readonly configPath: string
  readonly baseUrl: string
}

function normalizeBaseUrl(value: string | undefined): string {
  const normalized = (value ?? DEFAULT_BASE_URL).trim().replace(/\/+$/, '')
  let url: URL
  try {
    url = new URL(normalized)
  } catch {
    throw new ValidationError('--base-url must be an absolute HTTP URL')
  }
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') {
    throw new ValidationError(
      'experimental Codex setup only accepts http://127.0.0.1 loopback URLs',
    )
  }
  return normalized
}

function pluginSourceDir(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url))
  return resolve(moduleDir, '..', 'codex-plugin')
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

export function experimentalSetupCodex(
  options: ExperimentalCodexSetupOptions,
): ExperimentalCodexSetupResult {
  if (options.outputDir.trim().length === 0) {
    throw new ValidationError('--output must be a non-empty directory path')
  }
  const baseUrl = normalizeBaseUrl(options.baseUrl)
  const marketplaceDir = resolve(options.outputDir)
  const pluginDir = join(marketplaceDir, 'plugins', PLUGIN_NAME)
  mkdirSync(marketplaceDir, { recursive: true })
  cpSync(pluginSourceDir(), marketplaceDir, { recursive: true, force: true })
  writeJson(join(pluginDir, 'powercontext.json'), { baseUrl })
  writeJson(join(pluginDir, '.mcp.json'), {
    mcpServers: {
      powercontext_experimental: {
        type: 'http',
        url: `${baseUrl}/mcp`,
      },
    },
  })
  const configPath = join(marketplaceDir, 'powercontext-experimental.toml')
  writeFileSync(
    configPath,
    [
      '[mcp_servers.powercontext_experimental]',
      `url = ${JSON.stringify(`${baseUrl}/mcp`)}`,
      'enabled = true',
      '',
    ].join('\n'),
  )
  return { marketplaceDir, pluginDir, configPath, baseUrl }
}

function argumentValue(argv: readonly string[], name: string): string | undefined {
  const index = argv.indexOf(name)
  return index === -1 ? undefined : argv[index + 1]
}

async function main(argv: readonly string[]): Promise<void> {
  const outputDir = argumentValue(argv, '--output')
  if (outputDir === undefined) {
    throw new ValidationError('provide --output <directory>')
  }
  const baseUrl =
    argumentValue(argv, '--base-url') ?? process.env['POWERCONTEXT_BASE_URL']
  const result = experimentalSetupCodex(
    baseUrl === undefined ? { outputDir } : { outputDir, baseUrl },
  )
  console.log(`Rendered experimental Codex marketplace: ${result.marketplaceDir}`)
  console.log(`MCP config snippet: ${result.configPath}`)
  console.log(`codex plugin marketplace add ${JSON.stringify(result.marketplaceDir)}`)
  console.log(
    'codex plugin add powercontext-experimental@powercontext-experimental-local',
  )
  console.log('Start experimental:serve first, then open a new Codex session.')
  console.log('Approve the UserPromptSubmit hook if Codex asks for trust.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

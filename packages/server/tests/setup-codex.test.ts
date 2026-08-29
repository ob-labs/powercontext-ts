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

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { experimentalSetupCodex } from '../src/setup-codex.js'

describe('experimental Codex setup', () => {
  const directories: string[] = []

  afterEach(() => {
    vi.restoreAllMocks()
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('renders a local marketplace with matching hook and MCP base URLs', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-codex-setup-'))
    directories.push(directory)
    const outputDir = join(directory, 'marketplace')
    const result = experimentalSetupCodex({
      outputDir,
      baseUrl: 'http://127.0.0.1:9876/',
    })

    expect(result.baseUrl).toBe('http://127.0.0.1:9876')
    expect(
      JSON.parse(readFileSync(join(result.pluginDir, '.mcp.json'), 'utf8')),
    ).toEqual({
      mcpServers: {
        powercontext_experimental: {
          type: 'http',
          url: 'http://127.0.0.1:9876/mcp',
        },
      },
    })
    expect(
      JSON.parse(readFileSync(join(result.pluginDir, 'powercontext.json'), 'utf8')),
    ).toEqual({ baseUrl: 'http://127.0.0.1:9876' })
    expect(readFileSync(result.configPath, 'utf8')).toContain(
      'url = "http://127.0.0.1:9876/mcp"',
    )
    expect(
      JSON.parse(
        readFileSync(
          join(result.marketplaceDir, '.agents/plugins/marketplace.json'),
          'utf8',
        ),
      ),
    ).toMatchObject({
      plugins: [
        {
          name: 'powercontext-experimental',
          source: { source: 'local', path: './plugins/powercontext-experimental' },
        },
      ],
    })
  })

  it('rejects non-loopback setup URLs', () => {
    expect(() =>
      experimentalSetupCodex({
        outputDir: '/tmp/powercontext-invalid-setup',
        baseUrl: 'http://localhost:8787',
      }),
    ).toThrow(/127\.0\.0\.1/)
  })
})

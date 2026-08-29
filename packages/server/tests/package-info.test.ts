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
import { describe, expect, it } from 'vitest'
import {
  EXPERIMENTAL_MCP_TOOL_IDS,
  EXPERIMENTAL_SUBSET,
  PACKAGE_NAME,
  PACKAGE_PROFILE,
  PACKAGE_ROLE,
} from '../src/index.js'

describe('@powercontext/server skeleton', () => {
  it('exports the reserved server composition identity', () => {
    expect(PACKAGE_NAME).toBe('@powercontext/server')
    expect(PACKAGE_ROLE).toBe('server')
    expect(PACKAGE_PROFILE).toBe('sqlite-fts')
    expect(EXPERIMENTAL_SUBSET).toBe(true)
  })

  it('keeps the user status honest about the unshipped HTTP Server', () => {
    const userReadme = readFileSync(
      new URL('../../../docs/user/README.md', import.meta.url),
      'utf8',
    )
    expect(userReadme).toContain('| HTTP Server, MCP, CLI, Dashboard | Not shipped |')
  })

  it('pins MCP SDK dependencies only on the experimental Server package', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { dependencies: Record<string, string> }
    expect(manifest.dependencies['@modelcontextprotocol/server']).toBe('2.0.0')
    expect(manifest.dependencies['@modelcontextprotocol/fastify']).toBe('2.0.0')
    expect(manifest.dependencies['@modelcontextprotocol/node']).toBe('2.0.0')

    for (const packageName of ['client', 'protocol']) {
      const packageManifest = JSON.parse(
        readFileSync(
          new URL(`../../${packageName}/package.json`, import.meta.url),
          'utf8',
        ),
      ) as { dependencies?: Record<string, string> }
      expect(
        Object.keys(packageManifest.dependencies ?? {}).filter((name) =>
          name.startsWith('@modelcontextprotocol/'),
        ),
      ).toEqual([])
    }
  })

  it('uses only MCP tool IDs locked by the pinned baseline', () => {
    const baseline = readFileSync(
      new URL('../../../contract/baseline.lock.yaml', import.meta.url),
      'utf8',
    )
    for (const toolId of EXPERIMENTAL_MCP_TOOL_IDS) {
      expect(baseline).toContain(`  - ${toolId}\n`)
    }
  })

  it('ships only an experimental five-tool fail-open Codex plugin bundle', () => {
    const pluginRoot = new URL(
      '../codex-plugin/plugins/powercontext-experimental/',
      import.meta.url,
    )
    const plugin = JSON.parse(
      readFileSync(new URL('.codex-plugin/plugin.json', pluginRoot), 'utf8'),
    ) as { readonly mcpServers: string; readonly description: string }
    const mcp = readFileSync(new URL(plugin.mcpServers, pluginRoot), 'utf8')
    const hooks = readFileSync(new URL('hooks/hooks.json', pluginRoot), 'utf8')
    const hookScript = readFileSync(
      new URL('scripts/user-prompt-submit.mjs', pluginRoot),
      'utf8',
    )

    expect(plugin.description).toContain('Experimental')
    expect(JSON.parse(mcp)).toEqual({
      mcpServers: {
        powercontext_experimental: {
          type: 'http',
          url: 'http://127.0.0.1:8787/mcp',
        },
      },
    })
    expect(hooks).toContain('UserPromptSubmit')
    expect(hookScript).toContain("hookEventName: 'UserPromptSubmit'")
    expect(hookScript).toContain('continue: true')
    expect(`${mcp}\n${hooks}\n${hookScript}`).not.toContain('handoff')
    expect(EXPERIMENTAL_MCP_TOOL_IDS).toHaveLength(5)
  })
})

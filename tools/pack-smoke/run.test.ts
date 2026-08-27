/**
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const toolDir = dirname(fileURLToPath(import.meta.url))
const runScript = pathToFileURL(join(toolDir, 'run.mjs')).href

describe('pack-smoke workspace', () => {
  it('writes sibling tarball overrides in pnpm-workspace.yaml', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'pack-smoke-overrides-'))
    const probe = join(workspace, 'probe.mjs')
    try {
      writeFileSync(
        probe,
        `import { writeSmokeWorkspace } from ${JSON.stringify(runScript)}\n` +
          `writeSmokeWorkspace(${JSON.stringify(workspace)}, 'pack-smoke', [\n` +
          `  { name: '@powercontext/protocol', localFile: 'powercontext-protocol-0.0.0.tgz' },\n` +
          `  { name: '@powercontext/core', localFile: 'powercontext-core-0.0.0.tgz' },\n` +
          `])\n`,
      )
      const result = spawnSync(process.execPath, [probe], { encoding: 'utf8' })
      expect(result.status, result.stderr).toBe(0)
      const manifest = JSON.parse(
        readFileSync(join(workspace, 'package.json'), 'utf8'),
      ) as { pnpm?: unknown }
      const yaml = readFileSync(join(workspace, 'pnpm-workspace.yaml'), 'utf8')
      expect(manifest.pnpm).toBeUndefined()
      expect(yaml).toContain('overrides:')
      expect(yaml).toContain(
        '"@powercontext/protocol": "file:./powercontext-protocol-0.0.0.tgz"',
      )
      expect(yaml).toContain(
        '"@powercontext/core": "file:./powercontext-core-0.0.0.tgz"',
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })
})

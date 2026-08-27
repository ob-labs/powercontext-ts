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

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { writeSmokeWorkspace } from './run.mjs'

describe('pack-smoke workspace', () => {
  it('writes sibling tarball overrides in pnpm-workspace.yaml', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'pack-smoke-overrides-'))
    try {
      writeSmokeWorkspace(workspace, 'pack-smoke', [
        {
          name: '@powercontext/protocol',
          localFile: 'powercontext-protocol-0.0.0.tgz',
        },
        { name: '@powercontext/core', localFile: 'powercontext-core-0.0.0.tgz' },
      ])
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

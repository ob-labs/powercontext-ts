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
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { NATIVE_DEPENDENCIES, PACKAGE_NAME, PACKAGE_PROFILE } from '../src/index.js'

const packageRoot = dirname(fileURLToPath(import.meta.url))

describe('@powercontext/client skeleton', () => {
  it('declares the client profile and no native dependencies', () => {
    expect(PACKAGE_NAME).toBe('@powercontext/client')
    expect(PACKAGE_PROFILE).toBe('client')
    expect(NATIVE_DEPENDENCIES).toEqual([])
  })

  it('does not pull SQLite, MCP server or provider SDKs into the package', () => {
    const manifest = JSON.parse(
      readFileSync(join(packageRoot, '..', 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>
      optionalDependencies?: Record<string, string>
    }
    const names = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.optionalDependencies ?? {}),
    ]
    expect(names.some((name) => name.includes('sqlite'))).toBe(false)
    expect(names.some((name) => name.includes('better-sqlite'))).toBe(false)
    expect(names.some((name) => name.includes('modelcontextprotocol'))).toBe(false)
  })
})

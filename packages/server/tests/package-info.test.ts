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
})

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
import { PACKAGE_NAME, PACKAGE_ROLE } from '../src/index.js'

describe('@powercontext/core skeleton', () => {
  it('stays a deterministic domain package', () => {
    expect(PACKAGE_NAME).toBe('@powercontext/core')
    expect(PACKAGE_ROLE).toBe('core')
  })

  it('has no Fastify, database driver or provider dependencies', () => {
    const manifest = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
        'utf8',
      ),
    ) as { dependencies?: Record<string, string> }
    const names = Object.keys(manifest.dependencies ?? {})
    expect(names).toEqual(['@powercontext/protocol', 'canonicalize'])
    expect(
      names.some((name) => /fastify|sqlite|kysely|openai|anthropic/i.test(name)),
    ).toBe(false)
  })
})

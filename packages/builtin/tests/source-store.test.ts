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

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSource } from '@powercontext/core'
import { describe, expect, it } from 'vitest'
import { SQLiteSourceStore, openSQLiteSession } from '../src/index.js'

describe('SQLiteSourceStore', () => {
  it('persists NFC-normalized sources across reopen', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-source-'))
    const path = join(directory, 'runtime.sqlite3')
    const source = createSource({
      name: 'cafe\u0301',
      sourceKind: 'manual',
      materialization: 'captured',
      description: 'decomposed',
    })
    const first = openSQLiteSession(path)
    const stored = await new SQLiteSourceStore(first).add(source)
    expect(stored.name).toBe('café')
    first.close()
    const second = openSQLiteSession(path)
    try {
      await expect(new SQLiteSourceStore(second).get(stored)).resolves.toEqual(stored)
    } finally {
      second.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

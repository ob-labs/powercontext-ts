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
import { describe, expect, it } from 'vitest'
import { SQLiteContentSourceStore, openSQLiteSession } from '../src/index.js'

describe('experimental content Source journal', () => {
  it('persists normalized content and continues positions after reopen', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-content-source-'))
    const path = join(directory, 'runtime.sqlite3')
    const firstSession = openSQLiteSession(path)
    try {
      const store = new SQLiteContentSourceStore(firstSession)
      expect(
        await store.capture({
          scope_id: 'scope',
          source_id: 'source',
          content: 'cafe\u0301',
        }),
      ).toEqual({ source_id: 'source', position: 1 })
      expect(
        firstSession
          .prepare(
            'SELECT content, position FROM pc_content_source_entry WHERE scope_id = ? AND source_id = ?',
          )
          .get('scope', 'source'),
      ).toEqual({ content: 'café', position: 1n })
    } finally {
      firstSession.close()
    }

    const secondSession = openSQLiteSession(path)
    try {
      const store = new SQLiteContentSourceStore(secondSession)
      expect(
        await store.capture({
          scope_id: 'scope',
          source_id: 'source',
          content: 'next',
        }),
      ).toEqual({ source_id: 'source', position: 2 })
    } finally {
      secondSession.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

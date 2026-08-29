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
import { DatabaseSync } from 'node:sqlite'
import {
  ENTRY_CONTENT_HASH_DOMAIN,
  UnavailableError,
  analyzeText,
  hashDomain,
} from '@powercontext/core'
import { describe, expect, it } from 'vitest'
import { openExperimentalRuntime } from '../src/index.js'

describe('experimental Memory + FTS', () => {
  it('hashes canonically, persists, and finds Analyzer-projected CJK after reopen', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-memory-'))
    const path = join(directory, 'runtime.sqlite3')
    const first = await openExperimentalRuntime({ path })
    const remembered = await first.remember({
      scope_id: 'scope-1',
      kind: 'note',
      text: '中文 café',
    })
    expect(remembered.content_hash).toBe(
      hashDomain(ENTRY_CONTENT_HASH_DOMAIN, {
        kind: 'note',
        text: '中文 café',
        source_refs: [],
        artifact_refs: [],
      }),
    )
    first.close()
    const inspection = new DatabaseSync(path, { readOnly: true })
    const projection = inspection
      .prepare('SELECT searchable_text FROM pc_memory_entry_fts WHERE entry_id = ?')
      .get(remembered.entry_id) as { searchable_text: string }
    inspection.close()
    expect(projection.searchable_text).toBe(analyzeText(remembered.text))

    const second = await openExperimentalRuntime({ path })
    try {
      await expect(second.list('scope-1')).resolves.toHaveLength(1)
      await expect(second.get('scope-1', remembered.entry_id)).resolves.toEqual(
        remembered,
      )
      await expect(
        second.search({ scope_id: 'scope-1', query: '中文' }),
      ).resolves.toEqual([remembered])
      await expect(
        second.search({ scope_id: 'scope-1', query: 'cafe\u0301' }),
      ).resolves.toEqual([remembered])
      await expect(
        second.search({ scope_id: 'scope-1', query: '中文', mode: 'vector' }),
      ).rejects.toThrow(UnavailableError)
      await expect(
        second.search({ scope_id: 'scope-1', query: '中文', mode: 'hybrid' }),
      ).rejects.toThrow(UnavailableError)
    } finally {
      second.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

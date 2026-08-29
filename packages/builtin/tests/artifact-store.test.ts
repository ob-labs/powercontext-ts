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
import { RevisionConflictError, createArtifactDraft } from '@powercontext/core'
import { describe, expect, it } from 'vitest'
import { SQLiteArtifactStore, openSQLiteSession } from '../src/index.js'

describe('SQLiteArtifactStore', () => {
  it('persists immutable revisions and rejects stale CAS writers', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-artifact-'))
    const path = join(directory, 'runtime.sqlite3')
    const first = openSQLiteSession(path)
    const store = new SQLiteArtifactStore(first)
    const created = await store.create(
      'artifact-1',
      createArtifactDraft({ family: 'memory', content: { text: 'v1' } }),
    )
    const revised = await store.revise(
      created,
      createArtifactDraft({ family: 'memory', content: { text: 'v2' } }),
    )
    await expect(
      store.revise(
        created,
        createArtifactDraft({ family: 'memory', content: { text: 'stale' } }),
      ),
    ).rejects.toThrow(RevisionConflictError)
    first.close()
    const second = openSQLiteSession(path)
    try {
      const reopened = new SQLiteArtifactStore(second)
      await expect(reopened.latest('memory', 'artifact-1')).resolves.toMatchObject({
        family: revised.family,
        artifactId: revised.artifactId,
        revision: revised.revision,
        content: revised.content,
        lineage: revised.lineage,
      })
      await expect(reopened.revisions('memory', 'artifact-1')).resolves.toHaveLength(2)
    } finally {
      second.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

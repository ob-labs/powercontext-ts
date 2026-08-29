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

import type { Source } from '@powercontext/core'
import { SQLiteArtifactStore } from './persistence/artifact-store.js'
import {
  SQLiteMemoryStore,
  type MemorySearchInput,
  type RememberInput,
} from './persistence/memory-store.js'
import { openSQLiteSession } from './persistence/sqlite-session.js'
import { SQLiteSourceStore } from './persistence/source-store.js'

export class ExperimentalRuntime {
  readonly sources: SQLiteSourceStore
  readonly artifacts: SQLiteArtifactStore
  readonly memory: SQLiteMemoryStore
  private readonly session

  constructor(path: string) {
    this.session = openSQLiteSession(path)
    this.sources = new SQLiteSourceStore(this.session)
    this.artifacts = new SQLiteArtifactStore(this.session)
    this.memory = new SQLiteMemoryStore(this.session)
  }

  capture(source: Source) {
    return this.sources.add(source)
  }

  remember(input: RememberInput) {
    return this.memory.remember(input)
  }

  list(scopeId?: string) {
    return this.memory.listEntries(scopeId)
  }

  get(scopeId: string, entryId: string) {
    return this.memory.getEntry(scopeId, entryId)
  }

  search(input: MemorySearchInput) {
    return this.memory.search(input)
  }

  close(): void {
    this.session.close()
  }
}

export async function openExperimentalRuntime(options: {
  readonly path: string
}): Promise<ExperimentalRuntime> {
  return new ExperimentalRuntime(options.path)
}

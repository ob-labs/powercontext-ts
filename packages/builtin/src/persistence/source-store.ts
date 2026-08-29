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

import {
  SourceConflictError,
  SourceNotFoundError,
  createSource,
  sourcesEqual,
} from '@powercontext/core'
import type { Source, SourceCatalogBackend, SourceStore } from '@powercontext/core'
import type { SQLiteSession } from './sqlite-session.js'

type SourceRow = {
  readonly source_kind: string
  readonly source_id: string
  readonly materialization: string
  readonly description: string | null
}

function normalizedSource(source: Source): Source {
  return createSource({
    name: source.name.normalize('NFC'),
    sourceKind: source.sourceKind.normalize('NFC'),
    materialization: source.materialization,
    ...(source.description === undefined
      ? {}
      : { description: source.description.normalize('NFC') }),
  })
}

function fromRow(row: SourceRow): Source {
  return createSource({
    name: row.source_id,
    sourceKind: row.source_kind,
    materialization: row.materialization as Source['materialization'],
    ...(row.description === null ? {} : { description: row.description }),
  })
}

export class SQLiteSourceStore implements SourceCatalogBackend, SourceStore<Source> {
  constructor(private readonly session: SQLiteSession) {}

  async add<TSource extends Source>(source: TSource): Promise<TSource> {
    const stored = normalizedSource(source) as TSource
    try {
      this.session
        .prepare(
          'INSERT INTO pc_source(source_kind, source_id, materialization, description) VALUES (?, ?, ?, ?)',
        )
        .run(
          stored.sourceKind,
          stored.name,
          stored.materialization,
          stored.description ?? null,
        )
    } catch (error) {
      if (error instanceof Error && /UNIQUE|PRIMARY KEY/i.test(error.message)) {
        const existing = await this.get(stored)
        if (sourcesEqual(existing, stored)) {
          return existing as TSource
        }
        throw new SourceConflictError('source', `${stored.sourceKind}:${stored.name}`)
      }
      throw error
    }
    return stored
  }

  async get(source: Source): Promise<Source> {
    const normalized = normalizedSource(source)
    const row = this.session
      .prepare(
        'SELECT source_kind, source_id, materialization, description FROM pc_source WHERE source_kind = ? AND source_id = ?',
      )
      .get(normalized.sourceKind, normalized.name) as SourceRow | undefined
    if (row === undefined) {
      throw new SourceNotFoundError(source)
    }
    return fromRow(row)
  }

  async list(): Promise<readonly Source[]> {
    const rows = this.session
      .prepare(
        'SELECT source_kind, source_id, materialization, description FROM pc_source ORDER BY source_kind, source_id',
      )
      .all() as SourceRow[]
    return rows.map(fromRow)
  }
}

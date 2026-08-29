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
  ENTRY_CONTENT_HASH_DOMAIN,
  MAX_SCOPE_ID_LENGTH,
  MEMORY_ENTRY_TEXT_MAX_BYTES,
  UnavailableError,
  ValidationError,
  admitsFtsText,
  analyzeText,
  assertUtf8Budget,
  canonicalizeJson,
  codePointLength,
  createArtifactDraft,
  ftsMatchQuery,
  hashDomain,
  normalizeRefs,
  normalizeUnicode,
} from '@powercontext/core'
import type { ArtifactRef, SourceRef } from '@powercontext/core'
import { SQLiteArtifactStore } from './artifact-store.js'
import type { SQLiteSession } from './sqlite-session.js'

export interface RememberInput {
  readonly scope_id: string
  readonly kind: string
  readonly text: string
  readonly source_refs?: readonly SourceRef[]
  readonly artifact_refs?: readonly ArtifactRef[]
}

export interface MemoryEntry {
  readonly scope_id: string
  readonly entry_id: string
  readonly kind: string
  readonly text: string
  readonly content_hash: string
  readonly source_refs: readonly {
    readonly source_type: string
    readonly source_id: string
  }[]
  readonly artifact_refs: readonly {
    readonly family: string
    readonly artifact_id: string
    readonly revision: number
  }[]
  readonly artifact: ArtifactRef
  readonly created_at: string
}

export interface MemorySearchInput {
  readonly scope_id: string
  readonly query: string
  readonly mode?: 'fts' | 'vector' | 'hybrid'
  readonly limit?: number
}

type EntryRow = {
  readonly scope_id: string
  readonly entry_id: string
  readonly kind: string
  readonly text: string
  readonly content_hash: string
  readonly source_refs_json: string
  readonly artifact_refs_json: string
  readonly artifact_id: string
  readonly artifact_revision: bigint
  readonly created_at: string
}

function normalizeIdentity(value: string, field: string, maximum: number): string {
  const normalized = value.normalize('NFC')
  if (normalized.length === 0 || normalized !== normalized.trim()) {
    throw new ValidationError(`${field} must be a trimmed non-empty string`)
  }
  if (codePointLength(normalized) > maximum) {
    throw new ValidationError(`${field} must not exceed ${String(maximum)} characters`)
  }
  return normalized
}

function entryFromRow(session: SQLiteSession, row: EntryRow): MemoryEntry {
  return Object.freeze({
    scope_id: row.scope_id,
    entry_id: row.entry_id,
    kind: row.kind,
    text: row.text,
    content_hash: row.content_hash,
    source_refs: Object.freeze(
      JSON.parse(row.source_refs_json) as MemoryEntry['source_refs'],
    ),
    artifact_refs: Object.freeze(
      JSON.parse(row.artifact_refs_json) as MemoryEntry['artifact_refs'],
    ),
    artifact: Object.freeze({
      family: 'memory',
      artifactId: row.artifact_id,
      revision: session.safeInteger(row.artifact_revision, 'artifact_revision'),
    }),
    created_at: row.created_at,
  })
}

const ENTRY_COLUMNS =
  'scope_id, entry_id, kind, text, content_hash, source_refs_json, artifact_refs_json, artifact_id, artifact_revision, created_at'

function qualifiedColumns(alias: string): string {
  return ENTRY_COLUMNS.split(', ')
    .map((column) => `${alias}.${column}`)
    .join(', ')
}

export class SQLiteMemoryStore {
  private readonly artifacts: SQLiteArtifactStore

  constructor(private readonly session: SQLiteSession) {
    this.artifacts = new SQLiteArtifactStore(session)
  }

  async remember(input: RememberInput): Promise<MemoryEntry> {
    const scopeId = normalizeIdentity(input.scope_id, 'scope_id', MAX_SCOPE_ID_LENGTH)
    const kind = normalizeIdentity(input.kind, 'kind', 128)
    const text = normalizeUnicode(input.text) as string
    assertUtf8Budget(text, MEMORY_ENTRY_TEXT_MAX_BYTES, 'memory entry text')
    const sourceRefs = normalizeRefs(input.source_refs ?? [])
    const artifactRefs = normalizeRefs(input.artifact_refs ?? [])
    const payload = Object.freeze({
      kind,
      text,
      source_refs: sourceRefs,
      artifact_refs: artifactRefs,
    })
    const contentHash = hashDomain(ENTRY_CONTENT_HASH_DOMAIN, payload)
    const sourceRefsJson = canonicalizeJson(sourceRefs)
    const artifactRefsJson = canonicalizeJson(artifactRefs)
    const createdAt = new Date().toISOString()

    return this.session.transaction(() => {
      const existing = this.find(scopeId, contentHash)
      if (existing !== undefined) {
        return entryFromRow(this.session, existing)
      }
      const artifactExists = this.session
        .prepare(
          'SELECT 1 AS present FROM pc_artifact_head WHERE family = ? AND artifact_id = ?',
        )
        .get('memory', contentHash)
      if (artifactExists === undefined) {
        this.artifacts.insertRevision(
          contentHash,
          createArtifactDraft({
            family: 'memory',
            content: payload,
            sources: input.source_refs ?? [],
            artifacts: input.artifact_refs ?? [],
          }),
          1,
        )
      }
      this.session
        .prepare(
          'INSERT INTO pc_memory_entry_version(scope_id, entry_id, revision, kind, text, content_hash, source_refs_json, artifact_refs_json, artifact_family, artifact_id, artifact_revision, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          scopeId,
          contentHash,
          1,
          kind,
          text,
          contentHash,
          sourceRefsJson,
          artifactRefsJson,
          'memory',
          contentHash,
          1,
          createdAt,
        )
      this.session
        .prepare(
          'INSERT INTO pc_memory_entry_head(scope_id, entry_id, revision) VALUES (?, ?, ?)',
        )
        .run(scopeId, contentHash, 1)
      this.session
        .prepare(
          'INSERT INTO pc_memory_entry_fts(scope_id, entry_id, searchable_text) VALUES (?, ?, ?)',
        )
        .run(scopeId, contentHash, analyzeText(text))
      const row = this.find(scopeId, contentHash)
      if (row === undefined) {
        throw new ValidationError('remembered entry could not be read back')
      }
      return entryFromRow(this.session, row)
    })
  }

  async listEntries(scopeId?: string): Promise<readonly MemoryEntry[]> {
    const rows =
      scopeId === undefined
        ? (this.session
            .prepare(
              `SELECT ${qualifiedColumns('v')} FROM pc_memory_entry_head h JOIN pc_memory_entry_version v ON v.scope_id = h.scope_id AND v.entry_id = h.entry_id AND v.revision = h.revision ORDER BY v.created_at, v.entry_id`,
            )
            .all() as EntryRow[])
        : (this.session
            .prepare(
              `SELECT ${qualifiedColumns('v')} FROM pc_memory_entry_head h JOIN pc_memory_entry_version v ON v.scope_id = h.scope_id AND v.entry_id = h.entry_id AND v.revision = h.revision WHERE v.scope_id = ? ORDER BY v.created_at, v.entry_id`,
            )
            .all(
              normalizeIdentity(scopeId, 'scope_id', MAX_SCOPE_ID_LENGTH),
            ) as EntryRow[])
    return rows.map((row) => entryFromRow(this.session, row))
  }

  async getEntry(scopeId: string, entryId: string): Promise<MemoryEntry> {
    const row = this.find(
      normalizeIdentity(scopeId, 'scope_id', MAX_SCOPE_ID_LENGTH),
      entryId,
    )
    if (row === undefined) {
      throw new ValidationError('memory entry was not found')
    }
    return entryFromRow(this.session, row)
  }

  async search(input: MemorySearchInput): Promise<readonly MemoryEntry[]> {
    if ((input.mode ?? 'fts') !== 'fts') {
      throw new UnavailableError(`${input.mode ?? 'fts'} memory search is unavailable`)
    }
    const match = ftsMatchQuery(input.query)
    if (match === null) {
      return []
    }
    const limit = input.limit ?? 20
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
      throw new ValidationError('search limit must be an integer from 1 to 1000')
    }
    const scopeId = normalizeIdentity(input.scope_id, 'scope_id', MAX_SCOPE_ID_LENGTH)
    const rows = this.session
      .prepare(
        `SELECT ${qualifiedColumns('v')} FROM pc_memory_entry_fts f JOIN pc_memory_entry_head h ON h.scope_id = f.scope_id AND h.entry_id = f.entry_id JOIN pc_memory_entry_version v ON v.scope_id = h.scope_id AND v.entry_id = h.entry_id AND v.revision = h.revision WHERE pc_memory_entry_fts MATCH ? AND f.scope_id = ? ORDER BY bm25(pc_memory_entry_fts), v.entry_id LIMIT ?`,
      )
      .all(match, scopeId, limit) as EntryRow[]
    return rows
      .map((row) => entryFromRow(this.session, row))
      .filter((entry) => admitsFtsText(input.query, entry.text))
  }

  async revise(): Promise<never> {
    throw new UnavailableError('memory revise is unavailable in the skeleton')
  }

  async retire(): Promise<never> {
    throw new UnavailableError('memory retire is unavailable in the skeleton')
  }

  async listChanges(): Promise<never> {
    throw new UnavailableError('memory change listing is unavailable in the skeleton')
  }

  private find(scopeId: string, entryId: string): EntryRow | undefined {
    return this.session
      .prepare(
        `SELECT ${qualifiedColumns('v')} FROM pc_memory_entry_head h JOIN pc_memory_entry_version v ON v.scope_id = h.scope_id AND v.entry_id = h.entry_id AND v.revision = h.revision WHERE v.scope_id = ? AND v.entry_id = ?`,
      )
      .get(scopeId, entryId) as EntryRow | undefined
  }
}

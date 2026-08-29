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
  MAX_SCOPE_ID_LENGTH,
  MAX_SOURCE_ID_LENGTH,
  ValidationError,
  canonicalizeJson,
  codePointLength,
  normalizeUnicode,
} from '@powercontext/core'
import type { SQLiteSession } from './sqlite-session.js'

const MAX_CONTENT_CODE_POINTS = 200000

export interface CaptureContentInput {
  readonly scope_id: string
  readonly source_id: string
  readonly content: string
  readonly metadata?: Record<string, unknown> | null
}

export interface CapturedContent {
  readonly source_id: string
  readonly position: number
}

type PositionRow = { readonly position: bigint }

function normalizeIdentity(value: string, field: string, maximum: number): string {
  const normalized = value.normalize('NFC')
  if (normalized.length === 0 || normalized !== normalized.trim()) {
    throw new ValidationError(`${field} must be a non-empty trimmed string`)
  }
  if (codePointLength(normalized) > maximum) {
    throw new ValidationError(`${field} must not exceed ${String(maximum)} characters`)
  }
  return normalized
}

export class SQLiteContentSourceStore {
  constructor(private readonly session: SQLiteSession) {}

  async capture(input: CaptureContentInput): Promise<CapturedContent> {
    const scopeId = normalizeIdentity(input.scope_id, 'scope_id', MAX_SCOPE_ID_LENGTH)
    const sourceId = normalizeIdentity(
      input.source_id,
      'source_id',
      MAX_SOURCE_ID_LENGTH,
    )
    const content = normalizeUnicode(input.content) as string
    if (content.length === 0) {
      throw new ValidationError('content must be non-empty')
    }
    if (codePointLength(content) > MAX_CONTENT_CODE_POINTS) {
      throw new ValidationError(
        `content must not exceed ${String(MAX_CONTENT_CODE_POINTS)} characters`,
      )
    }
    const metadataJson =
      input.metadata === undefined || input.metadata === null
        ? null
        : canonicalizeJson(normalizeUnicode(input.metadata))

    return this.session.transaction(() => {
      const row = this.session
        .prepare(
          'SELECT COALESCE(MAX(position), 0) + 1 AS position FROM pc_content_source_entry WHERE scope_id = ? AND source_id = ?',
        )
        .get(scopeId, sourceId) as PositionRow
      const position = this.session.safeInteger(row.position, 'content source position')
      this.session
        .prepare(
          'INSERT INTO pc_content_source_entry(scope_id, source_id, position, content, metadata_json) VALUES (?, ?, ?, ?, ?)',
        )
        .run(scopeId, sourceId, position, content, metadataJson)
      return { source_id: sourceId, position }
    })
  }
}

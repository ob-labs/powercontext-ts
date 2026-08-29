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

import { UnavailableError } from '@powercontext/core'
import type { DatabaseSync } from 'node:sqlite'

export const EXPERIMENTAL_DATABASE_STAMP =
  'powercontext.database.experimental-ts' as const
export const EXPERIMENTAL_SCHEMA_KIND = 'experimental-writable' as const

export type SchemaGateKind =
  'experimental-writable' | 'foreign-write-refused' | 'unrecognized-refused'

export class SchemaGateError extends UnavailableError {
  readonly kind: Exclude<SchemaGateKind, 'experimental-writable'>

  constructor(kind: Exclude<SchemaGateKind, 'experimental-writable'>, message: string) {
    super(message)
    this.kind = kind
  }
}

const DDL = `
CREATE TABLE pc_schema_stamp (
  stamp TEXT PRIMARY KEY NOT NULL
);
CREATE TABLE pc_source (
  source_kind TEXT NOT NULL,
  source_id TEXT NOT NULL,
  materialization TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (source_kind, source_id)
);
CREATE TABLE pc_content_source_entry (
  scope_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 1),
  content TEXT NOT NULL,
  metadata_json TEXT,
  PRIMARY KEY (scope_id, source_id, position)
);
CREATE TABLE pc_artifact_version (
  family TEXT NOT NULL,
  artifact_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  content_json TEXT NOT NULL,
  source_refs_json TEXT NOT NULL,
  artifact_refs_json TEXT NOT NULL,
  PRIMARY KEY (family, artifact_id, revision)
);
CREATE TABLE pc_artifact_head (
  family TEXT NOT NULL,
  artifact_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  PRIMARY KEY (family, artifact_id),
  FOREIGN KEY (family, artifact_id, revision)
    REFERENCES pc_artifact_version(family, artifact_id, revision)
);
CREATE TABLE pc_memory_entry_version (
  scope_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  kind TEXT NOT NULL,
  text TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_refs_json TEXT NOT NULL,
  artifact_refs_json TEXT NOT NULL,
  artifact_family TEXT NOT NULL CHECK (artifact_family = 'memory'),
  artifact_id TEXT NOT NULL,
  artifact_revision INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (scope_id, entry_id, revision),
  UNIQUE (scope_id, content_hash),
  FOREIGN KEY (artifact_family, artifact_id, artifact_revision)
    REFERENCES pc_artifact_version(family, artifact_id, revision)
);
CREATE TABLE pc_memory_entry_head (
  scope_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  PRIMARY KEY (scope_id, entry_id),
  FOREIGN KEY (scope_id, entry_id, revision)
    REFERENCES pc_memory_entry_version(scope_id, entry_id, revision)
);
CREATE VIRTUAL TABLE pc_memory_entry_fts USING fts5(
  scope_id UNINDEXED,
  entry_id UNINDEXED,
  searchable_text,
  tokenize = "unicode61 tokenchars '_'"
);
`

const ADDITIVE_DDL = `
CREATE TABLE IF NOT EXISTS pc_content_source_entry (
  scope_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 1),
  content TEXT NOT NULL,
  metadata_json TEXT,
  PRIMARY KEY (scope_id, source_id, position)
);
`

type SchemaRow = { readonly name: string; readonly type: string }
type StampRow = { readonly stamp: string }

function listSchemaObjects(database: DatabaseSync): readonly SchemaRow[] {
  const statement = database.prepare(
    "SELECT name, type FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  statement.setReadBigInts(true)
  return statement.all() as SchemaRow[]
}

export function inspectSchemaGate(database: DatabaseSync): SchemaGateKind {
  const objects = listSchemaObjects(database)
  if (objects.length === 0) {
    return EXPERIMENTAL_SCHEMA_KIND
  }
  const stampObject = objects.find((object) => object.name === 'pc_schema_stamp')
  if (stampObject === undefined) {
    const hasPowerContextTable = objects.some((object) => object.name.startsWith('pc_'))
    throw new SchemaGateError(
      hasPowerContextTable ? 'foreign-write-refused' : 'unrecognized-refused',
      hasPowerContextTable
        ? 'refusing writes to an unstamped PowerContext-like SQLite database'
        : 'refusing writes to a non-empty unstamped SQLite database',
    )
  }
  const stamp = database.prepare('SELECT stamp FROM pc_schema_stamp').get() as
    StampRow | undefined
  if (stamp?.stamp !== EXPERIMENTAL_DATABASE_STAMP) {
    throw new SchemaGateError(
      'foreign-write-refused',
      'refusing writes to a SQLite database with an unknown schema stamp',
    )
  }
  return EXPERIMENTAL_SCHEMA_KIND
}

export function ensureExperimentalSchema(
  database: DatabaseSync,
  mayCreate = false,
): void {
  const objects = listSchemaObjects(database)
  if (objects.length === 0) {
    if (!mayCreate) {
      throw new SchemaGateError(
        'unrecognized-refused',
        'refusing writes to an existing unstamped SQLite database',
      )
    }
    database.exec(DDL)
    database
      .prepare('INSERT INTO pc_schema_stamp(stamp) VALUES (?)')
      .run(EXPERIMENTAL_DATABASE_STAMP)
    return
  }
  inspectSchemaGate(database)
  database.exec(ADDITIVE_DDL)
}

export function experimentalSchemaDdl(): string {
  return DDL
}

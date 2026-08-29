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

import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'
import { EXPERIMENTAL_DATABASE_STAMP, openSQLiteSession } from '../src/index.js'
import type { SchemaGateError } from '../src/index.js'

describe('experimental schema gate', () => {
  it('stamps a newly created database', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-schema-'))
    const path = join(directory, 'runtime.sqlite3')
    const session = openSQLiteSession(path)
    try {
      expect(session.prepare('SELECT stamp FROM pc_schema_stamp').get()).toEqual({
        stamp: EXPERIMENTAL_DATABASE_STAMP,
      })
    } finally {
      session.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('refuses an unstamped pc-like database without changing its bytes', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-foreign-'))
    const path = join(directory, 'foreign.sqlite3')
    const foreign = new DatabaseSync(path)
    foreign.exec('CREATE TABLE pc_memory_entry_foreign(value TEXT)')
    foreign.close()
    const before = readFileSync(path)
    try {
      expect(() => openSQLiteSession(path)).toThrowError(
        expect.objectContaining<Partial<SchemaGateError>>({
          kind: 'foreign-write-refused',
        }),
      )
      expect(readFileSync(path)).toEqual(before)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('refuses an unknown experimental stamp', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-unknown-'))
    const path = join(directory, 'unknown.sqlite3')
    const foreign = new DatabaseSync(path)
    foreign.exec('CREATE TABLE pc_schema_stamp(stamp TEXT PRIMARY KEY)')
    foreign.prepare('INSERT INTO pc_schema_stamp(stamp) VALUES (?)').run('foreign')
    foreign.close()
    try {
      expect(() => openSQLiteSession(path)).toThrowError(
        expect.objectContaining<Partial<SchemaGateError>>({
          kind: 'foreign-write-refused',
        }),
      )
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('adds the content journal only to an existing experimental stamp', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-additive-'))
    const path = join(directory, 'experimental.sqlite3')
    const database = new DatabaseSync(path)
    database.exec('CREATE TABLE pc_schema_stamp(stamp TEXT PRIMARY KEY)')
    database
      .prepare('INSERT INTO pc_schema_stamp(stamp) VALUES (?)')
      .run(EXPERIMENTAL_DATABASE_STAMP)
    database.close()
    const session = openSQLiteSession(path)
    try {
      expect(
        session
          .prepare(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'pc_content_source_entry'",
          )
          .get(),
      ).toEqual({ name: 'pc_content_source_entry' })
    } finally {
      session.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

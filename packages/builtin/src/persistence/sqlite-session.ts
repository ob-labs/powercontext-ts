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

import { DatabaseSync } from 'node:sqlite'
import { existsSync, realpathSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { LifecycleError } from '@powercontext/core'
import { bigintToSafeInteger } from '@powercontext/core'
import { ensureExperimentalSchema } from './schema-gate.js'

type SqliteStatement = ReturnType<DatabaseSync['prepare']>

const writerPaths = new Set<string>()

function normalizedPath(path: string): string {
  if (path === ':memory:') {
    return path
  }
  const absolutePath = resolve(path)
  if (existsSync(absolutePath)) {
    return realpathSync.native(absolutePath)
  }
  return resolve(realpathSync.native(dirname(absolutePath)), basename(absolutePath))
}

export class SQLiteSession {
  readonly path: string
  readonly database: DatabaseSync
  private closed = false

  private constructor(path: string, database: DatabaseSync) {
    this.path = path
    this.database = database
  }

  static open(path: string): SQLiteSession {
    const key = normalizedPath(path)
    const mayCreate = path === ':memory:' || !existsSync(path)
    if (key !== ':memory:' && writerPaths.has(key)) {
      throw new LifecycleError(
        `SQLite database already has an exclusive writer: ${path}`,
      )
    }
    const database = new DatabaseSync(path)
    try {
      database.exec('PRAGMA foreign_keys = ON')
      database.exec('PRAGMA busy_timeout = 5000')
      ensureExperimentalSchema(database, mayCreate)
      if (path !== ':memory:') {
        const journal = database.prepare('PRAGMA journal_mode = WAL').get() as
          { readonly journal_mode?: unknown } | undefined
        if (String(journal?.journal_mode ?? '').toLowerCase() !== 'wal') {
          throw new LifecycleError('SQLite database did not enter WAL mode')
        }
      }
      if (key !== ':memory:') {
        writerPaths.add(key)
      }
      return new SQLiteSession(path, database)
    } catch (error) {
      database.close()
      throw error
    }
  }

  assertOpen(): void {
    if (this.closed) {
      throw new LifecycleError('SQLite session is closed')
    }
  }

  exec(sql: string): void {
    this.assertOpen()
    this.database.exec(sql)
  }

  prepare(sql: string): SqliteStatement {
    this.assertOpen()
    const statement = this.database.prepare(sql)
    statement.setReadBigInts(true)
    return statement
  }

  safeInteger(value: bigint, field: string): number {
    return bigintToSafeInteger(value, field)
  }

  transaction<T>(operation: () => T): T {
    this.assertOpen()
    this.database.exec('BEGIN IMMEDIATE')
    try {
      const result = operation()
      this.database.exec('COMMIT')
      return result
    } catch (error) {
      try {
        this.database.exec('ROLLBACK')
      } catch {
        // Preserve the original transaction error.
      }
      throw error
    }
  }

  close(): void {
    if (this.closed) {
      return
    }
    this.closed = true
    const key = normalizedPath(this.path)
    if (key !== ':memory:') {
      writerPaths.delete(key)
    }
    this.database.close()
  }
}

export function openSQLiteSession(path: string): SQLiteSession {
  return SQLiteSession.open(path)
}

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
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  JS_MAX_SAFE_INTEGER,
  LifecycleError,
  SafeIntegerError,
} from '@powercontext/core'
import { openSQLiteSession } from '../src/index.js'

describe('SQLiteSession', () => {
  it('uses WAL, foreign keys, and a 5000ms busy timeout', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-session-'))
    const session = openSQLiteSession(join(directory, 'runtime.sqlite3'))
    try {
      expect(session.prepare('PRAGMA journal_mode').get()).toMatchObject({
        journal_mode: 'wal',
      })
      expect(session.prepare('PRAGMA foreign_keys').get()).toMatchObject({
        foreign_keys: 1n,
      })
      expect(session.prepare('PRAGMA busy_timeout').get()).toMatchObject({
        timeout: 5000n,
      })
    } finally {
      session.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('fails closed when an INTEGER is outside the JSON-safe range', () => {
    const session = openSQLiteSession(':memory:')
    try {
      session.exec('CREATE TABLE unsafe_integer(value INTEGER NOT NULL)')
      session
        .prepare('INSERT INTO unsafe_integer(value) VALUES (?)')
        .run(BigInt(JS_MAX_SAFE_INTEGER) + 1n)
      const row = session.prepare('SELECT value FROM unsafe_integer').get() as {
        value: bigint
      }
      expect(() => session.safeInteger(row.value, 'value')).toThrow(SafeIntegerError)
    } finally {
      session.close()
    }
  })

  it('rejects close-then-write and a queued write after close', async () => {
    const session = openSQLiteSession(':memory:')
    session.close()
    expect(() => session.exec('CREATE TABLE late_write(value TEXT)')).toThrow(
      LifecycleError,
    )
    await expect(
      Promise.resolve().then(() => session.prepare('SELECT 1')),
    ).rejects.toThrow(LifecycleError)
  })

  it('allows only one writer session per file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-writer-'))
    const path = join(directory, 'runtime.sqlite3')
    const first = openSQLiteSession(path)
    try {
      expect(() => openSQLiteSession(path)).toThrow(/exclusive writer/)
    } finally {
      first.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('treats relative and absolute aliases as the same writer path', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-writer-alias-'))
    const absolutePath = join(directory, 'runtime.sqlite3')
    const relativePath = relative(process.cwd(), absolutePath)
    const first = openSQLiteSession(absolutePath)
    try {
      expect(() => openSQLiteSession(relativePath)).toThrow(/exclusive writer/)
    } finally {
      first.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

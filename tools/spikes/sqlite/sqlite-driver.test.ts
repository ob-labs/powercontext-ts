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
import { performance } from 'node:perf_hooks'
import { DatabaseSync } from 'node:sqlite'
import { Worker } from 'node:worker_threads'
import BetterSqlite3 from 'better-sqlite3'
import { getLoadablePath } from 'sqlite-vec'
import { describe, expect, it } from 'vitest'
import {
  JS_MAX_SAFE_INTEGER,
  bigintToSafeInteger,
} from '../../../packages/protocol/src/integers.js'

function configureNodeDatabase(database: DatabaseSync): void {
  database.exec('PRAGMA foreign_keys = ON')
  database.exec('PRAGMA busy_timeout = 5000')
}

function queryLoopNode(iterations: number): number {
  const database = new DatabaseSync(':memory:')
  const statement = database.prepare('SELECT ? AS value')
  const started = performance.now()
  for (let index = 0; index < iterations; index += 1) {
    statement.get(index)
  }
  const elapsed = performance.now() - started
  database.close()
  return elapsed
}

function queryLoopBetter(iterations: number): number {
  const database = new BetterSqlite3(':memory:')
  const statement = database.prepare('SELECT ? AS value')
  const started = performance.now()
  for (let index = 0; index < iterations; index += 1) {
    statement.get(index)
  }
  const elapsed = performance.now() - started
  database.close()
  return elapsed
}

async function queryLoopWorker(iterations: number): Promise<{
  readonly queryMs: number
  readonly roundTripMs: number
}> {
  const source = `
    const { performance } = require('node:perf_hooks')
    const { DatabaseSync } = require('node:sqlite')
    const { parentPort, workerData } = require('node:worker_threads')
    const database = new DatabaseSync(':memory:')
    const statement = database.prepare('SELECT ? AS value')
    const started = performance.now()
    for (let index = 0; index < workerData.iterations; index += 1) statement.get(index)
    const queryMs = performance.now() - started
    database.close()
    parentPort.postMessage({ queryMs })
  `
  const started = performance.now()
  return await new Promise((resolve, reject) => {
    const worker = new Worker(source, { eval: true, workerData: { iterations } })
    worker.once('message', (message: { queryMs: number }) => {
      resolve({ queryMs: message.queryMs, roundTripMs: performance.now() - started })
    })
    worker.once('error', reject)
    worker.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`SQLite worker exited with code ${String(code)}`))
      }
    })
  })
}

describe('SQLite driver spike B / F', () => {
  it('compares node:sqlite and better-sqlite3 on a WAL file with FTS5 and extension loading', () => {
    const directory = mkdtempSync(join(tmpdir(), 'powercontext-sqlite-spike-'))
    const extension = getLoadablePath()
    const nodePath = join(directory, 'node.sqlite3')
    const betterPath = join(directory, 'better.sqlite3')
    const nodeDatabase = new DatabaseSync(nodePath, { allowExtension: true })
    const betterDatabase = new BetterSqlite3(betterPath)
    try {
      configureNodeDatabase(nodeDatabase)
      betterDatabase.pragma('foreign_keys = ON')
      betterDatabase.pragma('busy_timeout = 5000')
      expect(nodeDatabase.prepare('PRAGMA journal_mode = WAL').get()).toMatchObject({
        journal_mode: 'wal',
      })
      expect(betterDatabase.pragma('journal_mode = WAL', { simple: true })).toBe('wal')

      const compileOptions = nodeDatabase
        .prepare('PRAGMA compile_options')
        .all()
        .map((row) => String(Object.values(row)[0]))
      expect(compileOptions.some((option) => option.includes('FTS5'))).toBe(true)
      for (const database of [nodeDatabase, betterDatabase]) {
        database.exec(
          'CREATE VIRTUAL TABLE memory_fts USING fts5(text, tokenize="unicode61")',
        )
        database.exec("INSERT INTO memory_fts(text) VALUES ('alpha beta')")
        const hits = database
          .prepare('SELECT text FROM memory_fts WHERE memory_fts MATCH ?')
          .all('alpha')
        expect(hits).toHaveLength(1)
        database.loadExtension(extension)
        expect(database.prepare('SELECT vec_version() AS version').get()).toMatchObject(
          {
            version: 'v0.1.9',
          },
        )
      }
      expect(nodeDatabase.prepare('PRAGMA foreign_keys').get()).toMatchObject({
        foreign_keys: 1,
      })
      expect(betterDatabase.pragma('foreign_keys', { simple: true })).toBe(1)
      expect(nodeDatabase.prepare('PRAGMA busy_timeout').get()).toMatchObject({
        timeout: 5000,
      })
      expect(betterDatabase.pragma('busy_timeout', { simple: true })).toBe(5000)
    } finally {
      nodeDatabase.close()
      betterDatabase.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('rolls back a failed transaction without leaving partial state', () => {
    const database = new DatabaseSync(':memory:')
    configureNodeDatabase(database)
    database.exec('CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL)')
    database.exec('BEGIN')
    database.exec("INSERT INTO items(name) VALUES ('kept-if-committed')")
    database.exec('ROLLBACK')
    const rows = database.prepare('SELECT COUNT(*) AS count FROM items').get() as {
      count: number
    }
    expect(rows.count).toBe(0)
    database.close()
  })

  it('throws on default unsafe INTEGER reads and converts bigint only after a range check', () => {
    const database = new DatabaseSync(':memory:')
    configureNodeDatabase(database)
    database.exec('CREATE TABLE journal (position INTEGER PRIMARY KEY)')
    const unsafe = BigInt(JS_MAX_SAFE_INTEGER) + 1n
    database.prepare('INSERT INTO journal(position) VALUES (?)').run(unsafe)
    expect(() => database.prepare('SELECT position FROM journal').get()).toThrow(
      /too large to be represented as a JavaScript number/,
    )
    const statement = database.prepare('SELECT position FROM journal')
    statement.setReadBigInts(true)
    const row = statement.get() as { position: bigint }
    expect(row.position).toBe(unsafe)
    expect(() => bigintToSafeInteger(row.position, 'position')).toThrow(/JSON integer/)
    database.close()
  })

  it('measures main-thread and dedicated-worker query latency', async () => {
    const iterations = 1_000
    const nodeMainMs = queryLoopNode(iterations)
    const betterMainMs = queryLoopBetter(iterations)
    const worker = await queryLoopWorker(iterations)
    expect(nodeMainMs).toBeGreaterThanOrEqual(0)
    expect(betterMainMs).toBeGreaterThanOrEqual(0)
    expect(worker.queryMs).toBeGreaterThanOrEqual(0)
    expect(worker.roundTripMs).toBeGreaterThanOrEqual(worker.queryMs)
    process.stdout.write(
      `sqlite spike latency (${String(iterations)} SELECTs): ` +
        `node-main=${nodeMainMs.toFixed(2)}ms ` +
        `better-main=${betterMainMs.toFixed(2)}ms ` +
        `node-worker-query=${worker.queryMs.toFixed(2)}ms ` +
        `node-worker-roundtrip=${worker.roundTripMs.toFixed(2)}ms\n`,
    )
  })

  it('closes both candidates deterministically and rejects further work', () => {
    const nodeDatabase = new DatabaseSync(':memory:')
    const betterDatabase = new BetterSqlite3(':memory:')
    nodeDatabase.close()
    betterDatabase.close()
    expect(() => nodeDatabase.prepare('SELECT 1')).toThrow()
    expect(() => betterDatabase.prepare('SELECT 1')).toThrow()
  })
})

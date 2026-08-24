# Investigation: SQLite driver

## Question

Is `node:sqlite` enough for the M2 FTS-only kernel, or must `better-sqlite3`
be introduced immediately?

## Method

On Node v24.14.1, compare built-in `node:sqlite` `DatabaseSync` with
`better-sqlite3@13.0.3`. The latter and `sqlite-vec@0.1.9` are root-only
devDependencies and do not enter published packages.

## Result (Windows x64 sample; CI repeats on three OS families)

| Check | Result |
| --- | --- |
| `PRAGMA journal_mode = WAL` | Both return `wal` |
| FTS5 + MATCH | Both return 1 hit |
| Loadable extension | Both load the `sqlite-vec` probe and return `v0.1.9` |
| Foreign keys / busy timeout | Both `1` / `5000` |
| `BEGIN` / `INSERT` / `ROLLBACK` | `node:sqlite` row count is 0 after rollback |
| Default read of `9007199254740992` | `RangeError` |
| `statement.setReadBigInts(true)` | Returns `9007199254740992n` |
| 1000 SELECTs, main thread | Both candidates in the low-millisecond range |
| Prepare after close | Both fail deterministically |
| Runtime warning | `ExperimentalWarning: SQLite is an experimental feature` |

`sqlite-vec` here only proves a generic extension-loading path. It is not a
product dependency and is not Vec1 parity. The product Vec1 target remains the
SQLite official Vec1 used by Python.

## Conclusion

**M2 FTS-only choice: `node:sqlite`.**

1. Both candidates complete FTS5, WAL, foreign keys, extension loading,
   transactions, and deterministic close. `node:sqlite` adds no product native
   addon.
2. 64-bit reads must enable `readBigInts`, then use ADR 0001
   `bigintToSafeInteger`. Default number mode throwing is not a silent
   downgrade.
3. The API is still experimental. Persistence work must write backup, close
   race, event-loop budget, and long-lived worker RPC into the repository
   contract.
4. If later Vec1 is unreliable on `node:sqlite`, degrade to FTS-only. Do not
   fake vector. `better-sqlite3` may be a Runtime-package fallback and must
   never enter Protocol/Client.

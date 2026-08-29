# @powercontext/builtin

Experimental Node-only persistence skeleton for testing the TypeScript
language-switch pits. It uses Node `node:sqlite` `DatabaseSync`, an explicit
experimental database stamp, and SQLite FTS5 with the `powercontext.analyzer.v1`
lexical algorithm from `@powercontext/core`.

This is not the product Runtime, not C3, and not a replacement for the shared
Python database. `SHARED_DATABASE_WRITES_ALLOWED` remains `false`; unstamped or
foreign databases refuse writes without running DDL. Vector and hybrid search
are intentionally unavailable.

`DatabaseSync` is synchronous and can block the Node event loop during SQLite
work. The skeleton keeps that limitation visible rather than hiding it behind
an asynchronous-looking API.

## Pits found

- `DatabaseSync` blocks the event loop during synchronous SQLite work.
- Exclusive-writer detection is process-local; two OS processes can still open
  the same database because this skeleton does not add a cross-process lock.
- Analyzer parity is covered by an optional pinned-Python oracle. Run
  `POWERCONTEXT_SKELETON_ORACLE=1 POWERCONTEXT_PYTHON_ROOT=<real-powercontext> pnpm test packages/core/tests/analyzer-oracle.test.ts`
  with the checkout at commit `733e4bf6b378785e76274ff07632029c699ecb09`.

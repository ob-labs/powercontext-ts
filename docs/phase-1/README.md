# Phase 1 Exit Review

Status: implementation-complete; exit approval is pending required
Linux/macOS/Windows CI evidence.

- Baseline lock: `contract/baseline.lock.yaml`; still frozen at Python commit
  `733e4bf6b378785e76274ff07632029c699ecb09`. `contract_sync_version` is
  `0.1.0-phase1`. `phase` stays `0` because this file is the contract freeze,
  not the toolchain generation.
- Target profiles: unchanged (`client`, `sqlite-fts`, `sqlite-vector`,
  `oceanbase-hybrid`, `full-product`). Phase 1 does not claim a publishable
  product profile.
- Capability report: no new HTTP or domain capability is marked implemented.
  Phase 1 only adds engineering evidence for later phases.
- OpenAPI digest/count:
  `a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3`;
  API `0.0.2`; 52 operations; 177 schemas. The generator writes the same digest
  into `packages/protocol/src/generated`.
- Database contract version: still `unversioned-v0.0.2-anchor`. Shared-database
  writes remain closed (`SHARED_DATABASE_WRITES_ALLOWED = false`).
- MCP protocol/allowlist: allowlist digest unchanged. Spike C pins official
  TypeScript SDK v2.0.0 (`@modelcontextprotocol/server`,
  `@modelcontextprotocol/fastify`, `@modelcontextprotocol/node`) and locks the
  product protocol at `2025-03-26`. A real in-process Streamable HTTP initialize
  request negotiates that exact version.
- Supported Node/OS/CPU/database: CI now *defines* Node 22/24 Client, Node 24
  Runtime, and Linux/macOS/Windows smoke. Client tests pass locally on Windows
  with Node 22.23.2 and 24.14.1. `node_verification_status` remains
  `pending-phase1-ci` until all jobs have produced GitHub evidence.
- Required CI runs: `.github/workflows/ci.yml` (quality, client-matrix,
  runtime-matrix, smoke, oracle-smoke) and
  `.github/workflows/nightly-contract-advisory.yml`.
- Differential mismatches: none introduced. Phase 1 has no domain state traces.
- Security findings: Protocol/Client tarballs contain no native bindings. Pack
  smoke imports all seven packages, then creates a second clean project that
  installs only Protocol/Client and rejects native package/build markers.
- Performance budget/result: not a Phase 1 gate. Spike B recorded that
  `node:sqlite` is synchronous and still experimental on Node 24.14.1.
- Known limitations: no typed Client, no persistence writes, no MCP product
  server, no conformance fixtures beyond the generation/spike corpus. Node
  matrix is declared and both Windows Node 22 Client and Node 24 paths are
  locally verified; GitHub runner evidence is still required before merging the
  Phase 1 exit review.
- Migration/recovery evidence: unchanged. ADR 0001 and ADR 0002 still block
  shared-database writes.
- Product-line Go/No-Go and owners: **No-Go until the required three-OS CI run
  passes; then Go to Phase 2 only**, owned by `protocol-owner` and
  `conformance-owner`.
- Succession conclusion: none. Phase 1 is engineering evidence, not a
  mainline-migration decision.
- Remaining Python-only capabilities: all runtime capabilities.
- Cutover / dual-run / rollback-to-Python evidence: not applicable.
- Authority recommendation: Python remains the oracle.

## Phase 1 acceptance evidence

- [x] pnpm workspace, `tsconfig.base.json` (standards §4.2), ESLint, Prettier,
  Vitest, tsdown, pack smoke.
- [x] License header check (57 source files) and dependency governance.
- [x] TS-owned CI quality gates, contract drift, generated drift, Node matrix
  and nightly Python-main advisory.
- [x] Three-OS smoke definition checks full contract sync, source verification
  and two-run idempotence against the pinned Python checkout.
- [x] `tools/contract-sync/sync.py` pulls the pin; repeat run is a zero diff.
- [x] Oracle harness bootstraps Python 3.11 with uv and imports the pinned
  `powercontext` package (`0.1.dev448+g733e4bf6b`).
- [x] Six spike conclusions with measured data and executable regression tests:

  - [A](spikes/A-openapi-generation.md)
  - [B](spikes/B-sqlite-driver.md)
  - [C](spikes/C-mcp.md)
  - [D](spikes/D-jcs.md)
  - [E](spikes/E-oas3.md)
  - [F](spikes/F-64bit-integer.md)

## Local verification (2026-08-24, Node v24.14.1, Windows)

| Command | Result |
| --- | --- |
| `pnpm format` | pass |
| `pnpm lint` | pass |
| `pnpm typecheck` | pass |
| `pnpm build` | pass (7 packages, ESM + `.d.ts` + source maps) |
| `pnpm test` | 15 files / 78 tests pass |
| Node 22.23.2 Client matrix command | 5 files / 14 tests pass |
| `pnpm generate:check` | 52 operations current |
| `pnpm pack:smoke` | 7 tarballs imported; isolated Protocol/Client install has no native markers |
| `pnpm license:check` | 57 files |
| `pnpm deps:licenses` | installed dependency licenses are in the approved baseline |
| `pnpm deps:audit` | no known vulnerabilities; high/critical gate passes |
| `python tools/contract-sync/verify.py` | pass, source-verified |
| `python tools/contract-sync/test_sync.py` | two consecutive runs, zero diff |
| `python conformance/runners/python/run.py --check` | pin importable; dependencies installed via `uv sync --locked` |

## Required remote evidence

The workflows are executable repository content, but their run records are an
exit artifact and cannot be replaced by local commands.

| Evidence | Status | Run URL |
| --- | --- | --- |
| `quality` | pending remote | — |
| `client-matrix` (Node 22/24) | pending remote | — |
| `runtime-matrix` (Node 24) | pending remote | — |
| `smoke` (Linux/macOS/Windows, full contract-sync) | pending remote | — |
| `oracle-smoke` (Linux/macOS/Windows) | pending remote | — |
| manual `nightly-contract-advisory` | pending remote | — |

## Cross-repository follow-up (unchanged)

- Python: OpenAPI integer `minimum` / `maximum` (ADR 0001).
- Python: global schema version and write rejection (ADR 0002).
- Python: DSH `engines.node` floor to `>=22` (ADR 0007).
- This repository Phase 2: full request/response validator coverage, wire
  fixtures and the first provenance-bearing conformance export.

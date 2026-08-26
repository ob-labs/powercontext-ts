# M1 Client Exit Review

- Review date: 2026-08-26
- Construction scope: Phase 3
- Status: release candidate; final commit-bound CI is still required before npm publication
- Baseline lock: [`contract/baseline.lock.yaml`](../../contract/baseline.lock.yaml), Python commit `733e4bf6b378785e76274ff07632029c699ecb09`
- Target profiles: `client` / C1
- Capability report: [`conformance/reports/typescript.json`](../../conformance/reports/typescript.json) plus the Client transport tests listed below
- OpenAPI digest/count: `a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3`; 52 operations; 177 schemas
- Database contract version: not applicable; the Client has no persistence or native database dependency
- MCP protocol/allowlist: not applicable; the Client does not ship an MCP server
- Supported Node/OS/CPU/database: Node 22 and 24; Client CI is configured for Node 22/24, and package smoke is configured for Linux, macOS, and Windows. The local review ran on Node 24.14.1, Windows x64. Database support is not part of this profile.
- Required CI runs: local gates passed on 2026-08-26: format, lint, typecheck, build, full test suite, license header check, generated-artifact drift check, pinned-contract verification, conformance, dependency-license check, and package smoke. The final commit must still pass the repository `quality`, Node 22/24 `client-matrix`, and three-OS `smoke` jobs before publication.
- Differential mismatches: none accepted for the `client` / C1 scope. Undeclared 2xx statuses now follow the Python Client's Server-error classification, and malformed UTF-8 is rejected.
- Security findings: no open Client finding in this review. URL credentials/query tokens, redirects, oversized bodies, malformed success bodies, and unsafe JSON integers are rejected; response bodies and timeouts are bounded.
- Performance budget/result: no standalone latency budget for a network Client. The implementation adds no retry loop, native addon, database, or model call.
- Known limitations: Python remains the semantic oracle and Server. Runtime, persistence, MCP, CLI, Dashboard, and DSH host policy are not shipped. The DSH implementation PR is intentionally deferred to the Python repository. npm publication still requires a final version/credentials and green commit-bound CI.
- Migration/recovery evidence: not applicable to state because the package is stateless. Consumers can roll back by restoring their previous Client package version; the Python Server and databases are unchanged.
- Product-line Go/No-Go and owners: Go for M1 release-candidate review; No-Go for npm publication until final commit-bound CI passes. Owners: `product-owner`, `protocol-owner`, and `conformance-owner`.
- Succession conclusion: `keep-python-mainline`
- Remaining Python-only capabilities: all local Runtime, SQLite/OceanBase persistence, inference/provider integration, HTTP Server, MCP, CLI, Dashboard, and host integrations
- Cutover / dual-run / rollback-to-Python evidence: the TypeScript Client calls the unchanged pinned Python Server. No database writer or Server cutover occurs. DSH stays on its existing Python-repository implementation until its separate adapter PR passes existing unit/E2E tests.
- Authority recommendation: keep the pinned Python implementation as semantic oracle; use the pinned OpenAPI snapshot plus generated validators for `client` / C1 wire enforcement

## Phase 3 acceptance evidence

| Requirement | Result | Evidence |
| --- | --- | --- |
| Transport core | Pass | [`packages/client/tests/transport.test.ts`](../../packages/client/tests/transport.test.ts) covers URL/auth/User-Agent/request ID, timeout, caller abort, redirect, body bound, JSON, text, and bytes. |
| 52 typed methods | Pass | Generated `OperationId` mapping, compile-time request assertions in [`packages/client/tests/request-types.ts`](../../packages/client/tests/request-types.ts), and 52-method runtime enumeration. |
| Success runtime validation and error layers | Pass | Protocol-generated validators plus invalid JSON/schema/UTF-8/status tests; public error classes are exercised by Client tests. |
| Optional tracing hook | Pass | [`packages/client/tests/tracing.test.ts`](../../packages/client/tests/tracing.test.ts); no OpenTelemetry SDK dependency. |
| TypeScript Client to Python Server 52/52 | Pass locally | [`packages/client/tests/call-through.test.ts`](../../packages/client/tests/call-through.test.ts) starts the pinned Python Server and requires every operation to return either a validated success or an OpenAPI-declared Server error. |
| DSH reuse design | Pass for Phase 3 design scope | [`docs/develop/dsh-reuse.md`](../develop/dsh-reuse.md) moves generic transport to the official Client, preserves host policy, and aligns the plugin engine to `>=22 <25`. Python-repository implementation remains a later acceptance item. |
| Release docs and compatibility | Pass | [`packages/client/README.md`](../../packages/client/README.md) provides install, quickstart, compatibility, transport, errors, and DSH boundaries. |
| Clean, no-native tarball | Pass locally | `pnpm pack:smoke` builds and installs the packed Protocol and Client in a clean temporary project and rejects native dependencies or unexpected tarball files. |

## Release decision

The Phase 3 implementation and local acceptance gates are complete for the
M1 release candidate. This review does not substitute for CI on the final
commit and does not claim that npm publication has occurred. M1 may be
published only after the commit-bound gates above are green.

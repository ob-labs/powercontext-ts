# Phase 0 Exit Review

- Baseline lock: `contract/baseline.lock.yaml`; frozen at Python commit
  `733e4bf6b378785e76274ff07632029c699ecb09`; source-aware verification passed on
  2026-08-23.
- Target profiles: `client`, `sqlite-fts`, `sqlite-vector`,
  `oceanbase-hybrid`, `full-product`.
- Capability report: 52 HTTP operations and 32 domain capabilities have valid
  owners, target milestones, C0-C5 levels and profiles in
  `docs/governance/capability-manifest.yaml`. Phase 0 freezes targets; it does not
  claim that runtime capabilities are implemented.
- OpenAPI digest/count:
  `a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3`;
  API `0.0.2`; 52 operations; 177 schemas; exact pinned source blob verified.
- Database contract version: `unversioned-v0.0.2-anchor`; source-manifest digest
  `8f99bcce7b84f475ee25db730aba4f1ee2a91f09d5a7ef31e65a974f69d919d6`.
  This is an upgrade anchor and not a governed writable cross-language schema.
- MCP protocol/allowlist: provisional protocol `2025-03-26`; 22 sorted operation
  IDs; operation/complete-annotation digest
  `e4ad3cbe9537cac9819f562afebdb3c0b0e638c9f2d03af648f74d0976f6649f`;
  picker semantics included and pinned-source verified.
- Supported Node/OS/CPU/database: targets are Node Client 22/24 and Runtime 24;
  Linux/macOS/Windows; x64/arm64; SQLite/OceanBase. These are explicitly
  `target-not-verified`; platform CI starts in Phase 1.
- Required CI runs: Phase 0 source-aware checks are
  `python tools/contract-sync/verify.py` and
  `python tools/contract-sync/check_manifest.py`; both passed on 2026-08-23.
  Repository CI is a Phase 1 deliverable and is not claimed here.
- Differential mismatches: none in the Phase 0 pinned-source comparisons.
  Behavioral differential suites begin with conformance implementation in later
  phases.
- Security findings: no runtime code ships in Phase 0; no unresolved Phase 0
  security blocker. Provider secrets, external Skill execution and migration
  safety remain governed by the risk register and accepted ADRs.
- Performance budget/result: not applicable to the documentation-and-contract
  freeze. Runtime performance gates begin after implementation exists.
- Known limitations: no TypeScript runtime, package, CI platform evidence or
  conformance fixtures yet; MCP protocol pin remains provisional pending the
  Phase 1 spike; Node/platform/database entries are targets, not support claims;
  the database anchor is not safe for cross-language writes;
  `analyzer_id` is a governance label for Python Analyzer v1, not a Python
  string literal. The other analyzer/prompt/schema IDs are pinned-source literals.
- Migration/recovery evidence: ADR 0002 is accepted and keeps writes to existing
  Python databases blocked until the shared schema version, manifest and
  migration registry land. Migration/recovery implementation and rehearsal are
  Phase 5/12 work.
- Go/No-Go decision and owners: **Go to Phase 1 only**, owned by
  `protocol-owner`, `runtime-owner`, `product-owner`, `conformance-owner` and
  `python-owner`. **No-Go for Phase 5 shared-database writes** until ADR 0001 and
  ADR 0002 are implemented at the Python reference boundary.

## Phase 0 acceptance evidence

- [x] The exact 52 operations, 177 schemas and 32 domain capabilities are
  machine-checked for owner and target assignments.
- [x] Full parity and unavailable behavior have written definitions.
- [x] The integer and database-schema ownership blocking ADRs are accepted.
- [x] The baseline records and verifies the Python/package/dependency pin,
  OpenAPI, MCP annotations, CLI tree, defaults, database sources, analyzer and
  prompt IDs, versions and target matrix.
- [x] The repository-separation ADR is accepted and this repository is a sibling
  of the Python reference.
- [x] `CONTRIBUTING.md` prohibits a second wire contract and hand-edited contract
  snapshots.

## Cross-repository follow-up

These items are accepted Phase 0 decisions, not TypeScript implementation work:

- Python: add OpenAPI `minimum` / `maximum` for wire integers (ADR 0001).
- Python: land the global schema version, manifest and write rejection (ADR 0002).
- Python: raise the DSH plugin `engines.node` floor to `>=22` (ADR 0007).
- This repository Phase 1: completed on 2026-08-24 with required remote
  CI/nightly evidence. See `docs/phase-1/README.md`.

Do not open shared-database writes until the first two Python PRs merge and a
baseline bump absorbs them.

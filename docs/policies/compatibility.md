# Compatibility and parity policy

This is the written definition of cross-language alignment. Informal claims
such as “tests are green” or “it looks close enough” do not replace it.

Python remains the reference implementation and semantic oracle until a
written succession decision names a TypeScript profile as authority.

## Profiles and milestones

This repository ships a TypeScript product line that can align with Python
PowerContext. Releases are named by profile, not by construction phase:

- M1 `client`: Protocol and the official typed Client
- M2 `sqlite-fts`: Core, SQLite FTS, Memory, and a subset Server
- M3 domain runtime: Review, Experience, Skill, Handoff, Work, Report, Scheduler
- M4 `full-product`: inference, vector, OceanBase, full HTTP / MCP / CLI / hosts

### Out of scope for M1

- Local database, Scheduler, MCP Server, Dashboard
- Host approval policy inside the Client package
- Implementing all 52 HTTP routes in this repository

### Out of scope for M2

- Embedding, Vec1, hybrid search, and rerank model calls
- OceanBase
- Complete Experience / Skill / Handoff / Work / Report domains
- The 22-tool MCP surface, complete CLI, and five-host acceptance
- Calling `flush_memory` model extraction “aligned”

### Not ported

- Python module or class layout, and Pydantic / SQLAlchemy / FastAPI / FastMCP /
  Pydantic AI internals
- Generated Python HTTP files
- The `evaluation/` web, worker, container, and report platform
- Host plugin implementation languages (Codex, Claude Code, DSH, Bub, Hermes)
- Draft RFC text that is not yet observable in pinned Python

The Python `evaluation/` tree stays the evaluation control plane. This
repository only provides a black-box Server and parity evidence. A TypeScript
SUT adapter, if needed, is a Python-repository change.

## Levels

| Level | Name | Meaning |
| --- | --- | --- |
| C0 | API shape | Symbols or routes exist and compile |
| C1 | Wire parity | OpenAPI request / response / error / serialization match |
| C2 | Domain parity | State transitions, validation, idempotency, and conflicts match |
| C3 | Persistence parity | Transactions, schema, cross-reads, migration, and rebuild match |
| C4 | Operational parity | Lifecycle, readiness, metrics, tracing, CLI, and failover match |
| C5 | Release parity | Platform matrix, upgrades, docs, security, budgets, and support match |

## When full parity may be claimed

All of the following must hold:

1. OpenAPI 52 / 52 operations and 177 schemas have no unexplained drift.
2. Every public capability in the capability manifest has C1–C4 evidence; C5
   has release evidence.
3. The same golden inputs produce the same canonical bytes, hashes, IDs,
   order, state, and errors in Python and TypeScript.
4. The two Runtimes can read supported-version databases created by each other.
5. CAS, no-op, rollback, cursor failure, and close-race cases match.
6. SQLite FTS and PreparedContext meet the contract-level bar.
7. Vector / hybrid search share the ranking contract, allowing documented
   backend-specific raw score differences.
8. MCP allowlist, annotations, HTTP mapping, CLI exit codes, and permission
   boundaries match.
9. Migrations cover v0.0.2 and later public versions, with backup / rollback.
10. Capabilities accurately declare unavailable features. They must not pretend
    to be complete.
11. Shared acceptance (including LoCoMo-derived E2E and observability) passes.
    The evaluation platform itself is not ported.
12. Published packages are verified on the declared OS / CPU / Node LTS /
    database matrix.

## Successful states that are not full parity

| Actual delivery | Allowed claim | Forbidden claim |
| --- | --- | --- |
| Protocol + Client | TypeScript Client parity (`client` / C1) | Complete PowerContext TypeScript |
| SQLite FTS Runtime | Node Runtime Core profile (`sqlite-fts` / C3) | full-product C5 |
| Domain Runtime | M3 domain runtime C3 | The port is finished |

Unimplemented capabilities follow ADR 0008: do not register, do not advertise,
return unavailable, and never return a fake success.

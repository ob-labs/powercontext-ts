# Roadmap

This page is the living route for contributors. It names product milestones,
not construction phases. Task assignment lives in GitHub milestones and
issues. Scope and claim language live in the
[compatibility policy](policies/compatibility.md) and the
[capability manifest](policies/capability-manifest.yaml).

The 2026-08-23 construction study is background only. It is not the tracker.

## Where we are

| Surface | Status |
| --- | --- |
| Protocol types, 52 operation contracts, runtime validators | Done |
| C1 wire fixtures and deterministic Core C2 canonical fixtures | Done |
| Official typed HTTP Client transport | M1 release candidate (`client` / C1); see [exit review](reviews/m1-client-exit-review.md) |
| Deterministic Core primitives (JCS, NFC, hash, refs, UTF-8, fake-store) | Done for [#2](https://github.com/ob-labs/powercontext-ts/issues/2); `sqlite-fts` / C2 canonical fixtures evaluate through `@powercontext/core` |
| SQLite Runtime, Server, MCP, CLI | Not started |

Python remains the reference implementation and semantic oracle.

## Sequence

```text
typed Client (M1) ──┐
                    ├──► SQLite kernel ──► Memory / FTS ──► subset Server ──► M2 review
deterministic Core ─┘         ▲
                              │
                    ADR 0001 + ADR 0002 on the Python side
                    before any shared-database write
```

- Client work and Core primitives may start in parallel.
- Persistence writes wait for the Python integer-boundary and schema-version
  pull requests. Those land in the Python repository, then a baseline bump
  here.
- M3 and M4 stay later until M2 has a written product-line decision.

Stopping after a high-quality Client plus `sqlite-fts` Runtime is a valid
outcome. It must not be described as full-product C5.

## Near-term workstreams

Open one GitHub issue per row. Title the issue with the product name, not a
phase number.

| Milestone | Workstream | Issue | Notes |
| --- | --- | --- | --- |
| M1 `client` | Typed Client transport and 52 methods | [#1](https://github.com/ob-labs/powercontext-ts/issues/1) | First publishable product. Install must stay free of native addons. |
| M2 `sqlite-fts` | Deterministic Core (JCS, NFC, hash, refs, UTF-8) | [#2](https://github.com/ob-labs/powercontext-ts/issues/2) | Canonical bytes must match the Python oracle. |
| M2 `sqlite-fts` | SQLite kernel and schema-version gate | [#3](https://github.com/ob-labs/powercontext-ts/issues/3) | Blocked on Python ADR 0001 / 0002 follow-up. |
| M2 `sqlite-fts` | Memory, FTS, and PreparedContext | [#4](https://github.com/ob-labs/powercontext-ts/issues/4) | Vertical slice after the writer gate. |
| M2 `sqlite-fts` | Subset Server and cross-language HTTP E2E | [#5](https://github.com/ob-labs/powercontext-ts/issues/5) | Closes the `sqlite-fts` profile. |

After the subset Server ships, write two conclusions before widening scope:
continue the TypeScript product line, or stop at Client + `sqlite-fts`; and
whether any profile should succeed Python. See the compatibility policy.

## Later

| Milestone | Issue | When it opens |
| --- | --- | --- |
| M3 domain runtime | [#6](https://github.com/ob-labs/powercontext-ts/issues/6) | Only after the M2 product-line decision says go |
| M4 `full-product` | [#7](https://github.com/ob-labs/powercontext-ts/issues/7) | Inference, vector, OceanBase, full HTTP / MCP / CLI / hosts |

Draft RFC text is not an M4 requirement. Follow shipped Python behavior and
the RFC ledger.

## How we track work

1. GitHub milestones: [M1-client](https://github.com/ob-labs/powercontext-ts/milestone/1),
   [M2-sqlite-fts](https://github.com/ob-labs/powercontext-ts/milestone/2),
   [M3-domain](https://github.com/ob-labs/powercontext-ts/milestone/3),
   [M4-full-product](https://github.com/ob-labs/powercontext-ts/milestone/4).
2. Issues for the workstreams above. Labels name the area (`client`, `core`,
   `persistence`, `conformance`), not a construction phase.
3. Closing a milestone updates [Current status](user/README.md) and
   [CHANGELOG.md](../CHANGELOG.md), and records the applicable evidence in an
   auditable [exit review](reviews/m1-client-exit-review.md).

## Background

The original construction study (phases, estimates, and the M2 dual-axis
review) stays in the sibling research tree:

`../docs/research/03-typescript-zero-to-parity-roadmap.md`

Use it to recover sequencing detail. Do not copy it into this repository or
treat it as the issue tracker.

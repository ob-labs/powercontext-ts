# @powercontext/core

Deterministic Source / Artifact / Trigger contracts and canonical helpers
for the `sqlite-fts` profile.

The package owns RFC 8785 JCS, recursive NFC, domain-separated SHA-256,
UTF-8 byte budgets, reference sort/dedupe, and in-memory fake stores.
It has no Fastify, database driver, or provider SDK dependency.

Raw RFC 8785 JSON uses `canonicalize` with strict I-JSON checks. Do not use
`JSON.stringify` as a substitute. Finite IEEE numbers, including Appendix B
`±2^53` and `1e30`, stay valid on both raw JCS and `canonicalizeDomain`.
Python `int` tokens outside `±(2^53-1)` are rejected on the shared
`decimal-integer` fixtures and by `findUnsafeIntegerTokens`. Identity hashes
must use `hashDomain`, which canonicalizes through the domain helper first.
Typed Source/Artifact refs are projected to snake_case wire JSON before
sort/dedupe. See ADR 0006.

UTF-8 helpers reject lone UTF-16 surrogates instead of silently encoding the
replacement character. Source and Artifact identity limits count Unicode code
points, matching Python `len(str)`. Fake Artifact stores snapshot and deeply
freeze content and lineage so callers cannot rewrite revision history after a
commit.

The shared conformance suite executes these primitives as deterministic
`sqlite-fts` / C2 evidence. It does not claim that a SQLite persistence layer
ships in this package.

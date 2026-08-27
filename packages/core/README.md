# @powercontext/core

Deterministic Source / Artifact / Trigger contracts and canonical helpers
for the `sqlite-fts` profile.

The package owns RFC 8785 JCS, recursive NFC, domain-separated SHA-256,
UTF-8 byte budgets, reference sort/dedupe, and in-memory fake stores.
It has no Fastify, database driver, or provider SDK dependency.

Raw RFC 8785 JSON uses `canonicalize` with strict I-JSON checks. Do not use
`JSON.stringify` as a substitute. RFC Appendix B numbers remain valid in the
raw helper, including `±2^53`. Python `rfc8785==0.1.4` rejects those values as
`IntegerDomainError`. The project-domain helper follows that integer domain,
recursively applies NFC, preserves reserved object keys such as `__proto__`,
and rejects post-NFC key collisions. Hash identity bytes through the domain
helper. See ADR 0006.

UTF-8 helpers reject lone UTF-16 surrogates instead of silently encoding the
replacement character. Source and Artifact identity limits count Unicode code
points, matching Python `len(str)`. Fake Artifact stores snapshot and deeply
freeze content and lineage so callers cannot rewrite revision history after a
commit.

The shared conformance suite executes these primitives as deterministic
`sqlite-fts` / C2 evidence. It does not claim that a SQLite persistence layer
ships in this package.

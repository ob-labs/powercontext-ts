# Protocol generation

`tools/generate-protocol` reads `contract/openapi/powercontext.yaml` and writes
`packages/protocol/src/generated/`. Generated files carry `DO NOT EDIT`, a
source digest, and a generator version. Hand edits are rejected.

```text
pnpm generate
pnpm generate:check
```

The generator produces compile-time types, 52 operation metadata rows, request /
success / error contracts, Ajv validators, coverage, and a JSON OpenAPI document
for the oracle environment. The only versioned overlay is
`integer-safe-range.v1` (ADR 0001).

Drift between the generator and checked-in files fails CI.

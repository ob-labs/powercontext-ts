# Contributing to powercontext-ts

TypeScript PowerContext is a second implementation, not a fork of the Python
source tree. Read the Phase 0 and Phase 1 documents before writing code:

- `contract/baseline.lock.yaml`
- `docs/governance/capability-manifest.yaml`
- `docs/governance/full-parity.md`
- `docs/adr/`
- `docs/phase-1/README.md`

## Hard rules

1. **Do not add a second wire contract.** HTTP shapes come from
   `contract/openapi/powercontext.yaml` only. Hand-written OpenAPI, extra JSON
   Schema, or request/response interfaces that redefine the wire are rejected.
2. **Do not hand-edit contract or conformance snapshots.** Only
   `tools/contract-sync` and the oracle export path may change
   `contract/` and `conformance/` fixtures. Repeat runs of the same pin must be
   byte-identical.
3. **Do not hand-edit `packages/protocol/src/generated`.** Run `pnpm generate`.
   `pnpm generate:check` must stay green.
4. **Do not silently follow Python `main`.** Baseline bumps are dedicated PRs
   with compatibility review and matching fixtures. See
   `docs/governance/contract-sync-cadence.md`.
5. **Do not write a shared Python database** until ADR 0001 and ADR 0002 are
   implemented in both languages.
6. **Do not treat Draft RFC text as a requirement.** The RFC ledger is the
   status source. Shipped Python behavior wins over draft extras.

## Pull requests

PR CI runs format, lint, typecheck, build, unit tests, license headers,
generated-drift, contract-drift, pack smoke and the pinned Python oracle
bootstrap. Name the profile and C0–C5 target in the description.

```text
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm generate:check
python tools/contract-sync/verify.py
pnpm pack:smoke
```

Cross-language behavior changes need a compatibility decision. Python-side work
goes to the Python repository as its own PR.

## Package boundary

Dependency direction is `protocol <- client` and
`core <- builtin <- server <- cli`. `conformance/` stays at the repository root
and never enters an npm package.

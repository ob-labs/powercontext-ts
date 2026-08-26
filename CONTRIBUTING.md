# Contributing to powercontext-ts

TypeScript PowerContext is a second implementation, not a fork of the Python
source tree. Read these before writing code:

- [Documentation index](docs/index.md)
- [Roadmap](docs/roadmap.md)
- [Compatibility policy](docs/policies/compatibility.md)
- [Capability manifest](docs/policies/capability-manifest.yaml)
- [ADRs](docs/adr/README.md)
- [Contract-sync cadence](docs/policies/contract-sync.md)

Sibling checkout for local oracle and contract-sync work:

```text
<workspace>/
  powercontext/       # Python reference
  powercontext-ts/    # this repository
```

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
4. **Do not silently follow Python `main`.** Baseline bumps are dedicated pull
   requests with compatibility review and matching fixtures.
5. **Do not write a shared Python database** until ADR 0001 and ADR 0002 are
   implemented in both languages.
6. **Do not treat Draft RFC text as a requirement.** The
   [RFC ledger](docs/policies/rfc-ledger.yaml) is the status source. Shipped
   Python behavior wins over draft extras.

## Pull requests

Name the profile and C0–C5 target in the description. Cross-language behavior
changes need a compatibility decision. Python-side work goes to the Python
repository as its own pull request.

```text
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm build
pnpm test
# Optional: require Python Server call-through after oracle bootstrap
# POWERCONTEXT_CLIENT_CALLTHROUGH=1 pnpm test
pnpm generate:check
python conformance/runners/python/run.py --export-check
pnpm conformance
python tools/contract-sync/verify.py
pnpm pack:smoke
```

## Package boundary

Dependency direction is `protocol <- client` and
`core <- builtin <- server <- cli`. `conformance/` stays at the repository root
and never enters an npm package.

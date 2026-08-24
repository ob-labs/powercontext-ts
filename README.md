# powercontext-ts

TypeScript implementation of [PowerContext](https://github.com/oceanbase/powercontext).
This repository is the sibling of the Python reference, not a subdirectory of it.

Phase 0 froze the product boundary. Phase 1 lands the publishable workspace,
CI quality gates, contract-sync puller, oracle harness and the six risk spikes.

## Sibling layout

```text
<workspace>/
  powercontext/       # Python reference
  powercontext-ts/    # this repository
```

The two repositories do not share OpenAPI files, fixtures, release tags or CI.
The only Python → TypeScript channels are contract-sync and the oracle exporter.

## Workspace commands

```text
pnpm install
pnpm format
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm generate
pnpm generate:check
pnpm pack:smoke
pnpm license:check
python tools/contract-sync/verify.py
python tools/contract-sync/sync.py
```

Client packages (`@powercontext/protocol`, `@powercontext/client`) install without
native addons. Runtime work starts in later phases.

## Documents

- [Phase 1 exit review](docs/phase-1/README.md)
- [Baseline lock](contract/baseline.lock.yaml)
- [Capability manifest](docs/governance/capability-manifest.yaml)
- [ADRs](docs/adr/README.md)
- [Contributing](CONTRIBUTING.md)

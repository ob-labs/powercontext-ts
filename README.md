# powercontext-ts

TypeScript implementation of [PowerContext](https://github.com/oceanbase/powercontext).
This repository is the sibling of the Python reference, not a subdirectory of it.

Phase 0 is complete: the product boundary, baseline lock, ADRs, capability
manifest, RFC ledger and risk register are frozen here. Runtime packages are
intentionally empty until Phase 1.

## Sibling layout

```text
<workspace>/
  powercontext/       # Python reference
  powercontext-ts/    # this repository
```

The two repositories do not share OpenAPI files, fixtures, release tags or CI.
The only Python → TypeScript channels are contract-sync and the oracle exporter.

## Phase 0 facts

| Item | Value |
| --- | --- |
| Python pin | `733e4bf6b378785e76274ff07632029c699ecb09` |
| Package pin | `powercontext` at that commit |
| API | 0.0.2, 52 operations, 177 schemas |
| MCP allowlist | 22 operations |
| Node | Client 22/24, Runtime 24; Node 20 is out |
| Database contract | `unversioned-v0.0.2-anchor` until ADR 0002 lands in Python |

Verify the snapshot:

```text
python tools/contract-sync/verify.py
```

## Documents

- [Baseline lock](contract/baseline.lock.yaml)
- [Capability manifest](docs/governance/capability-manifest.yaml)
- [Full parity definition](docs/governance/full-parity.md)
- [Scope](docs/governance/scope.md)
- [RFC ledger](docs/governance/rfc-ledger.yaml)
- [Risk register](docs/governance/risk-register.md)
- [ADRs](docs/adr/README.md)
- [Contributing](CONTRIBUTING.md)

## What comes next

Phase 1 adds the pnpm workspace, CI, contract-sync puller and the SQLite / JCS /
OAS3 / MCP spikes. Do not start persistence writes before ADR 0001 and ADR 0002
are implemented.

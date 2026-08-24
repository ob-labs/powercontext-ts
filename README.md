# powercontext-ts

TypeScript implementation of [PowerContext](https://github.com/oceanbase/powercontext).
This repository is a sibling of the Python reference, not a subdirectory of it.

Python remains the reference implementation and semantic oracle. TypeScript
aligns through the pinned OpenAPI snapshot and the repository-root conformance
kit.

## Status

The `client` profile has Protocol types, 52 operation contracts, runtime
validators, and C1 wire / canonical fixtures. The official HTTP Client
transport, Runtime, Server, MCP, and CLI are not shipped.

See [Current status](docs/user/README.md) and the
[compatibility policy](docs/policies/compatibility.md).

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
python conformance/runners/python/run.py --export
python conformance/runners/python/run.py --export-check
pnpm conformance
```

`@powercontext/protocol` and `@powercontext/client` install without native
addons.

## Repository layout

```text
packages/       publishable and private workspace packages
contract/       pinned OpenAPI snapshot and baseline lock
conformance/    language-independent fixtures; not an npm package
tools/          protocol generator, contract-sync, license and pack smoke
docs/           policies, ADRs, and contributor notes
```

## Documents

- [Documentation index](docs/index.md)
- [Roadmap](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Security](SECURITY.md)
- [ADRs](docs/adr/README.md)
- [Compatibility policy](docs/policies/compatibility.md)
- [Baseline lock](contract/baseline.lock.yaml)

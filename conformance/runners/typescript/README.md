# TypeScript conformance runner

This directory is the documented entry for the TypeScript runner. The
implementation lives in `packages/conformance-runner` and must read assets from
the repository-root `conformance/` directory. It does not own fixture truth.

```text
pnpm conformance
```

The command emits separate `client` / C1 wire and deterministic
`sqlite-fts` / C2 Core reports under `conformance/reports/`.

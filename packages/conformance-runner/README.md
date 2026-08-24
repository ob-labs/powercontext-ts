# @powercontext/conformance-runner

Private runner. It reads repository-root `conformance/` assets and must not
publish fixtures.

```text
pnpm conformance
```

The runner evaluates wire and canonical fixtures against
`conformance/expected/` and writes `conformance/reports/typescript.json`.

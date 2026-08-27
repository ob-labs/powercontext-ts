# @powercontext/conformance-runner

Private runner. It reads repository-root `conformance/` assets and must not
publish fixtures.

```text
pnpm conformance
```

The runner evaluates wire and canonical fixtures against
`conformance/expected/`. It writes `typescript.json` for `client` / C1 wire
validation and `typescript-core.json` for deterministic `sqlite-fts` / C2
canonical behavior.

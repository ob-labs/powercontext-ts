# Contributor development notes

Local layout when the Python reference sits beside this repository:

```text
<workspace>/
  powercontext/       # Python reference
  powercontext-ts/    # this repository
```

The two repositories do not share OpenAPI files, fixtures, release tags, or CI.
The only Python → TypeScript channels are contract-sync and the oracle exporter.

| Topic | Document |
| --- | --- |
| Package boundaries | [packages.md](packages.md) |
| Protocol generation | [generating-protocol.md](generating-protocol.md) |
| Conformance kit | [conformance.md](conformance.md) |
| Investigation notes | [investigations/README.md](investigations/README.md) |

# Conformance reports

Runners write JSON reports here. The files are generated evidence, not fixture
truth, and are gitignored except this README.

```text
pnpm conformance
python conformance/runners/python/export.py --check
```

`typescript.json` records `client` / C1 wire results.
`typescript-core.json` records deterministic `sqlite-fts` / C2 canonical
results. Each report must name its profile and C0–C5 level.

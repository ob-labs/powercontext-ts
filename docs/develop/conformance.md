# Conformance kit

`conformance/` belongs to the repository root. It must not enter any npm
package. Snapshots carry provenance (`python_commit`, exporter version, digests).
Hand edits are forbidden. Repeat export of the same pin must be byte-identical.

```text
conformance/
  manifest.yaml
  schemas/
  fixtures/
  expected/
  reports/
  runners/
    python/       # oracle harness; installs pinned powercontext
    typescript/   # entry to packages/conformance-runner
```

```text
python conformance/runners/python/run.py --export
python conformance/runners/python/run.py --export-check
pnpm conformance
```

`pnpm conformance` evaluates wire and canonical fixtures against
`conformance/expected/` and writes `conformance/reports/typescript.json`.
Each report names the profile and C0–C5 level.

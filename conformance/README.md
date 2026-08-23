# Conformance assets

This directory belongs to the repository root. It must not enter any npm package.

Phase 0 only reserves the layout. Phase 2 fills schemas, fixtures, expected
results and runners.

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

Snapshots here need provenance: `python_commit`, exporter version and digest.
Hand edits are forbidden.

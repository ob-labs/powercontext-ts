# Conformance assets

This directory belongs to the repository root. It must not enter any npm
package. See [docs/develop/conformance.md](../docs/develop/conformance.md).

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

Snapshots need provenance: `python_commit`, exporter version, and digest.
Hand edits are forbidden.

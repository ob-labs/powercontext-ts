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

`pnpm conformance` evaluates fixtures against `conformance/expected/` and
writes two reports:

- `conformance/reports/typescript.json`: `client` / C1 wire validation.
- `conformance/reports/typescript-core.json`: deterministic
  `sqlite-fts` / C2 canonical behavior.

Each report names the profile and C0–C5 level. Canonical JCS, recursive NFC,
SHA-256, reference normalization, and UTF-8 cases—including expected-invalid
cases—are executed by `@powercontext/core`, not a runner-local serializer.
Shared integer-boundary cases use the domain path. Raw JCS keeps RFC 8785
Appendix B `±2^53`; see [ADR 0006](../adr/0006-jcs-hash-authority.md).

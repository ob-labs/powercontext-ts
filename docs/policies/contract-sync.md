# Contract-sync cadence

## Cadence

Open a baseline-bump pull request every two weeks. `tools/contract-sync`
produces the snapshot diff.

Urgent wire-breaking or security fixes may bump early. A bump must not ride
along inside an ordinary feature pull request.

## A bump pull request must include

1. The new `python_commit` and `openapi_sha256`.
2. An explanation of operation / schema count changes.
3. Updated digests when the MCP allowlist, defaults, or CLI tree change.
4. A compatibility review: compatible, compensated, or wire-breaking.
5. Fixtures and expected results exported from the same pin.
6. Matching edits to the RFC ledger and capability manifest.

## Forbidden

- Silently following Python `main` inside a feature pull request.
- Mixing OpenAPI snapshots and conformance fixtures from different baselines.
- Hand-editing `contract/` or `conformance/` snapshots to make tests pass.
- Committing new generated files without updating the lock.

## Detection

- Every pull request: `python tools/contract-sync/verify.py`. Snapshot and lock
  mismatches fail the job.
- Nightly: compare Python `main` OpenAPI, open an advisory issue, and do not
  block ordinary pull requests.
- Two consecutive contract-sync runs on the same pin must leave a zero diff.

API 0.0.2 is still evolving. Irregular rebases produce a merge explosion months
later, not a cheaper process.

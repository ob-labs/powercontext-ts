# Contract snapshots

This directory is the only TypeScript-side copy of the Python HTTP contract.

## Rules

1. `openapi/powercontext.yaml` is a byte-for-byte snapshot of the Python
   repository file at the commit pinned in `baseline.lock.yaml`.
2. Only `tools/contract-sync` may update files here. Hand edits are forbidden.
3. Do not add a second wire contract (hand-written OpenAPI, extra JSON Schema,
   or ad-hoc TypeScript interfaces that redefine request/response shapes).
4. Changing the snapshot requires a baseline bump pull request, compatibility
   review, and a matching fixture update. Feature pull requests must not
   silently follow Python `main`.

## Verification

From the repository root:

```text
python tools/contract-sync/verify.py
python tools/contract-sync/sync.py
python tools/contract-sync/sync.py --check
python tools/contract-sync/advisory.py
```

The command hashes `openapi/powercontext.yaml` after LF normalization, compares
it with `openapi_sha256`, and verifies that its content is the OpenAPI blob at
the exact pinned Python commit. It also validates the other digests and source
manifests in `baseline.lock.yaml`.

Structured policy values use canonical JSON (`ensure_ascii=true`, sorted object
keys, no insignificant whitespace) followed by SHA-256. The database
fingerprint is the same digest over a path-sorted array of `{path, sha256}`
entries. Each entry hashes the corresponding git blob at `python_commit`.
Analyzer, prompt, and schema IDs are checked against pinned Python literals,
except `analyzer_id`, which is a policy label for Analyzer v1.

# Contract snapshots

This directory is the only TypeScript-side copy of the Python HTTP contract.

## Rules

1. `openapi/powercontext.yaml` is a byte-for-byte snapshot of the Python repository
   file at the commit pinned in `baseline.lock.yaml`.
2. Only `tools/contract-sync` may update files here. Hand edits are forbidden.
3. Do not add a second wire contract (hand-written OpenAPI, extra JSON Schema,
   or ad-hoc TypeScript interfaces that redefine request/response shapes).
4. Changing the snapshot requires a baseline bump PR, compatibility review, and
   a matching fixture update. Feature PRs must not silently follow Python `main`.

## Verification

From the repository root:

```text
python tools/contract-sync/verify.py
```

The command hashes `openapi/powercontext.yaml` after LF normalization and
compares it with `openapi_sha256` in `baseline.lock.yaml`.

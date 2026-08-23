# contract-sync

Phase 0 ships only lock verification. The pull-and-rewrite tool arrives in Phase 1.

## Current command

```text
python tools/contract-sync/verify.py
```

It proves:

- `contract/openapi/powercontext.yaml` SHA-256 matches `baseline.lock.yaml`;
- operation count is 52 and schema count is 177;
- MCP allowlist, CLI tree, and default-configuration digests still match.

## Phase 1 responsibilities

- Pull `openapi/powercontext.yaml` from the Python commit in the lock
  (local sibling directory or `git` URL `@commit`);
- Rewrite `contract/` and update digests;
- Same pin must produce a zero diff on repeat.

# contract-sync

Phase 0 ships source-aware lock verification. The pull-and-rewrite command arrives
in Phase 1.

## Bootstrap

The verifier has one locked Python dependency:

```text
python -m pip install -r tools/contract-sync/requirements.lock.txt
```

## Verification

Run from the TypeScript repository root, with the Python reference checkout in
the sibling `../powercontext` directory:

```text
python tools/contract-sync/verify.py
```

Use `--python-repo <path>` for another local checkout. The command checks both
the checked-in lock and the objects at its exact `python_commit`. It proves:

- the OpenAPI snapshot, SHA-256, byte count, API version and 52/177 counts agree;
- the 22-operation MCP allowlist, complete annotations and picker semantics are
  derived from the pinned Python source and match their digest;
- the 29-command CLI tree and default configuration are derived from the same pin;
- every database-schema source blob and the pinned Python `uv.lock` match the
  recorded source manifests;
- the RFC ledger contains exactly the RFC files present at the pin;
- analyzer, prompt and schema IDs match pinned Python literals, except
  `analyzer_id`, which is a governance label for Analyzer v1 in `search.py`;
- all HTTP and domain capabilities have valid owners, milestones, levels and
  profiles.

`--snapshot-only` is a local diagnostic for environments without the Python
checkout. It does not satisfy the Phase 0 exit gate because it cannot prove
provenance against the pinned commit.

## Phase 1 responsibilities

- Pull `openapi/powercontext.yaml` from the Python commit in the lock
  (local sibling directory or `git` URL `@commit`);
- Rewrite `contract/` and update digests;
- Same pin must produce a zero diff on repeat.

# contract-sync

Pull, verify, advise, and prove that repeating a pin is a zero diff.

## Bootstrap

```text
python -m pip install -r tools/contract-sync/requirements.lock.txt
```

## Verify

```text
python tools/contract-sync/verify.py
```

Use `--python-repo <path>` for another checkout. `--snapshot-only` checks the
committed snapshot against the lock without opening the Python repository.

## Pull

```text
python tools/contract-sync/sync.py
python tools/contract-sync/sync.py --check
python tools/contract-sync/sync.py --from-git-url
```

The puller reads `python_commit` from the lock, copies
`openapi/powercontext.yaml` as LF bytes, and updates `openapi_sha256`,
`openapi_bytes`, `operation_count`, and `schema_count`. Repeating the same pin
must be a zero diff.

## Advisory

```text
python tools/contract-sync/advisory.py
```

Compares Python `main` with the frozen snapshot. Exit `10` means drift. Nightly
CI opens a compatibility-review issue and does not fail ordinary pull requests.

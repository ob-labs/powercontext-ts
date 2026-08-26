# Python oracle harness

This directory is a thin oracle. It installs the pinned `powercontext`
package and must not contain PowerContext implementation code.

## Bootstrap

From the TypeScript repository root, with the Python reference at
`../powercontext` or another checkout:

```text
python conformance/runners/python/bootstrap.py
python conformance/runners/python/run.py --check
```

The harness:

1. Verifies the pinned `uv.lock` digest from the baseline lock;
2. Creates `.venv` with `uv` and Python 3.11;
3. Checks out `python_commit` and runs
   `uv sync --locked --no-dev --no-editable --extra cli --extra server`
   into that environment so the pinned Server CLI can start for Client
   call-through;
4. Writes and verifies a lock marker containing the Python commit and dependency
   lock digest.

Export fixtures:

```text
python conformance/runners/python/run.py --export
python conformance/runners/python/run.py --export-check
```

The exporter writes `conformance/fixtures`, `conformance/expected` and
`conformance/provenance.json`. Repeat runs of the same pin must be
byte-identical. Do not hand-edit those snapshots.

CI repeats this on Linux, macOS and Windows.

# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.

"""Verify contract/ snapshots against baseline.lock.yaml."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from digests import count_operation_ids, count_schema_names, file_sha256
from lockfile import LOCK_PATH, OPENAPI_PATH, read_lock

ROOT = Path(__file__).resolve().parents[2]
EXPECTED_SYNC_VERSION = (ROOT / "tools" / "contract-sync" / "VERSION").read_text(
    encoding="utf-8"
).strip()


def fail(message: str) -> None:
    print(f"contract-sync verify failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    lock = read_lock()
    if not OPENAPI_PATH.is_file():
        fail(f"missing snapshot {OPENAPI_PATH}")
    digest = file_sha256(OPENAPI_PATH)
    if digest != lock["openapi_sha256"]:
        fail(f"openapi sha256 {digest} != lock {lock['openapi_sha256']}")
    text = OPENAPI_PATH.read_text(encoding="utf-8")
    operations = count_operation_ids(text)
    schemas = count_schema_names(text)
    if str(len(operations)) != lock["operation_count"]:
        fail(f"operation count {len(operations)} != {lock['operation_count']}")
    if str(len(schemas)) != lock["schema_count"]:
        fail(f"schema count {len(schemas)} != {lock['schema_count']}")
    if lock["api_version"] not in text:
        fail("api version 0.0.2 is not present in the snapshot")
    if lock["contract_sync_version"] != EXPECTED_SYNC_VERSION:
        fail("contract_sync_version does not match tools/contract-sync/VERSION")
    if not LOCK_PATH.is_file():
        fail("baseline.lock.yaml is missing")
    print("contract-sync verify passed")
    print(f"python_commit={lock['python_commit']}")
    print(f"openapi_sha256={digest}")
    print(f"operations={len(operations)} schemas={len(schemas)}")


if __name__ == "__main__":
    main()

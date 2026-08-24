# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.

"""Canonical digest helpers for baseline lock verification."""

from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Iterable, Mapping
from pathlib import Path


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def normalize_lf(payload: bytes) -> bytes:
    return payload.replace(b"\r\n", b"\n").replace(b"\r", b"\n")


def file_sha256(path: Path) -> str:
    return sha256_bytes(normalize_lf(path.read_bytes()))


def canonical_json_sha256(value: object) -> str:
    """Hash the repository's deterministic JSON encoding for governance data."""

    encoded = json.dumps(
        value, ensure_ascii=True, separators=(",", ":"), sort_keys=True
    )
    return sha256_bytes(encoded.encode("utf-8"))


def source_manifest_sha256(entries: Iterable[Mapping[str, str]]) -> str:
    """Hash a path-sorted source manifest containing path and blob SHA-256 values."""

    normalized = sorted(
        ({"path": entry["path"], "sha256": entry["sha256"]} for entry in entries),
        key=lambda entry: entry["path"],
    )
    return canonical_json_sha256(normalized)


def count_operation_ids(openapi_text: str) -> list[str]:
    return re.findall(
        r"^      operationId: ([A-Za-z0-9_]+)$", openapi_text, flags=re.MULTILINE
    )


def count_schema_names(openapi_text: str) -> list[str]:
    match = re.search(
        r"^  schemas:\n(.*)", openapi_text, flags=re.MULTILINE | re.DOTALL
    )
    if match is None:
        raise ValueError("components.schemas is missing")
    return re.findall(r"^    ([A-Za-z0-9_]+):$", match.group(1), flags=re.MULTILINE)

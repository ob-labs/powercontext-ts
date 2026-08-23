# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.

"""Minimal baseline-lock reader used before the Phase 1 YAML toolchain exists."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK_PATH = ROOT / "contract" / "baseline.lock.yaml"
OPENAPI_PATH = ROOT / "contract" / "openapi" / "powercontext.yaml"


def read_scalar(name: str, text: str) -> str:
    prefix = f"{name}:"
    for raw in text.splitlines():
        line = raw.strip()
        if line.startswith(prefix):
            return line[len(prefix) :].strip().strip('"')
    raise KeyError(name)


def read_lock() -> dict[str, str]:
    text = LOCK_PATH.read_text(encoding="utf-8")
    keys = (
        "python_commit",
        "contract_sync_version",
        "openapi_sha256",
        "api_version",
        "operation_count",
        "schema_count",
        "mcp_allowlist_digest",
        "cli_command_tree_digest",
        "default_configuration_digest",
        "database_schema_digest",
    )
    return {key: read_scalar(key, text) for key in keys}

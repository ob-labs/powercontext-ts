# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.

"""Typed baseline-lock loading for contract and policy verification."""

from __future__ import annotations

from pathlib import Path
from typing import Any

try:
    import yaml
except (
    ModuleNotFoundError
) as error:  # pragma: no cover - only an unbootstrapped environment reaches this branch
    raise SystemExit(
        "PyYAML is required; install tools/contract-sync/requirements.lock.txt"
    ) from error

ROOT = Path(__file__).resolve().parents[2]
LOCK_PATH = ROOT / "contract" / "baseline.lock.yaml"
OPENAPI_PATH = ROOT / "contract" / "openapi" / "powercontext.yaml"


def read_yaml_mapping(path: Path) -> dict[str, Any]:
    """Load one UTF-8 YAML document and require a mapping at its root."""

    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or not all(isinstance(key, str) for key in value):
        raise ValueError(f"{path} must contain a string-keyed YAML mapping")
    return value


def read_lock() -> dict[str, Any]:
    """Load the complete parity baseline instead of a selected scalar subset."""

    return read_yaml_mapping(LOCK_PATH)


__all__ = ["LOCK_PATH", "OPENAPI_PATH", "ROOT", "read_lock", "read_yaml_mapping"]

# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations

from typing import Any

from .paths import CONTRACTS_JSON, LOCK_PATH, OPENAPI_JSON
from .jsonio import load_json


def load_openapi() -> dict[str, Any]:
    document = load_json(OPENAPI_JSON)
    if not isinstance(document, dict):
        raise ValueError("generated OpenAPI document must be a mapping")
    return document


def lock_field(name: str) -> str:
    prefix = f"{name}:"
    for line in LOCK_PATH.read_text(encoding="utf-8").splitlines():
        if line.startswith(prefix):
            return line.split(":", 1)[1].strip().strip('"').strip("'")
    raise KeyError(name)


def load_contracts() -> list[dict[str, Any]]:
    payload = load_json(CONTRACTS_JSON)
    contracts = payload.get("contracts")
    if not isinstance(contracts, list) or len(contracts) != 52:
        raise ValueError("operation-contracts.json must list 52 operations")
    return contracts


def resolve_ref(document: dict[str, Any], ref: str) -> Any:
    if not ref.startswith("#/"):
        raise ValueError(f"unsupported ref: {ref}")
    current: Any = document
    for raw in ref[2:].split("/"):
        key = raw.replace("~1", "/").replace("~0", "~")
        if not isinstance(current, dict) or key not in current:
            raise KeyError(ref)
        current = current[key]
    return current


def deref(document: dict[str, Any], node: Any, seen: set[str] | None = None) -> Any:
    if not isinstance(node, dict) or not isinstance(node.get("$ref"), str):
        return node
    ref = node["$ref"]
    visited = set() if seen is None else seen
    if ref in visited:
        raise ValueError(f"cyclic ref: {ref}")
    visited.add(ref)
    return deref(document, resolve_ref(document, ref), visited)


def component_schema(document: dict[str, Any], name: str) -> Any:
    schemas = document.get("components", {}).get("schemas", {})
    if name not in schemas:
        raise KeyError(name)
    return schemas[name]

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

from .openapi import deref


def string_example(schema: dict[str, Any]) -> str:
    pattern = str(schema.get("pattern") or "")
    fmt = schema.get("format")
    if pattern == r"^sha256:[0-9a-f]{64}$":
        return "sha256:" + ("0" * 64)
    if pattern == r"^[0-9a-f]{64}$":
        return "0" * 64
    if fmt == "date-time":
        return "2026-08-17T00:00:00Z"
    if fmt == "date":
        return "2026-08-17"
    if pattern == r"^[\x21-\x7E]+$":
        return "id"
    minimum = int(schema.get("minLength") or 1)
    if r"\S" in pattern:
        return "x" * max(minimum, 1)
    return "x" * max(minimum, 1)


def integer_example(schema: dict[str, Any]) -> int:
    minimum = schema.get("minimum")
    if isinstance(minimum, int):
        return minimum
    return 1


def merge_all_of(document: dict[str, Any], schema: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = {"type": "object", "properties": {}, "required": []}
    for part in schema.get("allOf", []):
        resolved = deref(document, part)
        if isinstance(resolved, dict) and "allOf" in resolved:
            resolved = merge_all_of(document, resolved)
        if not isinstance(resolved, dict):
            continue
        properties = resolved.get("properties")
        if isinstance(properties, dict):
            merged["properties"].update(properties)
        required = resolved.get("required")
        if isinstance(required, list):
            merged["required"].extend(item for item in required if item not in merged["required"])
        if resolved.get("additionalProperties") is False:
            merged["additionalProperties"] = False
    return merged


def object_example(document: dict[str, Any], schema: dict[str, Any]) -> dict[str, Any]:
    properties = schema.get("properties") or {}
    required = schema.get("required") or []
    return {
        name: example_for(document, properties[name])
        for name in required
        if name in properties
    }


def one_of_example(document: dict[str, Any], schema: dict[str, Any]) -> Any:
    mapping = (schema.get("discriminator") or {}).get("mapping")
    if isinstance(mapping, dict) and mapping:
        first = sorted(mapping)[0]
        return example_for(document, {"$ref": mapping[first]})
    options = schema.get("oneOf") or schema.get("anyOf") or []
    return example_for(document, options[0]) if options else "x"


def example_for(document: dict[str, Any], schema: Any) -> Any:
    resolved = deref(document, schema)
    if not isinstance(resolved, dict):
        return "x"
    if "enum" in resolved:
        return resolved["enum"][0]
    if "allOf" in resolved:
        return example_for(document, merge_all_of(document, resolved))
    if "oneOf" in resolved or "anyOf" in resolved:
        return one_of_example(document, resolved)
    schema_type = resolved.get("type")
    if schema_type == "string":
        return string_example(resolved)
    if schema_type == "integer":
        return integer_example(resolved)
    if schema_type == "number":
        return 1
    if schema_type == "boolean":
        return False
    if schema_type == "array":
        count = int(resolved.get("minItems") or 0)
        item = resolved.get("items", {})
        return [example_for(document, item) for _ in range(count)]
    if schema_type == "object" or "properties" in resolved:
        return object_example(document, resolved)
    return "x"


def clone(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: clone(item) for key, item in value.items()}
    if isinstance(value, list):
        return [clone(item) for item in value]
    return value

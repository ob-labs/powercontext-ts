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

from .examples import clone, example_for
from .wire_case import wire_case


def enum_cases(document: dict[str, Any]) -> list[dict[str, Any]]:
    schemas = document.get("components", {}).get("schemas", {})
    cases: list[dict[str, Any]] = []
    for name in sorted(schemas):
        schema = schemas[name]
        if not isinstance(schema, dict):
            continue
        if "enum" in schema and schema.get("type", "string") == "string":
            cases.extend(root_enum_cases(name, list(schema["enum"])))
        properties = schema.get("properties") or {}
        for field in sorted(properties):
            field_schema = properties[field]
            if not isinstance(field_schema, dict) or "enum" not in field_schema:
                continue
            cases.extend(
                inline_enum_cases(
                    document,
                    name,
                    schema,
                    field,
                    list(field_schema["enum"]),
                )
            )
        if name == "HandoffCitation":
            cases.extend(citation_cases(document, schema))
    return cases


def root_enum_cases(name: str, values: list[Any]) -> list[dict[str, Any]]:
    node_tag = f"enum-node:{name}:$"
    cases = [
        wire_case(
            f"component.{name}.enum.root.valid.{index}",
            schema_name=name,
            role="component",
            expect="valid",
            tags=["enum", node_tag],
            value=value,
        )
        for index, value in enumerate(values)
    ]
    cases.append(
        wire_case(
            f"component.{name}.enum.root.invalid",
            schema_name=name,
            role="component",
            expect="invalid",
            tags=["enum", node_tag],
            value="__invalid_enum__",
        )
    )
    return cases


def inline_enum_cases(
    document: dict[str, Any],
    name: str,
    schema: dict[str, Any],
    field: str,
    values: list[Any],
) -> list[dict[str, Any]]:
    node_tag = f"enum-node:{name}:properties/{field}"
    base = example_for(document, schema)
    if not isinstance(base, dict):
        raise ValueError(f"inline enum parent {name} must have an object example")
    cases: list[dict[str, Any]] = []
    for index, value in enumerate(values):
        payload = clone(base)
        payload[field] = value
        cases.append(
            wire_case(
                f"component.{name}.enum.{field}.valid.{index}",
                schema_name=name,
                role="component",
                expect="valid",
                tags=["enum", node_tag],
                value=payload,
            )
        )
    invalid = clone(base)
    invalid[field] = "__invalid_enum__"
    cases.append(
        wire_case(
            f"component.{name}.enum.{field}.invalid",
            schema_name=name,
            role="component",
            expect="invalid",
            tags=["enum", node_tag],
            value=invalid,
        )
    )
    return cases


def citation_cases(document: dict[str, Any], schema: dict[str, Any]) -> list[dict[str, Any]]:
    mapping = (schema.get("discriminator") or {}).get("mapping") or {}
    cases: list[dict[str, Any]] = []
    for kind in sorted(mapping):
        value = example_for(document, {"$ref": mapping[kind]})
        cases.append(
            wire_case(
                f"component.HandoffCitation.valid.{kind}",
                schema_name="HandoffCitation",
                role="component",
                expect="valid",
                tags=["discriminator", "discriminator-node:HandoffCitation"],
                value=value,
            )
        )
    cases.append(
        wire_case(
            "component.HandoffCitation.invalid.kind",
            schema_name="HandoffCitation",
            role="component",
            expect="invalid",
            tags=["discriminator", "discriminator-node:HandoffCitation"],
            value={"kind": "unknown"},
        )
    )
    return cases

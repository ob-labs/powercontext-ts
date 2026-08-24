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

import json
from typing import Any

from .examples import clone
from .openapi import deref
from .wire_case import UNSAFE_INTEGER, wire_case

JS_MAX_SAFE_INTEGER = 9007199254740991


def first_required(schema: dict[str, Any]) -> str | None:
    required = schema.get("required") or []
    return required[0] if required else None


def find_enum_field(document: dict[str, Any], schema: dict[str, Any]) -> tuple[str, list[Any]] | None:
    properties = schema.get("properties") or {}
    for name, raw in properties.items():
        resolved = deref(document, raw)
        if isinstance(resolved, dict) and "enum" in resolved:
            return name, list(resolved["enum"])
    return None


def find_integer_field(
    document: dict[str, Any], schema: dict[str, Any]
) -> tuple[str, dict[str, Any]] | None:
    properties = schema.get("properties") or {}
    for name, raw in properties.items():
        resolved = deref(document, raw)
        if isinstance(resolved, dict) and resolved.get("type") == "integer":
            return name, resolved
    return None


def find_string_max(document: dict[str, Any], schema: dict[str, Any]) -> tuple[str, int] | None:
    properties = schema.get("properties") or {}
    for name, raw in properties.items():
        resolved = deref(document, raw)
        if (
            isinstance(resolved, dict)
            and resolved.get("type") == "string"
            and isinstance(resolved.get("maxLength"), int)
        ):
            return name, int(resolved["maxLength"])
    return None


def invalid_object_cases(
    document: dict[str, Any],
    operation_id: str,
    schema_name: str,
    schema: dict[str, Any],
    valid: Any,
) -> list[dict[str, Any]]:
    resolved = deref(document, schema)
    if not isinstance(resolved, dict) or not isinstance(valid, dict):
        return []
    cases: list[dict[str, Any]] = []
    required = first_required(resolved)
    if required is not None:
        missing = clone(valid)
        missing.pop(required, None)
        cases.append(
            wire_case(
                f"{operation_id}.request.invalid.missing",
                operation_id=operation_id,
                schema_name=schema_name,
                role="request",
                expect="invalid",
                tags=["missing"],
                value=missing,
            )
        )
        nulled = clone(valid)
        nulled[required] = None
        cases.append(
            wire_case(
                f"{operation_id}.request.invalid.null",
                operation_id=operation_id,
                schema_name=schema_name,
                role="request",
                expect="invalid",
                tags=["null"],
                value=nulled,
            )
        )
    extra = clone(valid)
    extra["__extra"] = True
    cases.append(
        wire_case(
            f"{operation_id}.request.invalid.extra",
            operation_id=operation_id,
            schema_name=schema_name,
            role="request",
            expect="invalid",
            tags=["extra"],
            value=extra,
        )
    )
    cases.extend(enum_and_bound_cases(document, operation_id, schema_name, resolved, valid))
    return cases


def enum_and_bound_cases(
    document: dict[str, Any],
    operation_id: str,
    schema_name: str,
    schema: dict[str, Any],
    valid: dict[str, Any],
) -> list[dict[str, Any]]:
    cases: list[dict[str, Any]] = []
    enum_field = find_enum_field(document, schema)
    if enum_field is not None and enum_field[0] in valid:
        broken = clone(valid)
        broken[enum_field[0]] = "__invalid_enum__"
        cases.append(
            wire_case(
                f"{operation_id}.request.invalid.enum",
                operation_id=operation_id,
                schema_name=schema_name,
                role="request",
                expect="invalid",
                tags=["enum"],
                value=broken,
            )
        )
    length = find_string_max(document, schema)
    if length is not None and length[0] in valid:
        boundary = clone(valid)
        boundary[length[0]] = "x" * length[1]
        cases.append(
            wire_case(
                f"{operation_id}.request.valid.max-length",
                operation_id=operation_id,
                schema_name=schema_name,
                role="request",
                expect="valid",
                tags=["max-length", "boundary"],
                value=boundary,
            )
        )
        broken = clone(valid)
        broken[length[0]] = "x" * (length[1] + 1)
        cases.append(
            wire_case(
                f"{operation_id}.request.invalid.max-length",
                operation_id=operation_id,
                schema_name=schema_name,
                role="request",
                expect="invalid",
                tags=["max-length"],
                value=broken,
            )
        )
    integer_field = find_integer_field(document, schema)
    if integer_field is not None:
        cases.extend(
            integer_boundary_cases(
                operation_id,
                schema_name,
                valid,
                integer_field[0],
                integer_field[1],
            )
        )
    return cases


def integer_case(
    operation_id: str,
    schema_name: str,
    valid: dict[str, Any],
    field: str,
    value: int,
    *,
    case_id: str,
    expect: str,
    compare: str = "both",
    overlay: str | None = None,
) -> dict[str, Any]:
    payload = clone(valid)
    payload[field] = value
    return wire_case(
        f"{operation_id}.request.{case_id}.{field}",
        operation_id=operation_id,
        schema_name=schema_name,
        role="request",
        expect=expect,
        tags=["integer", "boundary"] + (["overlay"] if overlay else []),
        compare=compare,
        overlay=overlay,
        raw_json=json.dumps(payload, separators=(",", ":"), ensure_ascii=False),
        value=payload,
    )


def integer_boundary_cases(
    operation_id: str,
    schema_name: str,
    valid: dict[str, Any],
    field: str,
    schema: dict[str, Any],
) -> list[dict[str, Any]]:
    cases: list[dict[str, Any]] = []
    minimum = schema.get("minimum")
    maximum = schema.get("maximum")
    if isinstance(minimum, int):
        cases.append(
            integer_case(
                operation_id,
                schema_name,
                valid,
                field,
                minimum,
                case_id="valid.integer-min",
                expect="valid",
            )
        )
        cases.append(
            integer_case(
                operation_id,
                schema_name,
                valid,
                field,
                minimum - 1,
                case_id="invalid.integer-below-min",
                expect="invalid",
            )
        )
    if isinstance(maximum, int):
        cases.append(
            integer_case(
                operation_id,
                schema_name,
                valid,
                field,
                maximum,
                case_id="valid.integer-max",
                expect="valid",
            )
        )
        cases.append(
            integer_case(
                operation_id,
                schema_name,
                valid,
                field,
                maximum + 1,
                case_id="invalid.integer-above-max",
                expect="invalid",
            )
        )
    else:
        cases.append(
            integer_case(
                operation_id,
                schema_name,
                valid,
                field,
                JS_MAX_SAFE_INTEGER,
                case_id="valid.safe-integer-max",
                expect="valid",
            )
        )
    cases.append(
        integer_case(
            operation_id,
            schema_name,
            valid,
            field,
            UNSAFE_INTEGER,
            case_id="invalid.unsafe-integer",
            expect="invalid",
            compare="typescript-only",
            overlay="integer-safe-range.v1",
        )
    )
    return cases

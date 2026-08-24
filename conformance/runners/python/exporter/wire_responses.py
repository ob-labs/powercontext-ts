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

from .examples import example_for
from .openapi import component_schema
from .wire_case import wire_case

ERROR_EXAMPLE = {
    "error": {
        "code": "invalid_request",
        "message": "bad input",
        "details": None,
    }
}


def success_cases(document: dict[str, Any], contract: dict[str, Any]) -> list[dict[str, Any]]:
    operation_id = contract["operationId"]
    cases: list[dict[str, Any]] = []
    for media in contract.get("success", []):
        kind = media.get("kind")
        status = media.get("status")
        content_type = media.get("contentType")
        schema_name = media.get("schemaName")
        if kind == "text":
            cases.append(
                wire_case(
                    f"{operation_id}.success.valid.text",
                    operation_id=operation_id,
                    role="success",
                    expect="valid",
                    tags=["text"],
                    status=status,
                    content_type=content_type,
                    value="# report\n",
                )
            )
            cases.append(
                wire_case(
                    f"{operation_id}.success.invalid.text",
                    operation_id=operation_id,
                    role="success",
                    expect="invalid",
                    tags=["text"],
                    status=status,
                    content_type=content_type,
                    value={"markdown": True},
                )
            )
            continue
        if schema_name is None:
            continue
        value = example_for(document, component_schema(document, schema_name))
        cases.append(
            wire_case(
                f"{operation_id}.success.valid.json",
                operation_id=operation_id,
                schema_name=schema_name,
                role="success",
                expect="valid",
                tags=["json"],
                status=status,
                content_type=content_type,
                value=value,
            )
        )
    return cases


def error_value(document: dict[str, Any], schema_name: str | None) -> Any:
    if schema_name == "ErrorResponse":
        return ERROR_EXAMPLE
    if schema_name is None:
        return None
    return example_for(document, component_schema(document, schema_name))


def error_cases(document: dict[str, Any], contract: dict[str, Any]) -> list[dict[str, Any]]:
    operation_id = contract["operationId"]
    cases: list[dict[str, Any]] = []
    seen: set[int] = set()
    for media in contract.get("errors", []):
        status = media.get("status")
        if not isinstance(status, int) or status in seen:
            continue
        seen.add(status)
        cases.append(
            wire_case(
                f"{operation_id}.error.valid.{status}",
                operation_id=operation_id,
                schema_name=media.get("schemaName"),
                role="error",
                expect="valid",
                tags=["error"],
                status=status,
                content_type=media.get("contentType"),
                value=error_value(document, media.get("schemaName")),
            )
        )
    if cases and cases[-1].get("schemaName") == "ErrorResponse":
        extra = {
            "error": {**ERROR_EXAMPLE["error"]},
            "__extra": True,
        }
        cases.append(
            wire_case(
                f"{operation_id}.error.invalid.extra",
                operation_id=operation_id,
                schema_name="ErrorResponse",
                role="error",
                expect="invalid",
                tags=["error", "extra"],
                status=cases[0]["status"],
                content_type="application/json",
                value=extra,
            )
        )
    return cases

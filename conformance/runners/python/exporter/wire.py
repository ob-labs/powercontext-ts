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
from .wire_mutations import invalid_object_cases


def request_cases(document: dict[str, Any], contract: dict[str, Any]) -> list[dict[str, Any]]:
    operation_id = contract["operationId"]
    schema_name = contract["request"]["schemaName"]
    if schema_name is None:
        return empty_request_cases(operation_id)
    schema = component_schema(document, schema_name)
    valid = example_for(document, schema)
    cases = [
        wire_case(
            f"{operation_id}.request.valid.minimal",
            operation_id=operation_id,
            schema_name=schema_name,
            role="request",
            expect="valid",
            tags=["minimal"],
            value=valid,
        )
    ]
    cases.extend(invalid_object_cases(document, operation_id, schema_name, schema, valid))
    return cases


def empty_request_cases(operation_id: str) -> list[dict[str, Any]]:
    return [
        wire_case(
            f"{operation_id}.request.valid.empty",
            operation_id=operation_id,
            role="request",
            expect="valid",
            tags=["empty"],
        ),
        wire_case(
            f"{operation_id}.request.invalid.extra",
            operation_id=operation_id,
            role="request",
            expect="invalid",
            tags=["extra"],
            value={},
        ),
    ]

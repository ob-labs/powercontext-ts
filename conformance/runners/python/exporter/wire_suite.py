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

from .openapi import load_contracts, load_openapi
from .validate import pydantic_valid
from .wire import request_cases
from .wire_enums import enum_cases
from .wire_responses import error_cases, success_cases


def build_wire_cases() -> list[dict[str, Any]]:
    document = load_openapi()
    cases: list[dict[str, Any]] = []
    for contract in load_contracts():
        cases.extend(request_cases(document, contract))
        cases.extend(success_cases(document, contract))
        cases.extend(error_cases(document, contract))
    cases.extend(enum_cases(document))
    return cases


def expected_for_case(case: dict[str, Any]) -> dict[str, Any]:
    schema_name = case.get("schemaName")
    python_valid = (
        pydantic_valid(schema_name, case.get("value"))
        if isinstance(schema_name, str) and "value" in case
        else None
    )
    result: dict[str, Any] = {
        "valid": case["expect"] == "valid",
        "engine": "pydantic" if case.get("compare") == "both" else "typescript-overlay",
    }
    if python_valid is not None:
        result["pythonValid"] = python_valid
    return result


def build_wire_expected(cases: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema": "powercontext.conformance.expected.v1",
        "contractVersion": 1,
        "suite": "wire",
        "sourceReference": "../provenance.json",
        "fixtureReference": "../fixtures/wire.json",
        "results": {case["id"]: expected_for_case(case) for case in cases},
    }


def build_wire_fixture(cases: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema": "powercontext.conformance.wire.v1",
        "contractVersion": 1,
        "suite": "wire",
        "profile": "client",
        "capabilities": ["protocol.wire-validation"],
        "sourceReference": "../provenance.json",
        "determinism": {
            "clock": "not-used",
            "id": "case.id",
            "seed": 0,
        },
        "comparator": "python-oracle-validity",
        "expectedReference": "../expected/wire.json",
        "cases": cases,
    }

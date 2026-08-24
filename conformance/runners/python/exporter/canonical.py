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

from hashlib import sha256
from typing import Any

import rfc8785

VECTORS: list[tuple[str, object]] = [
    (
        "literals-and-numbers",
        {
            "numbers": [333333333.3333333, 1e30, 4.5, 2e-3, 1e-27],
            "literals": [None, True, False],
        },
    ),
    ("key-order", {"b": 1, "a": 2}),
    ("negative-zero", {"value": -0.0}),
    ("unicode-keys", {"😀": "astral", "€": "euro", "1": "digit", "\r": "control"}),
    ("control-escape", {"value": '\b\t\n\f\r"\\\u0001'}),
    ("empty", {"object": {}, "array": [], "empty": ""}),
    ("cjk", {"text": "中文测试"}),
    ("combining", {"text": "e\u0301"}),
]


def jcs_bytes(value: object) -> bytes:
    return rfc8785.dumps(value)


def canonical_case(kind: str, case_id: str, payload: object) -> dict[str, Any]:
    return {"id": case_id, "kind": kind, "input": payload, "tags": [kind]}


def build_canonical_cases() -> list[dict[str, Any]]:
    cases: list[dict[str, Any]] = []
    for name, payload in VECTORS:
        cases.append(canonical_case("jcs", f"jcs.{name}", payload))
        cases.append(canonical_case("hash", f"hash.{name}", payload))
    cases.append(
        canonical_case(
            "sorting",
            "sorting.utf16-keys",
            ["\ue000", "😀", "€", "1", "\r"],
        )
    )
    for name, text in [
        ("ascii", "hello"),
        ("cjk", "中文"),
        ("emoji", "😀"),
        ("combining", "e\u0301"),
        ("mixed", "PowerContext 中文 😀"),
    ]:
        cases.append(canonical_case("utf8", f"utf8.{name}", {"text": text}))
    return cases


def expected_for_canonical(case: dict[str, Any]) -> dict[str, Any]:
    kind = case["kind"]
    payload = case["input"]
    if kind == "jcs":
        return {"valid": True, "canonical": jcs_bytes(payload).decode("utf-8")}
    if kind == "hash":
        digest = sha256(jcs_bytes(payload)).hexdigest()
        return {"valid": True, "sha256": digest}
    if kind == "sorting":
        obj = {key: True for key in payload}
        canonical = jcs_bytes(obj).decode("utf-8")
        return {"valid": True, "canonical": canonical}
    if kind == "utf8":
        text = payload["text"]
        return {"valid": True, "bytes": len(text.encode("utf-8"))}
    raise ValueError(kind)


def build_canonical_fixture(cases: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema": "powercontext.conformance.canonical.v1",
        "contractVersion": 1,
        "suite": "canonical",
        "profile": "client",
        "capabilities": [
            "canonical.jcs",
            "canonical.hash",
            "canonical.sorting",
            "canonical.utf8-bytes",
        ],
        "sourceReference": "../provenance.json",
        "determinism": {
            "clock": "not-used",
            "id": "case.id",
            "seed": 0,
        },
        "comparator": "rfc8785-and-utf8-exact",
        "expectedReference": "../expected/canonical.json",
        "cases": cases,
    }


def build_canonical_expected(cases: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema": "powercontext.conformance.expected.v1",
        "contractVersion": 1,
        "suite": "canonical",
        "sourceReference": "../provenance.json",
        "fixtureReference": "../fixtures/canonical.json",
        "results": {case["id"]: expected_for_canonical(case) for case in cases},
    }

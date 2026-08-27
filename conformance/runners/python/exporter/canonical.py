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
from powercontext.builtin.artifacts.memory.canonical import (
    canonical_json as domain_json_bytes,
)
from powercontext.builtin.artifacts.memory.canonical import normalize_refs

ENTRY_CONTENT_HASH_DOMAIN = b"powercontext:entry-content:v1\0"

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


def canonical_case(
    kind: str,
    case_id: str,
    payload: object,
    *,
    expect: str = "valid",
    input_mode: str = "json",
) -> dict[str, Any]:
    return {
        "id": case_id,
        "kind": kind,
        "expect": expect,
        "input": payload,
        "inputMode": input_mode,
        "tags": [kind, expect],
    }


def build_canonical_cases() -> list[dict[str, Any]]:
    cases: list[dict[str, Any]] = []
    for name, payload in VECTORS:
        cases.append(canonical_case("jcs", f"jcs.{name}", payload))
        cases.append(canonical_case("hash", f"hash.{name}", payload))
    cases.extend(
        [
            canonical_case(
                "jcs",
                "jcs.invalid.lone-high-surrogate",
                {"codeUnits": [0xD800]},
                expect="invalid",
                input_mode="unicode-code-units",
            ),
            canonical_case(
                "jcs",
                "jcs.invalid.lone-low-surrogate",
                {"codeUnits": [0xDC00]},
                expect="invalid",
                input_mode="unicode-code-units",
            ),
            canonical_case("domain", "domain.nfc-recursive", {"nested": [{"text": "e\u0301"}]}),
            canonical_case(
                "domain",
                "domain.reserved-object-keys",
                {"__proto__": {"polluted": True}, "constructor": "preserved"},
            ),
            canonical_case("domain", "domain.float-1e30", {"value": 1e30}),
            canonical_case(
                "domain",
                "domain.invalid.nfc-key-collision",
                {"e\u0301": 1, "é": 2},
                expect="invalid",
            ),
            canonical_case(
                "domain",
                "domain.safe-positive-integer",
                {"decimal": "9007199254740991"},
                input_mode="decimal-integer",
            ),
            canonical_case(
                "domain",
                "domain.safe-negative-integer",
                {"decimal": "-9007199254740991"},
                input_mode="decimal-integer",
            ),
            canonical_case(
                "domain",
                "domain.invalid.unsafe-positive-integer",
                {"decimal": "9007199254740992"},
                expect="invalid",
                input_mode="decimal-integer",
            ),
            canonical_case(
                "domain",
                "domain.invalid.unsafe-negative-integer",
                {"decimal": "-9007199254740992"},
                expect="invalid",
                input_mode="decimal-integer",
            ),
            canonical_case(
                "refs",
                "refs.nfc-sort-dedupe",
                [{"id": "b"}, {"id": "a"}, {"id": "e\u0301"}, {"id": "é"}],
            ),
            canonical_case(
                "domain-hash",
                "domain-hash.entry-content",
                {"domain": "entry-content", "value": {"kind": "preference", "text": "Cafe\u0301"}},
            ),
        ]
    )
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
    cases.extend(
        [
            canonical_case(
                "utf8",
                "utf8.invalid.lone-high-surrogate",
                {"codeUnits": [0xD800]},
                expect="invalid",
                input_mode="unicode-code-units",
            ),
            canonical_case(
                "utf8",
                "utf8.invalid.lone-low-surrogate",
                {"codeUnits": [0xDC00]},
                expect="invalid",
                input_mode="unicode-code-units",
            ),
        ]
    )
    return cases


def materialize_input(case: dict[str, Any]) -> object:
    mode = case["inputMode"]
    payload = case["input"]
    if mode == "json":
        return payload
    if mode == "unicode-code-units":
        text = "".join(chr(value) for value in payload["codeUnits"])
        return {"text": text} if case["kind"] == "utf8" else {"value": text}
    if mode == "decimal-integer":
        return {"value": int(payload["decimal"])}
    raise ValueError(f"unknown canonical input mode: {mode}")


def evaluate_canonical(case: dict[str, Any]) -> dict[str, Any]:
    kind = case["kind"]
    payload = materialize_input(case)
    if kind == "jcs":
        return {"valid": True, "canonical": jcs_bytes(payload).decode("utf-8")}
    if kind == "domain":
        return {"valid": True, "canonical": domain_json_bytes(payload).decode("utf-8")}
    if kind == "hash":
        digest = sha256(jcs_bytes(payload)).hexdigest()
        return {"valid": True, "sha256": digest}
    if kind == "domain-hash":
        if payload["domain"] != "entry-content":
            raise ValueError(f"unknown hash domain: {payload['domain']}")
        digest = sha256(ENTRY_CONTENT_HASH_DOMAIN + domain_json_bytes(payload["value"])).hexdigest()
        return {"valid": True, "sha256": digest}
    if kind == "refs":
        canonical = domain_json_bytes(list(normalize_refs(payload))).decode("utf-8")
        return {"valid": True, "canonical": canonical}
    if kind == "sorting":
        obj = {key: True for key in payload}
        canonical = jcs_bytes(obj).decode("utf-8")
        return {"valid": True, "canonical": canonical}
    if kind == "utf8":
        text = payload["text"]
        return {"valid": True, "bytes": len(text.encode("utf-8"))}
    raise ValueError(kind)


def expected_for_canonical(case: dict[str, Any]) -> dict[str, Any]:
    try:
        result = evaluate_canonical(case)
    except (rfc8785.CanonicalizationError, UnicodeError, TypeError, ValueError) as error:
        if case["expect"] != "invalid":
            raise
        return {"valid": False, "error": type(error).__name__}
    if case["expect"] == "invalid":
        raise AssertionError(f"canonical invalid case unexpectedly succeeded: {case['id']}")
    return result


def build_canonical_fixture(cases: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema": "powercontext.conformance.canonical.v1",
        "contractVersion": 1,
        "suite": "canonical",
        "profile": "sqlite-fts",
        "capabilities": [
            "canonical.jcs",
            "canonical.nfc",
            "canonical.hash",
            "canonical.sorting",
            "canonical.refs",
            "canonical.utf8-bytes",
        ],
        "sourceReference": "../provenance.json",
        "determinism": {
            "clock": "not-used",
            "id": "case.id",
            "seed": 0,
        },
        "comparator": "python-canonical-exact",
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

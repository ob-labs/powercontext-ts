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

from pathlib import Path

from .canonical import (
    build_canonical_cases,
    build_canonical_expected,
    build_canonical_fixture,
)
from .jsonio import dump_json, sha256_text, write_json
from .paths import (
    CANONICAL_EXPECTED,
    CANONICAL_FIXTURE,
    EXPORTER_VERSION,
    PROVENANCE_PATH,
    WIRE_EXPECTED,
    WIRE_FIXTURE,
)
from .wire_suite import build_wire_cases, build_wire_expected, build_wire_fixture


def snapshot_files() -> dict[str, str]:
    wire_cases = build_wire_cases()
    canonical_cases = build_canonical_cases()
    return {
        str(WIRE_FIXTURE): dump_json(build_wire_fixture(wire_cases)),
        str(CANONICAL_FIXTURE): dump_json(build_canonical_fixture(canonical_cases)),
        str(WIRE_EXPECTED): dump_json(build_wire_expected(wire_cases)),
        str(CANONICAL_EXPECTED): dump_json(build_canonical_expected(canonical_cases)),
    }


def write_snapshot(files: dict[str, str]) -> None:
    for path, text in files.items():
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8", newline="\n")


def folder_digest(files: dict[str, str], folder: str) -> str:
    payload = {
        f"{folder}/{Path(path).name}": sha256_text(text)
        for path, text in files.items()
        if Path(path).parent.name == folder
    }
    return sha256_text(dump_json(payload))


def fixture_digest(files: dict[str, str]) -> str:
    return folder_digest(files, "fixtures")


def expected_digest(files: dict[str, str]) -> str:
    return folder_digest(files, "expected")


def build_provenance(
    files: dict[str, str], python_commit: str, openapi_sha256: str
) -> dict[str, str]:
    return {
        "schema": "powercontext.conformance.provenance.v1",
        "python_commit": python_commit,
        "exporter_version": EXPORTER_VERSION,
        "openapi_sha256": openapi_sha256,
        "fixture_digest": fixture_digest(files),
        "expected_digest": expected_digest(files),
    }


def write_provenance(files: dict[str, str], python_commit: str, openapi_sha256: str) -> None:
    write_json(PROVENANCE_PATH, build_provenance(files, python_commit, openapi_sha256))

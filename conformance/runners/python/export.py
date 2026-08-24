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

"""Export versioned conformance fixtures from the pinned Python oracle."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

HARNESS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(HARNESS_DIR))

from exporter.write import (  # noqa: E402
    build_provenance,
    snapshot_files,
    write_provenance,
    write_snapshot,
)
from exporter.jsonio import dump_json  # noqa: E402
from exporter.openapi import lock_field  # noqa: E402
from exporter.paths import PROVENANCE_PATH  # noqa: E402
from exporter.wire_suite import build_wire_cases, expected_for_case  # noqa: E402


def assert_agreement() -> None:
    mismatches: list[str] = []
    for case in build_wire_cases():
        if case.get("compare") != "both" or case.get("schemaName") is None:
            continue
        if "value" not in case:
            continue
        result = expected_for_case(case)
        if result.get("pythonValid") != (case["expect"] == "valid"):
            mismatches.append(case["id"])
    if mismatches:
        raise SystemExit(
            "python and fixture expect disagree: " + ", ".join(mismatches[:20])
        )


def export_snapshot() -> dict[str, str]:
    assert_agreement()
    files = snapshot_files()
    write_snapshot(files)
    write_provenance(files, lock_field("python_commit"), lock_field("openapi_sha256"))
    return files


def check_snapshot() -> None:
    assert_agreement()
    generated = snapshot_files()
    generated[str(PROVENANCE_PATH)] = dump_json(
        build_provenance(
            generated, lock_field("python_commit"), lock_field("openapi_sha256")
        )
    )
    drifted: list[str] = []
    for path, text in generated.items():
        current = Path(path)
        if not current.exists() or current.read_text(encoding="utf-8") != text:
            drifted.append(Path(path).name)
    if drifted:
        raise SystemExit(
            "conformance snapshot drifted (" + ", ".join(drifted) + "); run export.py"
        )
    print("conformance snapshot is current")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    arguments = parser.parse_args()
    if arguments.check:
        check_snapshot()
        return
    export_snapshot()
    print("wrote conformance fixtures and expected results")
    print(dump_json({"files": 4, "provenance": str(PROVENANCE_PATH)}).strip())


if __name__ == "__main__":
    main()

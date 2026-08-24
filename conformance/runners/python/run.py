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

"""Unified oracle entry: pin check and fixture export."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

HARNESS_DIR = Path(__file__).resolve().parent
VENV_DIR = HARNESS_DIR / ".venv"
ROOT = Path(__file__).resolve().parents[3]
SYNC_DIR = ROOT / "tools" / "contract-sync"
sys.path.insert(0, str(SYNC_DIR))

from lockfile import read_lock  # noqa: E402

LOCK_MARKER = VENV_DIR / "powercontext-oracle-lock.json"


def venv_python() -> Path:
    if sys.platform == "win32":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--export", action="store_true")
    parser.add_argument("--export-check", action="store_true")
    arguments = parser.parse_args()
    python = venv_python()
    if not python.exists():
        print("oracle venv is missing; run bootstrap.py first", file=sys.stderr)
        raise SystemExit(1)
    lock = read_lock()
    if not LOCK_MARKER.exists():
        print("oracle lock marker is missing; run bootstrap.py again", file=sys.stderr)
        raise SystemExit(1)
    marker = json.loads(LOCK_MARKER.read_text(encoding="utf-8"))
    if marker.get("python_commit") != lock.get("python_commit"):
        print(
            "oracle marker Python commit does not match baseline lock", file=sys.stderr
        )
        raise SystemExit(1)
    if marker.get("oracle_dependency_lock_sha256") != lock.get(
        "oracle_dependency_lock_sha256"
    ):
        print(
            "oracle marker dependency lock does not match baseline lock",
            file=sys.stderr,
        )
        raise SystemExit(1)
    if marker.get("install_mode") != "uv-sync-locked-no-editable":
        print("oracle was not installed through uv sync --locked", file=sys.stderr)
        raise SystemExit(1)
    probe = (
        "import importlib.metadata, powercontext; "
        "print(importlib.metadata.version('powercontext')); "
        "print(getattr(powercontext, '__file__', ''))"
    )
    output = subprocess.check_output([str(python), "-c", probe], text=True)
    print("oracle pin is importable")
    print("oracle dependencies were installed with uv sync --locked")
    print(output.strip())
    if arguments.check and not output.strip():
        raise SystemExit(1)
    if arguments.export or arguments.export_check:
        command = [str(python), str(HARNESS_DIR / "export.py")]
        if arguments.export_check:
            command.append("--check")
        subprocess.check_call(command)


if __name__ == "__main__":
    main()

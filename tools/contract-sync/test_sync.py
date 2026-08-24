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

"""Prove that repeating contract-sync on the frozen pin is a zero diff."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _run(arguments: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(ROOT / "tools" / "contract-sync" / "sync.py"), *arguments],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )


def main() -> None:
    extra = sys.argv[1:]
    first = _run(extra)
    second = _run(extra)
    check = _run([*extra, "--check"])
    if "snapshot_changed=false" not in second.stdout or "lock_changed=false" not in second.stdout:
        print(second.stdout)
        print(second.stderr, file=sys.stderr)
        raise SystemExit("repeat contract-sync was not a zero diff")
    if "contract-sync check passed" not in check.stdout:
        raise SystemExit("contract-sync --check did not pass after a repeat run")
    print("contract-sync idempotence passed")
    print(first.stdout.strip())
    print(second.stdout.strip())


if __name__ == "__main__":
    main()

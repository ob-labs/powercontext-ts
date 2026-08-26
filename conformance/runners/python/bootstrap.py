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

"""Create the isolated oracle environment from the baseline lock pin."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SYNC_DIR = ROOT / "tools" / "contract-sync"
sys.path.insert(0, str(SYNC_DIR))

from digests import sha256_bytes  # noqa: E402
from lockfile import read_lock  # noqa: E402

HARNESS_DIR = Path(__file__).resolve().parent
VENV_DIR = HARNESS_DIR / ".venv"
SOURCE_DIR = HARNESS_DIR / ".pin-src"
LOCK_MARKER = VENV_DIR / "powercontext-oracle-lock.json"


class OracleError(ValueError):
    """Report that the oracle environment cannot be created from the pin."""


def _run(arguments: list[str], *, env: dict[str, str] | None = None) -> None:
    subprocess.check_call(arguments, cwd=HARNESS_DIR, env=env)


def _git_show(repo: Path, commit: str, path: str) -> bytes:
    return subprocess.check_output(
        ["git", "-C", str(repo), "show", f"{commit}:{path}"],
        stderr=subprocess.STDOUT,
    )


def _require_string(value: object, name: str) -> str:
    if not isinstance(value, str) or not value:
        raise OracleError(f"{name} must be a non-empty string")
    return value


def verify_uv_lock(repo: Path, lock: dict[str, object]) -> None:
    commit = _require_string(lock.get("python_commit"), "python_commit")
    expected = _require_string(
        lock.get("oracle_dependency_lock_sha256"), "oracle_dependency_lock_sha256"
    )
    path = _require_string(
        lock.get("oracle_dependency_lock_path"), "oracle_dependency_lock_path"
    )
    digest = sha256_bytes(_git_show(repo, commit, path))
    if digest != expected:
        raise OracleError(f"pinned {path} digest {digest} does not match the lock")


def sync_locked_project(source: Path, python: Path, lock: dict[str, object]) -> None:
    environment = os.environ.copy()
    environment["VIRTUAL_ENV"] = str(VENV_DIR)
    _run(
        [
            "uv",
            "sync",
            "--locked",
            "--no-dev",
            "--no-editable",
            "--extra",
            "cli",
            "--extra",
            "server",
            "--active",
            "--python",
            str(python),
            "--project",
            str(source),
        ],
        env=environment,
    )
    marker = {
        "schema": "powercontext.oracle-lock.v1",
        "python_commit": lock.get("python_commit"),
        "oracle_dependency_lock_sha256": lock.get("oracle_dependency_lock_sha256"),
        "install_mode": "uv-sync-locked-no-editable",
    }
    LOCK_MARKER.write_text(
        json.dumps(marker, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


def install_from_local_commit(
    repo: Path, commit: str, python: Path, lock: dict[str, object]
) -> None:
    if SOURCE_DIR.exists():
        subprocess.call(
            ["git", "-C", str(repo), "worktree", "remove", "--force", str(SOURCE_DIR)],
            cwd=HARNESS_DIR,
        )
    _run(
        ["git", "-C", str(repo), "worktree", "add", "--detach", str(SOURCE_DIR), commit]
    )
    try:
        sync_locked_project(SOURCE_DIR, python, lock)
    finally:
        subprocess.call(
            ["git", "-C", str(repo), "worktree", "remove", "--force", str(SOURCE_DIR)],
            cwd=HARNESS_DIR,
        )


def install_from_remote_commit(
    repo_url: str, commit: str, python: Path, lock: dict[str, object]
) -> None:
    if SOURCE_DIR.exists():
        shutil.rmtree(SOURCE_DIR)
    _run(
        [
            "git",
            "clone",
            "--filter=blob:none",
            "--no-checkout",
            repo_url,
            str(SOURCE_DIR),
        ]
    )
    try:
        _run(["git", "-C", str(SOURCE_DIR), "fetch", "--depth", "1", "origin", commit])
        _run(["git", "-C", str(SOURCE_DIR), "checkout", "--detach", commit])
        verify_uv_lock(SOURCE_DIR, lock)
        sync_locked_project(SOURCE_DIR, python, lock)
    finally:
        shutil.rmtree(SOURCE_DIR, ignore_errors=True)


def install_pin(lock: dict[str, object], python_repo: Path | None) -> None:
    commit = _require_string(lock.get("python_commit"), "python_commit")
    python = VENV_DIR / (
        "Scripts/python.exe" if sys.platform == "win32" else "bin/python"
    )
    if python_repo is not None and (python_repo / ".git").exists():
        install_from_local_commit(python_repo, commit, python, lock)
        return
    install_from_remote_commit(
        _require_string(lock.get("python_repo"), "python_repo"), commit, python, lock
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--python-repo", type=Path)
    arguments = parser.parse_args()
    lock = read_lock()
    python_repo = (
        arguments.python_repo.resolve() if arguments.python_repo is not None else None
    )
    if python_repo is None:
        python_repo = ROOT / str(lock.get("python_repo_local"))
    try:
        if python_repo.exists():
            verify_uv_lock(python_repo, lock)
        _run(["uv", "venv", "--clear", "--python", "3.11", str(VENV_DIR)])
        install_pin(lock, python_repo if python_repo.exists() else None)
    except (OSError, OracleError, subprocess.CalledProcessError) as error:
        print(f"oracle bootstrap failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
    print(f"oracle environment ready at {VENV_DIR}")


if __name__ == "__main__":
    main()

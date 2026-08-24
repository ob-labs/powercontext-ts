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

"""Pull the pinned OpenAPI snapshot and refresh lock digest fields."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from digests import count_operation_ids, count_schema_names, normalize_lf, sha256_bytes
from lockfile import LOCK_PATH, OPENAPI_PATH, ROOT, read_lock

OPENAPI_REPO_PATH = "openapi/powercontext.yaml"


class SyncError(ValueError):
    """Report a contract-sync failure that must not rewrite snapshots."""


def _git(repo: Path, *arguments: str) -> bytes:
    try:
        return subprocess.check_output(
            ["git", "-C", str(repo), *arguments],
            stderr=subprocess.STDOUT,
        )
    except (FileNotFoundError, subprocess.CalledProcessError) as error:
        detail = (
            "git is unavailable"
            if isinstance(error, FileNotFoundError)
            else error.output.decode("utf-8", errors="replace").strip()
        )
        raise SyncError(f"git {' '.join(arguments)} failed: {detail}") from error


def _require_string(value: object, description: str) -> str:
    if not isinstance(value, str) or not value:
        raise SyncError(f"{description} must be a non-empty string")
    return value


def resolve_python_repo(lock: dict[str, object], override: Path | None) -> Path:
    if override is not None:
        return override.resolve()
    return (ROOT / _require_string(lock.get("python_repo_local"), "python_repo_local")).resolve()


def show_pinned_openapi(repo: Path, commit: str) -> bytes:
    return _git(repo, "show", f"{commit}:{OPENAPI_REPO_PATH}")


def clone_and_show(url: str, commit: str, workdir: Path) -> bytes:
    if not (workdir / ".git").exists():
        subprocess.check_call(["git", "clone", "--filter=blob:none", url, str(workdir)])
    _git(workdir, "fetch", "--depth", "1", "origin", commit)
    _git(workdir, "checkout", "--detach", commit)
    return show_pinned_openapi(workdir, commit)


def replace_lock_scalar(text: str, key: str, value: str) -> str:
    pattern = re.compile(rf"^({re.escape(key)}: ).+$", re.MULTILINE)
    updated, count = pattern.subn(rf"\g<1>{value}", text, count=1)
    if count != 1:
        raise SyncError(f"cannot surgically update {key} in baseline.lock.yaml")
    return updated


def refresh_lock_text(lock_text: str, payload: bytes) -> str:
    normalized = normalize_lf(payload)
    text = normalized.decode("utf-8")
    updated = replace_lock_scalar(lock_text, "openapi_sha256", sha256_bytes(normalized))
    updated = replace_lock_scalar(updated, "openapi_bytes", str(len(normalized)))
    updated = replace_lock_scalar(
        updated, "operation_count", str(len(count_operation_ids(text)))
    )
    return replace_lock_scalar(updated, "schema_count", str(len(count_schema_names(text))))


def write_if_changed(path: Path, payload: bytes) -> bool:
    current = path.read_bytes() if path.exists() else b""
    if current == payload:
        return False
    path.write_bytes(payload)
    return True


def _arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--python-repo", type=Path)
    parser.add_argument(
        "--from-git-url",
        action="store_true",
        help="Clone python_repo from the lock URL at python_commit instead of the local checkout.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Fail if pulling the pin would change contract/ or lock digest fields.",
    )
    return parser.parse_args()


def main() -> None:
    arguments = _arguments()
    lock = read_lock()
    commit = _require_string(lock.get("python_commit"), "python_commit")
    try:
        if arguments.from_git_url:
            payload = clone_and_show(
                _require_string(lock.get("python_repo"), "python_repo"),
                commit,
                ROOT / ".python-pin",
            )
        else:
            payload = show_pinned_openapi(resolve_python_repo(lock, arguments.python_repo), commit)
    except (OSError, SyncError) as error:
        print(f"contract-sync failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error

    snapshot = normalize_lf(payload)
    if not snapshot.endswith(b"\n"):
        snapshot = snapshot + b"\n"
    lock_text = LOCK_PATH.read_text(encoding="utf-8")
    next_lock = refresh_lock_text(lock_text, snapshot)
    if arguments.check:
        current = normalize_lf(OPENAPI_PATH.read_bytes()) if OPENAPI_PATH.exists() else b""
        if current != snapshot or lock_text != next_lock:
            print("contract snapshot or lock digests drifted from the pin", file=sys.stderr)
            raise SystemExit(1)
        print("contract-sync check passed")
        return

    OPENAPI_PATH.parent.mkdir(parents=True, exist_ok=True)
    snapshot_changed = write_if_changed(OPENAPI_PATH, snapshot)
    lock_changed = write_if_changed(LOCK_PATH, next_lock.encode("utf-8"))
    print(f"contract-sync wrote pin {commit}")
    print(f"snapshot_changed={str(snapshot_changed).lower()} lock_changed={str(lock_changed).lower()}")


if __name__ == "__main__":
    main()

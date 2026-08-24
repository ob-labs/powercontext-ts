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

"""Compare the pinned OpenAPI snapshot with Python main. Advisory only."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from digests import count_operation_ids, count_schema_names, normalize_lf, sha256_bytes
from lockfile import ROOT, read_lock


class AdvisoryError(ValueError):
    """Report that the advisory job could not observe Python main."""


def _require_string(value: object, description: str) -> str:
    if not isinstance(value, str) or not value:
        raise AdvisoryError(f"{description} must be a non-empty string")
    return value


def github_raw_url(repo_url: str, ref: str, path: str) -> str:
    body = repo_url.removeprefix("https://github.com/").removesuffix(".git")
    return f"https://raw.githubusercontent.com/{body}/{ref}/{path}"


def fetch_bytes(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read()


def show_local_ref(repo: Path, ref: str, path: str) -> bytes:
    return subprocess.check_output(
        ["git", "-C", str(repo), "show", f"{ref}:{path}"],
        stderr=subprocess.STDOUT,
    )


def resolve_main_openapi(lock: dict[str, object], python_repo: Path | None) -> tuple[bytes, str]:
    if python_repo is not None and python_repo.exists():
        try:
            payload = show_local_ref(python_repo, "origin/main", "openapi/powercontext.yaml")
            commit = subprocess.check_output(
                ["git", "-C", str(python_repo), "rev-parse", "origin/main"],
                text=True,
            ).strip()
            return normalize_lf(payload), commit
        except subprocess.CalledProcessError:
            payload = show_local_ref(python_repo, "main", "openapi/powercontext.yaml")
            commit = subprocess.check_output(
                ["git", "-C", str(python_repo), "rev-parse", "main"],
                text=True,
            ).strip()
            return normalize_lf(payload), commit
    url = github_raw_url(
        _require_string(lock.get("python_repo"), "python_repo"),
        "main",
        "openapi/powercontext.yaml",
    )
    return normalize_lf(fetch_bytes(url)), "main"


def build_report(lock: dict[str, object], payload: bytes, observed_ref: str) -> dict[str, object]:
    text = payload.decode("utf-8")
    digest = sha256_bytes(payload)
    baseline = str(lock.get("openapi_sha256"))
    return {
        "status": "aligned" if digest == baseline else "drifted",
        "baseline_python_commit": lock.get("python_commit"),
        "baseline_openapi_sha256": baseline,
        "observed_ref": observed_ref,
        "observed_openapi_sha256": digest,
        "observed_operation_count": len(count_operation_ids(text)),
        "observed_schema_count": len(count_schema_names(text)),
        "advisory": True,
    }


def _arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--python-repo", type=Path)
    parser.add_argument("--output", type=Path)
    return parser.parse_args()


def main() -> None:
    arguments = _arguments()
    lock = read_lock()
    try:
        payload, observed_ref = resolve_main_openapi(lock, arguments.python_repo)
        report = build_report(lock, payload, observed_ref)
    except (OSError, AdvisoryError, subprocess.CalledProcessError, UnicodeError) as error:
        print(f"contract advisory failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error

    encoded = json.dumps(report, indent=2, sort_keys=True)
    if arguments.output is not None:
        arguments.output.parent.mkdir(parents=True, exist_ok=True)
        arguments.output.write_text(encoded + "\n", encoding="utf-8")
    print(encoded)
    if report["status"] == "drifted":
        raise SystemExit(10)


if __name__ == "__main__":
    main()

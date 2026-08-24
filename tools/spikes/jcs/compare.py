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

"""Compare RFC 8785 vectors with Python rfc8785 dumps."""

from __future__ import annotations

import base64
import hashlib
import json
import sys
from pathlib import Path

try:
    import rfc8785
except ModuleNotFoundError:
    print("rfc8785 is not installed", file=sys.stderr)
    raise SystemExit(2) from None

CORPUS_PATH = Path(__file__).with_name("jcs-reference-corpus.json")


def main() -> None:
    corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    pairs = []
    matches = True
    for vector in corpus["vectors"]:
        input_bytes = base64.b64decode(vector["inputBase64"])
        expected = base64.b64decode(vector["outputBase64"])
        if hashlib.sha256(input_bytes).hexdigest() != vector["inputSha256"]:
            raise SystemExit(f"input digest mismatch: {vector['name']}")
        if hashlib.sha256(expected).hexdigest() != vector["outputSha256"]:
            raise SystemExit(f"output digest mismatch: {vector['name']}")
        python = rfc8785.dumps(json.loads(input_bytes.decode("utf-8")))
        if python != expected:
            matches = False
        pairs.append(
            {
                "name": vector["name"],
                "python": python.decode("utf-8"),
                "typescript": expected.decode("utf-8"),
                "expected": expected.decode("utf-8"),
            }
        )
    lone_surrogate_rejected = False
    try:
        rfc8785.dumps({"value": "\ud800"})
    except rfc8785.CanonicalizationError:
        lone_surrogate_rejected = True
    print(
        json.dumps(
            {
                "matches": matches,
                "loneSurrogateRejected": lone_surrogate_rejected,
                "sourceCommit": corpus["sourceCommit"],
                "pairs": pairs,
            },
            ensure_ascii=True,
        )
    )


if __name__ == "__main__":
    main()

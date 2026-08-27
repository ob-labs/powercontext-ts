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

HARNESS_DIR = Path(__file__).resolve().parents[1]
ROOT = HARNESS_DIR.parents[2]
CONFORMANCE = ROOT / "conformance"
OPENAPI_JSON = (
    ROOT / "packages" / "protocol" / "src" / "generated" / "openapi-document.json"
)
CONTRACTS_JSON = (
    ROOT / "packages" / "protocol" / "src" / "generated" / "operation-contracts.json"
)
LOCK_PATH = ROOT / "contract" / "baseline.lock.yaml"
FIXTURES_DIR = CONFORMANCE / "fixtures"
EXPECTED_DIR = CONFORMANCE / "expected"
WIRE_FIXTURE = FIXTURES_DIR / "wire.json"
CANONICAL_FIXTURE = FIXTURES_DIR / "canonical.json"
WIRE_EXPECTED = EXPECTED_DIR / "wire.json"
CANONICAL_EXPECTED = EXPECTED_DIR / "canonical.json"
PROVENANCE_PATH = CONFORMANCE / "provenance.json"
EXPORTER_VERSION = "0.3.1-core"

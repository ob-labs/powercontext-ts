# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.

"""Count operations and domain capabilities in the Phase 0 manifest."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "docs" / "governance" / "capability-manifest.yaml"
LOCK_OPS = ROOT / "contract" / "openapi" / "powercontext.yaml"


def main() -> None:
    manifest = MANIFEST.read_text(encoding="utf-8")
    declared = re.findall(r"^  - id: ([A-Za-z0-9_-]+)$", manifest, flags=re.MULTILINE)
    operations = re.findall(r"^      operationId: ([A-Za-z0-9_]+)$", LOCK_OPS.read_text(encoding="utf-8"), flags=re.MULTILINE)
    domain_start = manifest.index("domain_capabilities:")
    operation_ids = re.findall(r"^  - id: ([A-Za-z0-9_-]+)$", manifest[:domain_start], flags=re.MULTILINE)
    domain_ids = re.findall(r"^  - id: ([A-Za-z0-9_-]+)$", manifest[domain_start:], flags=re.MULTILINE)
    missing = [item for item in operations if item not in operation_ids]
    extra = [item for item in operation_ids if item not in operations]
    print(f"manifest_operations={len(operation_ids)}")
    print(f"openapi_operations={len(operations)}")
    print(f"domain_capabilities={len(domain_ids)}")
    print(f"declared_ids={len(declared)}")
    if missing or extra or len(operation_ids) != 52:
        print("missing", missing, file=sys.stderr)
        print("extra", extra, file=sys.stderr)
        raise SystemExit(1)
    print("capability manifest covers all 52 operations")


if __name__ == "__main__":
    main()

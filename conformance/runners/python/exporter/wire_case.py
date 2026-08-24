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

from typing import Any

UNSAFE_INTEGER = 9007199254740993


def wire_case(
    case_id: str,
    *,
    role: str,
    expect: str,
    tags: list[str],
    operation_id: str | None = None,
    schema_name: str | None = None,
    value: Any = None,
    raw_json: str | None = None,
    status: int | None = None,
    content_type: str | None = None,
    compare: str = "both",
    overlay: str | None = None,
) -> dict[str, Any]:
    row: dict[str, Any] = {
        "id": case_id,
        "kind": "wire",
        "role": role,
        "expect": expect,
        "tags": tags,
        "compare": compare,
    }
    optional = {
        "operationId": operation_id,
        "schemaName": schema_name,
        "value": value,
        "rawJson": raw_json,
        "status": status,
        "contentType": content_type,
        "overlay": overlay,
    }
    for key, item in optional.items():
        if item is not None:
            row[key] = item
    return row

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

from enum import Enum
from typing import Any

from pydantic import ValidationError


def pydantic_valid(schema_name: str, value: Any) -> bool:
    from powercontext.http._generated import models

    model = getattr(models, schema_name, None)
    if model is None:
        raise AttributeError(f"pinned powercontext has no model {schema_name}")
    if isinstance(model, type) and issubclass(model, Enum):
        try:
            model(value)
        except ValueError:
            return False
        return True
    try:
        model.model_validate(value)
    except ValidationError:
        return False
    return True

/**
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const GENERATOR_VERSION = '0.2.0-phase2'
export const INTEGER_OVERLAY_ID = 'integer-safe-range.v1'

const toolsDir = dirname(fileURLToPath(import.meta.url))

export const REPO_ROOT = join(toolsDir, '..', '..', '..')
export const OPENAPI_PATH = join(REPO_ROOT, 'contract', 'openapi', 'powercontext.yaml')
export const GENERATED_DIR = join(REPO_ROOT, 'packages', 'protocol', 'src', 'generated')
export const OPERATIONS_PATH = join(GENERATED_DIR, 'operations.ts')
export const CONTRACTS_PATH = join(GENERATED_DIR, 'operation-contracts.ts')
export const CONTRACTS_JSON_PATH = join(GENERATED_DIR, 'operation-contracts.json')
export const VALIDATORS_PATH = join(GENERATED_DIR, 'validators.ts')
export const TYPES_PATH = join(GENERATED_DIR, 'openapi-types.ts')
export const COVERAGE_PATH = join(GENERATED_DIR, 'coverage.json')
export const OPENAPI_JSON_PATH = join(GENERATED_DIR, 'openapi-document.json')

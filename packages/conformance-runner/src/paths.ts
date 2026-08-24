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

const here = dirname(fileURLToPath(import.meta.url))

export const REPO_ROOT = join(here, '..', '..', '..')
export const CONFORMANCE_ROOT = join(REPO_ROOT, 'conformance')
export const SCHEMAS_ROOT = join(CONFORMANCE_ROOT, 'schemas')
export const MANIFEST_SCHEMA_PATH = join(SCHEMAS_ROOT, 'manifest.schema.json')
export const PROVENANCE_SCHEMA_PATH = join(SCHEMAS_ROOT, 'provenance.schema.json')
export const SCENARIO_SCHEMA_PATH = join(SCHEMAS_ROOT, 'scenario.schema.json')
export const RESULT_SCHEMA_PATH = join(SCHEMAS_ROOT, 'result.schema.json')
export const REPORT_SCHEMA_PATH = join(SCHEMAS_ROOT, 'report.schema.json')
export const MANIFEST_PATH = join(CONFORMANCE_ROOT, 'manifest.yaml')
export const PROVENANCE_PATH = join(CONFORMANCE_ROOT, 'provenance.json')
export const WIRE_FIXTURE_PATH = join(CONFORMANCE_ROOT, 'fixtures', 'wire.json')
export const CANONICAL_FIXTURE_PATH = join(
  CONFORMANCE_ROOT,
  'fixtures',
  'canonical.json',
)
export const WIRE_EXPECTED_PATH = join(CONFORMANCE_ROOT, 'expected', 'wire.json')
export const CANONICAL_EXPECTED_PATH = join(
  CONFORMANCE_ROOT,
  'expected',
  'canonical.json',
)
export const REPORTS_DIR = join(CONFORMANCE_ROOT, 'reports')

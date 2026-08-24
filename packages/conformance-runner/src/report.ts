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

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { REPORTS_DIR } from './paths.js'
import { assertConformanceDocument } from './schema-validation.js'
import type {
  CaseOutcome,
  ConformanceManifest,
  ConformanceProvenance,
  ConformanceReport,
} from './types.js'

export function buildReport(
  cases: readonly CaseOutcome[],
  manifest: ConformanceManifest,
  provenance: ConformanceProvenance,
): ConformanceReport {
  const passed = cases.filter((row) => row.status === 'pass').length
  const failed = cases.filter((row) => row.status === 'fail').length
  const skipped = cases.filter((row) => row.status === 'skipped').length
  return {
    schema: 'powercontext.conformance.report.v1',
    profile: 'client',
    implementation: 'typescript',
    level: 'C1',
    provenance: {
      contractVersion: manifest.contract_version,
      baselineCommit: manifest.baseline_commit,
      exporterVersion: provenance.exporter_version,
      openapiSha256: provenance.openapi_sha256,
      fixtureDigest: provenance.fixture_digest,
      expectedDigest: provenance.expected_digest,
    },
    summary: { passed, failed, skipped },
    cases,
  }
}

export function writeReport(report: ConformanceReport): string {
  assertConformanceDocument('report', report)
  mkdirSync(REPORTS_DIR, { recursive: true })
  const path = join(REPORTS_DIR, 'typescript.json')
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`)
  return path
}

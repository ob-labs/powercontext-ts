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

import { runCanonicalCase } from './canonical.js'
import {
  assertExpectedCoverage,
  loadCanonicalCases,
  loadCanonicalExpected,
  loadManifest,
  loadProvenance,
  loadWireCases,
  loadWireExpected,
} from './load.js'
import { buildReport, writeReport } from './report.js'
import type { CaseOutcome, ConformanceReport, ConformanceReports } from './types.js'
import { runWireCase } from './wire.js'

export function runConformance(): ConformanceReports {
  const manifest = loadManifest()
  const provenance = loadProvenance()
  if (manifest.baseline_commit !== provenance.python_commit) {
    throw new Error(
      'conformance manifest baseline_commit does not match provenance python_commit',
    )
  }
  const wireOutcomes: CaseOutcome[] = []
  const wireCases = loadWireCases()
  const wireExpected = loadWireExpected()
  assertExpectedCoverage('wire', wireCases, wireExpected)
  for (const caseRow of wireCases) {
    wireOutcomes.push(runWireCase(caseRow, wireExpected[caseRow.id]))
  }
  const canonicalOutcomes: CaseOutcome[] = []
  const canonicalCases = loadCanonicalCases()
  const canonicalExpected = loadCanonicalExpected()
  assertExpectedCoverage('canonical', canonicalCases, canonicalExpected)
  for (const caseRow of canonicalCases) {
    canonicalOutcomes.push(runCanonicalCase(caseRow, canonicalExpected[caseRow.id]))
  }
  const client = buildReport(wireOutcomes, manifest, provenance, 'client', 'C1')
  const core = buildReport(canonicalOutcomes, manifest, provenance, 'sqlite-fts', 'C2')
  writeReport(client, 'typescript.json')
  writeReport(core, 'typescript-core.json')
  return { client, core }
}

export function assertConformancePassed(report: ConformanceReport): void {
  if (report.summary.failed > 0) {
    const failed = report.cases
      .filter((row) => row.status === 'fail')
      .slice(0, 10)
      .map((row) => `${row.id}: ${row.detail ?? ''}`)
    throw new Error(
      `conformance failed (${String(report.summary.failed)}): ${failed.join('; ')}`,
    )
  }
}

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

export interface WireCase {
  readonly id: string
  readonly kind: 'wire'
  readonly role: 'request' | 'success' | 'error' | 'component'
  readonly expect: 'valid' | 'invalid'
  readonly tags?: readonly string[]
  readonly compare?: 'both' | 'typescript-only'
  readonly overlay?: string
  readonly operationId?: string
  readonly schemaName?: string
  readonly status?: number
  readonly contentType?: string
  readonly value?: unknown
  readonly rawJson?: string
}

export interface CanonicalCase {
  readonly id: string
  readonly kind: 'jcs' | 'domain' | 'hash' | 'domain-hash' | 'refs' | 'sorting' | 'utf8'
  readonly expect: 'valid' | 'invalid'
  readonly input: unknown
  readonly inputMode: 'json' | 'unicode-code-units' | 'decimal-integer'
  readonly tags?: readonly string[]
}

export interface ExpectedResult {
  readonly valid: boolean
  readonly engine?: string
  readonly pythonValid?: boolean
  readonly canonical?: string
  readonly sha256?: string
  readonly bytes?: number
}

export interface ConformanceManifest {
  readonly schema: 'powercontext.conformance.manifest.v1'
  readonly contract_version: number
  readonly baseline_commit: string
  readonly capabilities: readonly {
    readonly capability: string
    readonly required_level: string
    readonly profiles: readonly string[]
    readonly fixtures: readonly string[]
    readonly implementations: {
      readonly python: 'required' | 'optional'
      readonly typescript: 'required' | 'optional'
    }
  }[]
}

export interface ConformanceProvenance {
  readonly schema: 'powercontext.conformance.provenance.v1'
  readonly python_commit: string
  readonly exporter_version: string
  readonly openapi_sha256: string
  readonly fixture_digest: string
  readonly expected_digest: string
}

export interface CaseOutcome {
  readonly id: string
  readonly status: 'pass' | 'fail' | 'skipped'
  readonly detail?: string
}

export interface ConformanceReport {
  readonly schema: 'powercontext.conformance.report.v1'
  readonly profile: string
  readonly implementation: string
  readonly level: 'C1' | 'C2'
  readonly provenance: {
    readonly contractVersion: number
    readonly baselineCommit: string
    readonly exporterVersion: string
    readonly openapiSha256: string
    readonly fixtureDigest: string
    readonly expectedDigest: string
  }
  readonly summary: {
    readonly passed: number
    readonly failed: number
    readonly skipped: number
  }
  readonly cases: readonly CaseOutcome[]
}

export interface ConformanceReports {
  readonly client: ConformanceReport
  readonly core: ConformanceReport
}

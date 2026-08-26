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

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import { generatedFileBanner, normalizeNewlines } from './header.js'
import type { OpenApiDocument } from './load-openapi.js'
import type { OperationContract } from './contracts.js'
import { convertComponentSchemas } from './oas3.js'
import type { OperationMetadata } from './operations.js'
import {
  CONTRACTS_JSON_PATH,
  CONTRACTS_PATH,
  COVERAGE_PATH,
  OPENAPI_JSON_PATH,
  GENERATED_DIR,
  GENERATOR_VERSION,
  INTEGER_OVERLAY_ID,
  OPERATIONS_PATH,
  TYPES_PATH,
  VALIDATORS_PATH,
} from './paths.js'
import { renderContractsJson, renderContractsSource } from './render-contracts.js'
import { renderCoverage } from './render-coverage.js'

export interface GeneratedArtifacts {
  readonly operations: string
  readonly contracts: string
  readonly contractsJson: string
  readonly validators: string
  readonly types: string
  readonly coverage: string
  readonly openapiJson: string
}

export function renderOperationsSource(
  operations: readonly OperationMetadata[],
  sourceDigest: string,
): string {
  const rows = operations
    .map((row) => {
      const location = row.location === null ? 'null' : `'${row.location}'`
      return `  ${row.operationId}: { operationId: '${row.operationId}', method: '${row.method}', path: '${row.path}', location: ${location}, scope: ${String(row.scope)} },`
    })
    .join('\n')
  return `${generatedFileBanner('operation metadata', sourceDigest)}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type RequestLocation = 'body' | 'query' | null

export interface OperationMetadata {
  readonly operationId: string
  readonly method: HttpMethod
  readonly path: string
  readonly location: RequestLocation
  readonly scope: boolean
}

export const GENERATED_MANIFEST = {
  generatorVersion: '${GENERATOR_VERSION}',
  sourceDigest: '${sourceDigest}',
  operationCount: ${String(operations.length)},
  overlay: '${INTEGER_OVERLAY_ID}',
} as const

export const OPERATION_METADATA = {
${rows}
} as const satisfies Record<string, OperationMetadata>

export type OperationId = keyof typeof OPERATION_METADATA

export function listOperationIds(): OperationId[] {
  return Object.keys(OPERATION_METADATA) as OperationId[]
}
`
}

export function renderValidatorsSource(
  document: OpenApiDocument,
  sourceDigest: string,
): string {
  const schemas = document.components?.schemas ?? {}
  const converted = convertComponentSchemas(schemas)
  const serialized = JSON.stringify(converted, null, 2)
  return `${generatedFileBanner('Ajv validators', sourceDigest)}
import { createWireValidator } from '../validator-runtime.js'

export const COMPONENT_SCHEMAS = ${serialized} as const

const runtime = createWireValidator(COMPONENT_SCHEMAS as Record<string, unknown>)

export function compileComponentValidator(name: string) {
  return runtime.compileComponentValidator(name)
}

export function validateWireValue(name: string, value: unknown) {
  return runtime.validateWireValue(name, value)
}
`
}

export async function renderTypesSource(
  openapiPath: string,
  sourceDigest: string,
): Promise<string> {
  const ast = await openapiTS(pathToFileURL(openapiPath), {
    // OpenAPI defaults are applied by the Server. They must not turn an
    // otherwise optional request property into a required Client argument.
    defaultNonNullable: false,
  })
  return `${generatedFileBanner('openapi-typescript wire types', sourceDigest)}${astToString(ast)}`
}

export async function buildArtifacts(
  document: OpenApiDocument,
  operations: readonly OperationMetadata[],
  contracts: readonly OperationContract[],
  openapiPath: string,
  sourceDigest: string,
): Promise<GeneratedArtifacts> {
  const generatedOpenApiDocument = {
    'x-powercontext-generated': {
      notice: 'DO NOT EDIT',
      source: 'contract/openapi/powercontext.yaml',
      sourceDigest,
      generatorVersion: GENERATOR_VERSION,
    },
    ...document,
  }
  return {
    operations: normalizeNewlines(renderOperationsSource(operations, sourceDigest)),
    contracts: normalizeNewlines(renderContractsSource(contracts, sourceDigest)),
    contractsJson: normalizeNewlines(renderContractsJson(contracts, sourceDigest)),
    validators: normalizeNewlines(renderValidatorsSource(document, sourceDigest)),
    types: normalizeNewlines(await renderTypesSource(openapiPath, sourceDigest)),
    coverage: normalizeNewlines(
      renderCoverage(document, operations, contracts, sourceDigest),
    ),
    openapiJson: normalizeNewlines(
      `${JSON.stringify(generatedOpenApiDocument, null, 2)}\n`,
    ),
  }
}

export function writeArtifacts(artifacts: GeneratedArtifacts): void {
  mkdirSync(GENERATED_DIR, { recursive: true })
  writeFileSync(OPERATIONS_PATH, artifacts.operations)
  writeFileSync(CONTRACTS_PATH, artifacts.contracts)
  writeFileSync(CONTRACTS_JSON_PATH, artifacts.contractsJson)
  writeFileSync(VALIDATORS_PATH, artifacts.validators)
  writeFileSync(TYPES_PATH, artifacts.types)
  writeFileSync(COVERAGE_PATH, artifacts.coverage)
  writeFileSync(OPENAPI_JSON_PATH, artifacts.openapiJson)
}

export function readCurrentArtifacts(): GeneratedArtifacts {
  return {
    operations: normalizeNewlines(readFileSync(OPERATIONS_PATH, 'utf8')),
    contracts: normalizeNewlines(readFileSync(CONTRACTS_PATH, 'utf8')),
    contractsJson: normalizeNewlines(readFileSync(CONTRACTS_JSON_PATH, 'utf8')),
    validators: normalizeNewlines(readFileSync(VALIDATORS_PATH, 'utf8')),
    types: normalizeNewlines(readFileSync(TYPES_PATH, 'utf8')),
    coverage: normalizeNewlines(readFileSync(COVERAGE_PATH, 'utf8')),
    openapiJson: normalizeNewlines(readFileSync(OPENAPI_JSON_PATH, 'utf8')),
  }
}

export function artifactsMatch(
  expected: GeneratedArtifacts,
  actual: GeneratedArtifacts,
): string[] {
  const drifted: string[] = []
  for (const key of [
    'operations',
    'contracts',
    'contractsJson',
    'validators',
    'types',
    'coverage',
    'openapiJson',
  ] as const) {
    if (expected[key] !== actual[key]) {
      drifted.push(key)
    }
  }
  return drifted
}

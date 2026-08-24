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

import type { MediaContract, OperationContract, RequestContract } from './contracts.js'
import { generatedFileBanner } from './header.js'
import { GENERATOR_VERSION } from './paths.js'

function quote(value: string | null): string {
  return value === null ? 'null' : `'${value}'`
}

function renderRequest(request: RequestContract): string {
  return `{ location: ${quote(request.location)}, contentType: ${quote(request.contentType)}, schemaName: ${quote(request.schemaName)} }`
}

function renderMedia(media: MediaContract): string {
  return `{ status: ${String(media.status)}, contentType: '${media.contentType}', schemaName: ${quote(media.schemaName)}, kind: '${media.kind}' }`
}

function renderMediaList(rows: readonly MediaContract[]): string {
  if (rows.length === 0) {
    return '[]'
  }
  return `[${rows.map((row) => renderMedia(row)).join(', ')}]`
}

function renderContract(contract: OperationContract): string {
  return `  ${contract.operationId}: { operationId: '${contract.operationId}', request: ${renderRequest(contract.request)}, success: ${renderMediaList(contract.success)}, errors: ${renderMediaList(contract.errors)} },`
}

export function renderContractsJson(
  contracts: readonly OperationContract[],
  sourceDigest: string,
): string {
  return `${JSON.stringify(
    {
      notice: 'DO NOT EDIT',
      generatorVersion: GENERATOR_VERSION,
      sourceDigest,
      operationCount: contracts.length,
      contracts,
    },
    null,
    2,
  )}\n`
}

export function renderContractsSource(
  contracts: readonly OperationContract[],
  sourceDigest: string,
): string {
  const rows = contracts.map((row) => renderContract(row)).join('\n')
  return `${generatedFileBanner('operation request/response contracts', sourceDigest)}
export type MediaKind = 'json' | 'text' | 'bytes'

export interface RequestContract {
  readonly location: 'body' | 'query' | null
  readonly contentType: string | null
  readonly schemaName: string | null
}

export interface MediaContract {
  readonly status: number
  readonly contentType: string
  readonly schemaName: string | null
  readonly kind: MediaKind
}

export interface OperationContract {
  readonly operationId: string
  readonly request: RequestContract
  readonly success: readonly MediaContract[]
  readonly errors: readonly MediaContract[]
}

export const OPERATION_CONTRACTS = {
${rows}
} as const satisfies Record<string, OperationContract>

export type OperationId = keyof typeof OPERATION_CONTRACTS

export const CONTRACT_MANIFEST = {
  generatorVersion: '${GENERATOR_VERSION}',
  sourceDigest: '${sourceDigest}',
  operationCount: ${String(contracts.length)},
} as const

export function listOperationContracts(): OperationContract[] {
  return Object.values(OPERATION_CONTRACTS)
}

export function getOperationContract(operationId: string): OperationContract {
  if (!(operationId in OPERATION_CONTRACTS)) {
    throw new Error(\`unknown operation: \${operationId}\`)
  }
  return OPERATION_CONTRACTS[operationId as OperationId]
}
`
}

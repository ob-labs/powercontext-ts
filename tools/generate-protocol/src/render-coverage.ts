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

import type { OperationContract } from './contracts.js'
import type { OpenApiDocument } from './load-openapi.js'
import { OAS3_CONVERSION_ID } from './oas3.js'
import { listComponentSchemaNames, type OperationMetadata } from './operations.js'
import { GENERATOR_VERSION, INTEGER_OVERLAY_ID } from './paths.js'

function countNamed(rows: readonly { readonly schemaName: string | null }[]): number {
  return rows.filter((row) => row.schemaName !== null).length
}

export function renderCoverage(
  document: OpenApiDocument,
  operations: readonly OperationMetadata[],
  contracts: readonly OperationContract[],
  sourceDigest: string,
): string {
  const schemas = listComponentSchemaNames(document)
  const requestNamed = contracts.filter((row) => row.request.schemaName !== null).length
  const success = contracts.flatMap((row) => row.success)
  const errors = contracts.flatMap((row) => row.errors)
  return `${JSON.stringify(
    {
      notice: 'DO NOT EDIT',
      generatorVersion: GENERATOR_VERSION,
      conversion: OAS3_CONVERSION_ID,
      overlay: INTEGER_OVERLAY_ID,
      sourceDigest,
      operationCount: operations.length,
      operationIds: operations.map((row) => row.operationId),
      schemaCount: schemas.length,
      schemaNames: schemas,
      requestContracts: requestNamed,
      successMedia: success.length,
      successNamedSchemas: countNamed(success),
      errorMedia: errors.length,
      errorNamedSchemas: countNamed(errors),
      contentKinds: {
        json: [...success, ...errors].filter((row) => row.kind === 'json').length,
        text: [...success, ...errors].filter((row) => row.kind === 'text').length,
        bytes: [...success, ...errors].filter((row) => row.kind === 'bytes').length,
      },
    },
    null,
    2,
  )}\n`
}

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

import { describe, expect, it } from 'vitest'
import { parseOperationContracts } from '../src/contracts.js'
import { loadOpenApi } from '../src/load-openapi.js'
import { parseOperations } from '../src/operations.js'
import { OPENAPI_PATH } from '../src/paths.js'

describe('operation request and response contracts', () => {
  const loaded = loadOpenApi(OPENAPI_PATH)
  const operations = parseOperations(loaded.document)
  const contracts = parseOperationContracts(loaded.document, operations)

  it('covers every parsed operation exactly once', () => {
    expect(contracts).toHaveLength(52)
    expect(contracts.map((row) => row.operationId)).toEqual(
      operations.map((row) => row.operationId),
    )
  })

  it('maps JSON body requests to their component schema names', () => {
    const remember = contracts.find((row) => row.operationId === 'remember_memory')
    expect(remember?.request).toEqual({
      location: 'body',
      contentType: 'application/json',
      schemaName: 'RememberMemoryRequest',
    })
  })

  it('maps query-only operations onto an object schema', () => {
    const stats = contracts.find((row) => row.operationId === 'get_stats')
    expect(stats?.request.location).toBe('query')
    expect(stats?.request.schemaName).toBe('GetStatsRequest')
  })

  it('records empty request contracts for liveness', () => {
    const live = contracts.find((row) => row.operationId === 'get_liveness')
    expect(live?.request).toEqual({
      location: null,
      contentType: null,
      schemaName: null,
    })
  })

  it('records JSON and Markdown success content types for reports', () => {
    const report = contracts.find((row) => row.operationId === 'get_handoff_report')
    expect(report?.success).toEqual(
      expect.arrayContaining([
        {
          status: 200,
          contentType: 'application/json',
          schemaName: 'HandoffReportResponse',
          kind: 'json',
        },
        {
          status: 200,
          contentType: 'text/markdown',
          schemaName: null,
          kind: 'text',
        },
      ]),
    )
  })

  it('maps documented error responses onto ErrorResponse', () => {
    const capture = contracts.find(
      (row) => row.operationId === 'capture_content_source',
    )
    const codes = capture?.errors
      .map((row) => row.status)
      .sort((left, right) => left - right)
    expect(codes).toEqual([401, 409, 422, 500, 503])
    expect(capture?.errors.every((row) => row.schemaName === 'ErrorResponse')).toBe(
      true,
    )
  })

  it('keeps readiness 503 on ReadinessResponse instead of ErrorResponse', () => {
    const ready = contracts.find((row) => row.operationId === 'get_readiness')
    expect(ready?.errors).toEqual([
      {
        status: 503,
        contentType: 'application/json',
        schemaName: 'ReadinessResponse',
        kind: 'json',
      },
    ])
  })
})

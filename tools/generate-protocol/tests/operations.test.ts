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
import { loadOpenApi } from '../src/load-openapi.js'
import { listComponentSchemaNames, parseOperations } from '../src/operations.js'
import { OPENAPI_PATH } from '../src/paths.js'

describe('OpenAPI operation metadata', () => {
  const loaded = loadOpenApi(OPENAPI_PATH)
  const operations = parseOperations(loaded.document)

  it('parses the frozen 52 operations and 177 schemas', () => {
    expect(operations).toHaveLength(52)
    expect(listComponentSchemaNames(loaded.document)).toHaveLength(177)
    expect(new Set(operations.map((row) => row.operationId)).size).toBe(52)
  })

  it('keeps work-domain operations in the generated metadata', () => {
    const ids = operations.map((row) => row.operationId)
    expect(ids).toEqual(
      expect.arrayContaining([
        'create_work_contract',
        'handoff_current_work',
        'acknowledge_handoff',
        'record_task_outcome',
      ]),
    )
  })

  it('classifies body and query request locations', () => {
    const remember = operations.find((row) => row.operationId === 'remember_memory')
    const liveness = operations.find((row) => row.operationId === 'get_liveness')
    expect(remember?.location).toBe('body')
    expect(remember?.scope).toBe(true)
    expect(liveness?.location).toBeNull()
    expect(liveness?.scope).toBe(false)
  })
})

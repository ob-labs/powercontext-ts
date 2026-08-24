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
import {
  getOperationContract,
  listOperationContracts,
  validateOperationError,
  validateOperationRequest,
  validateOperationSuccess,
  validateWireJson,
  validateWireValue,
} from '../src/index.js'

describe('operation wire validation', () => {
  it('exposes a contract for each of the 52 operations', () => {
    const contracts = listOperationContracts()
    expect(contracts).toHaveLength(52)
    expect(getOperationContract('remember_memory').request.schemaName).toBe(
      'RememberMemoryRequest',
    )
  })

  it('accepts a minimal remember request and rejects extra or missing fields', () => {
    const valid = {
      scope_id: 'scope-1',
      kind: 'decision',
      text: 'Use one runtime.',
    }
    expect(validateOperationRequest('remember_memory', valid).valid).toBe(true)
    expect(
      validateOperationRequest('remember_memory', { kind: 'decision' }).valid,
    ).toBe(false)
    expect(
      validateOperationRequest('remember_memory', { ...valid, extra: true }).valid,
    ).toBe(false)
  })

  it('treats omitted optional fields as valid and explicit null by schema', () => {
    const omitted = {
      scope_id: 'scope-1',
      kind: 'decision',
      text: 'Use one runtime.',
    }
    const explicitNull = { ...omitted, reason: null, expected_revision: null }
    expect(validateOperationRequest('remember_memory', omitted).valid).toBe(true)
    expect(validateOperationRequest('remember_memory', explicitNull).valid).toBe(true)
    expect(
      validateOperationRequest('remember_memory', { ...omitted, reason: 1 }).valid,
    ).toBe(false)
  })

  it('validates query requests through the matching component schema', () => {
    expect(validateOperationRequest('get_stats', { scope_id: 'scope-1' }).valid).toBe(
      true,
    )
    expect(validateOperationRequest('get_stats', { period: '30d' }).valid).toBe(false)
  })

  it('treats no-body operations as valid only when the request is empty', () => {
    expect(validateOperationRequest('get_liveness', undefined).valid).toBe(true)
    expect(validateOperationRequest('get_liveness', {}).valid).toBe(false)
  })

  it('validates JSON, text and structured error responses', () => {
    expect(
      validateOperationSuccess('get_liveness', 200, 'application/json', {
        status: 'alive',
      }).valid,
    ).toBe(true)
    expect(
      validateOperationSuccess('get_handoff_report', 200, 'text/markdown', '# Report')
        .valid,
    ).toBe(true)
    expect(
      validateOperationSuccess('get_handoff_report', 200, 'text/markdown', {
        markdown: true,
      }).valid,
    ).toBe(false)
    expect(
      validateOperationError('capture_content_source', 422, {
        error: { code: 'invalid_request', message: 'bad input', details: null },
      }).valid,
    ).toBe(true)
  })

  it('rejects unknown enums and discriminator kinds', () => {
    const citation = validateWireValue('HandoffCitation', {
      kind: 'source',
      source_ref: { name: 'content', source_id: 'src-1' },
    })
    expect(citation.valid).toBe(true)
    expect(validateWireValue('HandoffCitation', { kind: 'unknown' }).valid).toBe(false)
    expect(validateWireValue('StatsPeriod', '30d').valid).toBe(true)
    expect(validateWireValue('StatsPeriod', '90d').valid).toBe(false)
  })

  it('rejects raw JSON integers outside the ADR 0001 safe range before parse', () => {
    const raw =
      '{"scope_id":"scope-1","kind":"decision","text":"x","expected_revision":9007199254740993}'
    const parsed = JSON.parse(raw) as Record<string, unknown>
    expect(parsed['expected_revision']).toBe(9007199254740992)
    expect(validateWireJson('RememberMemoryRequest', raw).valid).toBe(false)
    expect(
      validateWireJson(
        'RememberMemoryRequest',
        '{"scope_id":"scope-1","kind":"decision","text":"x","expected_revision":1}',
      ).valid,
    ).toBe(true)
  })
})

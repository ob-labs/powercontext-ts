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
  GENERATED_MANIFEST,
  listOperationIds,
  validateWireValue,
} from '../src/index.js'

describe('generated protocol artifacts', () => {
  it('covers the frozen 52 operations', () => {
    const ids = listOperationIds()
    expect(ids).toHaveLength(52)
    expect(GENERATED_MANIFEST.operationCount).toBe(52)
    expect(ids).toContain('create_work_contract')
    expect(ids).toContain('search_memory')
  })

  it('validates a success HealthResponse and rejects extra required-missing objects', () => {
    const ok = validateWireValue('HealthResponse', {
      status: 'alive',
    })
    expect(ok.valid).toBe(true)
    const missing = validateWireValue('HealthResponse', {})
    expect(missing.valid).toBe(false)
    const extra = validateWireValue('HealthResponse', {
      status: 'alive',
      extra: true,
    })
    expect(extra.valid).toBe(false)
  })
})

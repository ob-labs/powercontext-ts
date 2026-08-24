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

import {
  validateOperationError,
  validateOperationRequest,
  validateOperationSuccess,
  validateWireJson,
  validateWireValue,
} from '@powercontext/protocol'
import type { CaseOutcome, ExpectedResult, WireCase } from './types.js'

function schemaValid(caseRow: WireCase): boolean {
  const schemaName = caseRow.schemaName
  if (schemaName === undefined) {
    return false
  }
  if (caseRow.rawJson !== undefined) {
    return validateWireJson(schemaName, caseRow.rawJson).valid
  }
  return validateWireValue(schemaName, caseRow.value).valid
}

function evaluateWire(caseRow: WireCase): boolean {
  if (caseRow.role === 'component') {
    return schemaValid(caseRow)
  }
  const operationId = caseRow.operationId
  if (operationId === undefined) {
    return false
  }
  if (caseRow.role === 'request') {
    if (caseRow.rawJson !== undefined && caseRow.schemaName !== undefined) {
      return validateWireJson(caseRow.schemaName, caseRow.rawJson).valid
    }
    return validateOperationRequest(operationId, caseRow.value).valid
  }
  if (caseRow.role === 'success') {
    return validateOperationSuccess(
      operationId,
      caseRow.status ?? 200,
      caseRow.contentType ?? 'application/json',
      caseRow.value,
    ).valid
  }
  return validateOperationError(operationId, caseRow.status ?? 422, caseRow.value).valid
}

export function runWireCase(
  caseRow: WireCase,
  expected: ExpectedResult | undefined,
): CaseOutcome {
  if (expected === undefined) {
    return { id: caseRow.id, status: 'fail', detail: 'missing expected result' }
  }
  const actual = evaluateWire(caseRow)
  if (actual !== expected.valid) {
    return {
      id: caseRow.id,
      status: 'fail',
      detail: `expected valid=${String(expected.valid)}, got ${String(actual)}`,
    }
  }
  return { id: caseRow.id, status: 'pass' }
}

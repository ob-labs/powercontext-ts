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
  getOperationContract,
  listOperationContracts,
  type MediaContract,
} from './generated/operation-contracts.js'
import { validateWireValue } from './generated/validators.js'
import type { WireValidationResult } from './validator-runtime.js'

export { getOperationContract, listOperationContracts }

function invalid(message: string): WireValidationResult {
  return { valid: false, errors: [{ message }] }
}

function validateMedia(media: MediaContract, value: unknown): WireValidationResult {
  if (media.kind === 'text') {
    return typeof value === 'string'
      ? { valid: true, errors: [] }
      : invalid(`${media.contentType} response must be a string`)
  }
  if (media.kind === 'bytes') {
    return value instanceof Uint8Array
      ? { valid: true, errors: [] }
      : invalid(`${media.contentType} response must be bytes`)
  }
  if (media.schemaName === null) {
    return invalid(`missing JSON schema for ${media.contentType}`)
  }
  return validateWireValue(media.schemaName, value)
}

function findMedia(
  rows: readonly MediaContract[],
  status: number,
  contentType: string,
): MediaContract | undefined {
  return rows.find((row) => row.status === status && row.contentType === contentType)
}

export function validateOperationRequest(
  operationId: string,
  value: unknown,
): WireValidationResult {
  const contract = getOperationContract(operationId)
  if (contract.request.schemaName === null) {
    return value === undefined
      ? { valid: true, errors: [] }
      : invalid(`${operationId} does not accept a request payload`)
  }
  return validateWireValue(contract.request.schemaName, value)
}

export function validateOperationSuccess(
  operationId: string,
  status: number,
  contentType: string,
  value: unknown,
): WireValidationResult {
  const media = findMedia(
    getOperationContract(operationId).success,
    status,
    contentType,
  )
  if (media === undefined) {
    return invalid(`unknown success media ${String(status)} ${contentType}`)
  }
  return validateMedia(media, value)
}

export function validateOperationError(
  operationId: string,
  status: number,
  value: unknown,
): WireValidationResult {
  const media = findMedia(
    getOperationContract(operationId).errors,
    status,
    'application/json',
  )
  if (media === undefined) {
    return invalid(`unknown error status ${String(status)}`)
  }
  return validateMedia(media, value)
}

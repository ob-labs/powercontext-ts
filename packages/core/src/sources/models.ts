/**
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InvalidSourceReferenceError } from '../errors.js'
import { MAX_SOURCE_ID_LENGTH, MAX_SOURCE_TYPE_LENGTH } from '../limits.js'
import { codePointLength } from '../canonical/utf8.js'

export type SourceMaterialization = 'captured' | 'referenced'

export interface SourceRef {
  readonly sourceType: string
  readonly sourceId: string
}

export interface Source {
  readonly name: string
  readonly sourceKind: string
  readonly materialization: SourceMaterialization
  readonly description?: string
}

function validateReferencePart(field: string, value: string, maximum: number): string {
  if (value.length === 0 || value.trim().length === 0) {
    throw new InvalidSourceReferenceError(field, 'must be a non-empty string')
  }
  if (value !== value.trim()) {
    throw new InvalidSourceReferenceError(
      field,
      'must not contain leading or trailing whitespace',
    )
  }
  if (codePointLength(value) > maximum) {
    throw new InvalidSourceReferenceError(
      field,
      `must not exceed ${String(maximum)} characters`,
    )
  }
  return value
}

export function createSourceRef(sourceType: string, sourceId: string): SourceRef {
  return Object.freeze({
    sourceType: validateReferencePart(
      'source_type',
      sourceType,
      MAX_SOURCE_TYPE_LENGTH,
    ),
    sourceId: validateReferencePart('source_id', sourceId, MAX_SOURCE_ID_LENGTH),
  })
}

export function createSource(input: {
  readonly name: string
  readonly sourceKind: string
  readonly materialization: SourceMaterialization
  readonly description?: string
}): Source {
  const name = validateReferencePart('source_id', input.name, MAX_SOURCE_ID_LENGTH)
  const sourceKind = validateReferencePart(
    'source_type',
    input.sourceKind,
    MAX_SOURCE_TYPE_LENGTH,
  )
  const source: Source = {
    name,
    sourceKind,
    materialization: input.materialization,
  }
  if (input.description !== undefined) {
    return Object.freeze({ ...source, description: input.description })
  }
  return Object.freeze(source)
}

export function sourceRefJson(ref: SourceRef): {
  source_type: string
  source_id: string
} {
  return { source_type: ref.sourceType, source_id: ref.sourceId }
}

export function sourcesEqual(left: Source, right: Source): boolean {
  return (
    left.name === right.name &&
    left.sourceKind === right.sourceKind &&
    left.materialization === right.materialization &&
    left.description === right.description
  )
}

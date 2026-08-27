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

export class PowerContextError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class CanonicalizationError extends PowerContextError {}

export class ValidationError extends PowerContextError {}

export class UnavailableError extends PowerContextError {}

export class LifecycleError extends PowerContextError {}

export class InternalError extends PowerContextError {}

export class SourceError extends PowerContextError {}

export class SourceNotFoundError extends SourceError {
  readonly source: unknown

  constructor(source: unknown) {
    super('source was not found')
    this.source = source
  }
}

export class SourceAdapterNotFoundError extends SourceError {
  readonly route: 'input' | 'source'
  readonly requestedType: unknown

  constructor(route: 'input' | 'source', requestedType: unknown) {
    super(
      `no Source adapter is registered for ${route} type ${typeName(requestedType)}`,
    )
    this.route = route
    this.requestedType = requestedType
  }
}

export class InvalidSourceAdapterError extends SourceError {
  readonly field: string
  readonly detail: string

  constructor(field: string, detail: string) {
    super(`invalid Source adapter ${field}: ${detail}`)
    this.field = field
    this.detail = detail
  }
}

export class SourceConflictError extends SourceError {
  readonly field: string
  readonly value: unknown

  constructor(field: string, value: unknown) {
    super(`duplicate Source ${field}: ${typeName(value)}`)
    this.field = field
    this.value = value
  }
}

export class InvalidSourceReferenceError extends SourceError {
  readonly field: string
  readonly detail: string

  constructor(field: string, detail: string) {
    super(`invalid Source reference ${field}: ${detail}`)
    this.field = field
    this.detail = detail
  }
}

export class InvalidSourceEntryError extends SourceError {
  readonly actualType: unknown

  constructor(actualType: unknown) {
    super(`catalog entries must be Source values, got ${typeName(actualType)}`)
    this.actualType = actualType
  }
}

export class InvalidSourceResultError extends SourceError {
  readonly adapterName: string
  readonly operation: string

  constructor(
    adapterName: string,
    operation: string,
    expected: string,
    actual: string,
  ) {
    super(
      `Source adapter ${adapterName} returned ${actual} from ${operation}, expected ${expected}`,
    )
    this.adapterName = adapterName
    this.operation = operation
  }
}

export class ArtifactError extends PowerContextError {}

export class ArtifactNotFoundError extends ArtifactError {
  readonly artifact: unknown

  constructor(artifact: unknown) {
    super('artifact was not found')
    this.artifact = artifact
  }
}

export class InvalidArtifactReferenceError extends ArtifactError {
  readonly field: string
  readonly detail: string

  constructor(field: string, detail: string) {
    super(`invalid Artifact reference ${field}: ${detail}`)
    this.field = field
    this.detail = detail
  }
}

export class ArtifactFamilyMismatchError extends ArtifactError {
  readonly artifact: unknown
  readonly draft: unknown

  constructor(artifact: unknown, draft: unknown) {
    super('artifact and draft families do not match')
    this.artifact = artifact
    this.draft = draft
  }
}

export class RevisionConflictError extends ArtifactError {
  readonly artifact: unknown
  readonly current: unknown

  constructor(artifact: unknown, current: unknown) {
    super('artifact is not the latest revision')
    this.artifact = artifact
    this.current = current
  }
}

function typeName(value: unknown): string {
  if (typeof value === 'function' && 'name' in value) {
    return value.name || 'Function'
  }
  if (value !== null && typeof value === 'object') {
    const ctor = value.constructor
    if (typeof ctor === 'function' && ctor.name.length > 0) {
      return ctor.name
    }
  }
  return typeof value
}

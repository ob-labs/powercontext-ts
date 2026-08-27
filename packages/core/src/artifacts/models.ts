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

import { InvalidArtifactReferenceError } from '../errors.js'
import { assertSafeInteger } from '../integers.js'
import { MAX_ARTIFACT_FAMILY_LENGTH, MAX_ARTIFACT_ID_LENGTH } from '../limits.js'
import { createSourceRef, type SourceRef } from '../sources/models.js'
import { immutableSnapshot } from '../snapshot.js'

export interface ArtifactRef {
  readonly family: string
  readonly artifactId: string
  readonly revision: number
}

export interface ArtifactLineage {
  readonly sources: readonly SourceRef[]
  readonly artifacts: readonly ArtifactRef[]
}

export interface ArtifactDraft<TContent = unknown> {
  readonly family: string
  readonly content: TContent
  readonly sources: readonly SourceRef[]
  readonly artifacts: readonly ArtifactRef[]
}

export interface Artifact<TContent = unknown> {
  readonly family: string
  readonly artifactId: string
  readonly revision: number
  readonly content: TContent
  readonly lineage: ArtifactLineage
  asRef(): ArtifactRef
}

function validateIdentity(field: string, value: string, maximum: number): string {
  if (value.length === 0 || value.trim().length === 0) {
    throw new InvalidArtifactReferenceError(field, 'must be a non-empty string')
  }
  if (value !== value.trim()) {
    throw new InvalidArtifactReferenceError(
      field,
      'must not contain leading or trailing whitespace',
    )
  }
  if ([...value].length > maximum) {
    throw new InvalidArtifactReferenceError(
      field,
      `must not exceed ${String(maximum)} characters`,
    )
  }
  return value
}

function validateRevision(revision: unknown): number {
  try {
    const value = assertSafeInteger(revision, 'revision')
    if (value < 1) {
      throw new InvalidArtifactReferenceError('revision', 'must be an integer >= 1')
    }
    return value
  } catch (error) {
    if (error instanceof InvalidArtifactReferenceError) {
      throw error
    }
    throw new InvalidArtifactReferenceError('revision', 'must be an integer >= 1')
  }
}

function requireSourceRef(value: SourceRef): SourceRef {
  return createSourceRef(value.sourceType, value.sourceId)
}

function requireArtifactRef(value: ArtifactRef): ArtifactRef {
  return createArtifactRef(value.family, value.artifactId, value.revision)
}

function freezeLineage(
  sources: readonly SourceRef[],
  artifacts: readonly ArtifactRef[],
  path: string,
): ArtifactLineage {
  return immutableSnapshot(
    {
      sources: sources.map((ref) => requireSourceRef(ref)),
      artifacts: artifacts.map((ref) => requireArtifactRef(ref)),
    },
    path,
  )
}

export function createArtifactRef(
  family: string,
  artifactId: string,
  revision: number,
): ArtifactRef {
  return Object.freeze({
    family: validateIdentity('family', family, MAX_ARTIFACT_FAMILY_LENGTH),
    artifactId: validateIdentity('artifact_id', artifactId, MAX_ARTIFACT_ID_LENGTH),
    revision: validateRevision(revision),
  })
}

export function createArtifactDraft<TContent>(input: {
  readonly family: string
  readonly content: TContent
  readonly sources?: readonly SourceRef[]
  readonly artifacts?: readonly ArtifactRef[]
}): ArtifactDraft<TContent> {
  const lineage = freezeLineage(
    input.sources ?? [],
    input.artifacts ?? [],
    'artifact draft lineage',
  )
  return Object.freeze({
    family: validateIdentity('family', input.family, MAX_ARTIFACT_FAMILY_LENGTH),
    content: immutableSnapshot(input.content, 'artifact draft content'),
    sources: lineage.sources,
    artifacts: lineage.artifacts,
  })
}

export function createArtifact<TContent>(input: {
  readonly family: string
  readonly artifactId: string
  readonly revision: number
  readonly content: TContent
  readonly lineage?: ArtifactLineage
}): Artifact<TContent> {
  const ref = createArtifactRef(input.family, input.artifactId, input.revision)
  const lineage = freezeLineage(
    input.lineage?.sources ?? [],
    input.lineage?.artifacts ?? [],
    'artifact lineage',
  )
  return Object.freeze({
    family: ref.family,
    artifactId: ref.artifactId,
    revision: ref.revision,
    content: immutableSnapshot(input.content, 'artifact content'),
    lineage,
    asRef() {
      return createArtifactRef(ref.family, ref.artifactId, ref.revision)
    },
  })
}

export function artifactRefJson(ref: ArtifactRef): {
  family: string
  artifact_id: string
  revision: number
} {
  return { family: ref.family, artifact_id: ref.artifactId, revision: ref.revision }
}

export interface ArtifactCatalog<TArtifact extends Artifact = Artifact> {
  get(artifact: TArtifact): Promise<TArtifact>
  latest(artifact: TArtifact): Promise<TArtifact>
  revisions(artifact: TArtifact): Promise<readonly TArtifact[]>
}

export interface ArtifactStore<
  TDraft extends ArtifactDraft = ArtifactDraft,
  TArtifact extends Artifact = Artifact,
> {
  create(artifactId: string, draft: TDraft): Promise<TArtifact>
  revise(artifact: TArtifact, draft: TDraft): Promise<TArtifact>
}

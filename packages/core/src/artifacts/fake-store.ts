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

import {
  ArtifactFamilyMismatchError,
  ArtifactNotFoundError,
  RevisionConflictError,
} from '../errors.js'
import {
  createArtifact,
  createArtifactRef,
  type Artifact,
  type ArtifactDraft,
  type ArtifactRef,
  type ArtifactStore,
} from './models.js'

export type ArtifactStoreTrace =
  | {
      readonly op: 'create'
      readonly family: string
      readonly artifactId: string
      readonly revision: 1
      readonly head: 1
    }
  | {
      readonly op: 'revise'
      readonly family: string
      readonly artifactId: string
      readonly from: number
      readonly to: number
      readonly head: number
    }
  | {
      readonly op: 'conflict'
      readonly family: string
      readonly artifactId: string
      readonly expectedRevision: number
      readonly actualRevision: number | null
    }

export class FakeArtifactStore implements ArtifactStore<ArtifactDraft, Artifact> {
  private readonly histories = new Map<string, Map<string, Artifact[]>>()
  private readonly events: ArtifactStoreTrace[] = []

  async create(artifactId: string, draft: ArtifactDraft): Promise<Artifact> {
    const existing = this.historyOf(draft.family, artifactId)
    if (existing !== undefined && existing.length > 0) {
      const current = existing[existing.length - 1]
      this.record({
        op: 'conflict',
        family: draft.family,
        artifactId,
        expectedRevision: 0,
        actualRevision: current?.revision ?? null,
      })
      throw new RevisionConflictError(
        createArtifactRef(draft.family, artifactId, 1),
        current,
      )
    }
    const artifact = this.appendRevision(artifactId, draft, 1)
    this.record({
      op: 'create',
      family: draft.family,
      artifactId,
      revision: 1,
      head: 1,
    })
    return artifact
  }

  async revise(artifact: Artifact, draft: ArtifactDraft): Promise<Artifact> {
    if (artifact.family !== draft.family) {
      throw new ArtifactFamilyMismatchError(artifact, draft)
    }
    const current = this.headOf(artifact.family, artifact.artifactId)
    if (current === undefined || current.revision !== artifact.revision) {
      this.record({
        op: 'conflict',
        family: artifact.family,
        artifactId: artifact.artifactId,
        expectedRevision: artifact.revision,
        actualRevision: current?.revision ?? null,
      })
      throw new RevisionConflictError(artifact, current)
    }
    const revised = this.appendRevision(
      artifact.artifactId,
      draft,
      artifact.revision + 1,
    )
    this.record({
      op: 'revise',
      family: artifact.family,
      artifactId: artifact.artifactId,
      from: artifact.revision,
      to: revised.revision,
      head: revised.revision,
    })
    return revised
  }

  async get(ref: ArtifactRef): Promise<Artifact> {
    const history = this.historyOf(ref.family, ref.artifactId) ?? []
    const found = history.find((item) => item.revision === ref.revision)
    if (found === undefined) {
      throw new ArtifactNotFoundError(ref)
    }
    return found
  }

  async latest(family: string, artifactId: string): Promise<Artifact> {
    const current = this.headOf(family, artifactId)
    if (current === undefined) {
      throw new ArtifactNotFoundError(createArtifactRef(family, artifactId, 1))
    }
    return current
  }

  async revisions(family: string, artifactId: string): Promise<readonly Artifact[]> {
    return [...(this.historyOf(family, artifactId) ?? [])]
  }

  traces(): readonly ArtifactStoreTrace[] {
    return [...this.events]
  }

  private headOf(family: string, artifactId: string): Artifact | undefined {
    const history = this.historyOf(family, artifactId)
    return history?.[history.length - 1]
  }

  private appendRevision(
    artifactId: string,
    draft: ArtifactDraft,
    revision: number,
  ): Artifact {
    const artifact = createArtifact({
      family: draft.family,
      artifactId,
      revision,
      content: draft.content,
      lineage: { sources: draft.sources, artifacts: draft.artifacts },
    })
    const history = this.historyOf(draft.family, artifactId) ?? []
    history.push(artifact)
    let family = this.histories.get(draft.family)
    if (family === undefined) {
      family = new Map<string, Artifact[]>()
      this.histories.set(draft.family, family)
    }
    family.set(artifactId, history)
    return artifact
  }

  private historyOf(family: string, artifactId: string): Artifact[] | undefined {
    return this.histories.get(family)?.get(artifactId)
  }

  private record(event: ArtifactStoreTrace): void {
    this.events.push(Object.freeze(event))
  }
}

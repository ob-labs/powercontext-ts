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
  canonicalizeJson,
  bigintToSafeInteger,
  createArtifact,
  createArtifactRef,
  createSourceRef,
} from '@powercontext/core'
import type {
  Artifact,
  ArtifactCatalog,
  ArtifactDraft,
  ArtifactRef,
  ArtifactStore,
} from '@powercontext/core'
import { normalizeRefs } from '@powercontext/core'
import type { SQLiteSession } from './sqlite-session.js'

type ArtifactRow = {
  readonly family: string
  readonly artifact_id: string
  readonly revision: bigint
  readonly content_json: string
  readonly source_refs_json: string
  readonly artifact_refs_json: string
}

function refOf(value: Artifact | ArtifactRef): ArtifactRef {
  return typeof (value as Artifact).asRef === 'function'
    ? (value as Artifact).asRef()
    : (value as ArtifactRef)
}

function rowToArtifact(row: ArtifactRow): Artifact {
  const revision = bigintToSafeInteger(row.revision, 'revision')
  const sourceRefs = (
    JSON.parse(row.source_refs_json) as Array<{
      source_type: string
      source_id: string
    }>
  ).map((ref) => createSourceRef(ref.source_type, ref.source_id))
  const artifactRefs = (
    JSON.parse(row.artifact_refs_json) as Array<{
      family: string
      artifact_id: string
      revision: number
    }>
  ).map((ref) => createArtifactRef(ref.family, ref.artifact_id, ref.revision))
  return createArtifact({
    family: row.family,
    artifactId: row.artifact_id,
    revision,
    content: JSON.parse(row.content_json) as unknown,
    lineage: {
      sources: sourceRefs,
      artifacts: artifactRefs,
    },
  })
}

export class SQLiteArtifactStore
  implements ArtifactStore<ArtifactDraft, Artifact>, ArtifactCatalog<Artifact>
{
  constructor(private readonly session: SQLiteSession) {}

  async create(artifactId: string, draft: ArtifactDraft): Promise<Artifact> {
    return this.session.transaction(() => {
      const current = this.headRow(draft.family, artifactId)
      if (current !== undefined) {
        throw new RevisionConflictError(
          createArtifactRef(draft.family, artifactId, 1),
          rowToArtifact(current),
        )
      }
      return this.insertRevision(artifactId, draft, 1)
    })
  }

  async revise(artifact: Artifact, draft: ArtifactDraft): Promise<Artifact> {
    if (artifact.family !== draft.family) {
      throw new ArtifactFamilyMismatchError(artifact, draft)
    }
    return this.session.transaction(() => {
      const current = this.headRow(artifact.family, artifact.artifactId)
      const actualRevision =
        current === undefined ? null : bigintToSafeInteger(current.revision, 'revision')
      if (current === undefined || actualRevision !== artifact.revision) {
        throw new RevisionConflictError(
          artifact,
          current === undefined ? null : rowToArtifact(current),
        )
      }
      return this.insertRevision(artifact.artifactId, draft, artifact.revision + 1)
    })
  }

  async get(target: ArtifactRef | Artifact): Promise<Artifact> {
    const ref = refOf(target)
    const row = this.session
      .prepare(
        'SELECT family, artifact_id, revision, content_json, source_refs_json, artifact_refs_json FROM pc_artifact_version WHERE family = ? AND artifact_id = ? AND revision = ?',
      )
      .get(ref.family, ref.artifactId, ref.revision) as ArtifactRow | undefined
    if (row === undefined) {
      throw new ArtifactNotFoundError(ref)
    }
    return rowToArtifact(row)
  }

  async latest(artifact: Artifact): Promise<Artifact>
  async latest(family: string, artifactId: string): Promise<Artifact>
  async latest(
    familyOrArtifact: string | Artifact,
    artifactId?: string,
  ): Promise<Artifact> {
    const family =
      typeof familyOrArtifact === 'string' ? familyOrArtifact : familyOrArtifact.family
    const id =
      typeof familyOrArtifact === 'string'
        ? (artifactId ?? '')
        : familyOrArtifact.artifactId
    const row = this.headRow(family, id)
    if (row === undefined) {
      throw new ArtifactNotFoundError(createArtifactRef(family, id || 'missing', 1))
    }
    return rowToArtifact(row)
  }

  async revisions(artifact: Artifact): Promise<readonly Artifact[]>
  async revisions(family: string, artifactId: string): Promise<readonly Artifact[]>
  async revisions(
    familyOrArtifact: string | Artifact,
    artifactId?: string,
  ): Promise<readonly Artifact[]> {
    const family =
      typeof familyOrArtifact === 'string' ? familyOrArtifact : familyOrArtifact.family
    const id =
      typeof familyOrArtifact === 'string'
        ? (artifactId ?? '')
        : familyOrArtifact.artifactId
    const rows = this.session
      .prepare(
        'SELECT family, artifact_id, revision, content_json, source_refs_json, artifact_refs_json FROM pc_artifact_version WHERE family = ? AND artifact_id = ? ORDER BY revision',
      )
      .all(family, id) as ArtifactRow[]
    return rows.map(rowToArtifact)
  }

  insertRevision(artifactId: string, draft: ArtifactDraft, revision: number): Artifact {
    const sources = normalizeRefs(draft.sources)
    const artifacts = normalizeRefs(draft.artifacts)
    const contentJson = canonicalizeJson(draft.content)
    const sourceRefsJson = canonicalizeJson(sources)
    const artifactRefsJson = canonicalizeJson(artifacts)
    const typedSources = (
      sources as Array<{
        source_type: string
        source_id: string
      }>
    ).map((ref) => createSourceRef(ref.source_type, ref.source_id))
    const typedArtifacts = (
      artifacts as Array<{
        family: string
        artifact_id: string
        revision: number
      }>
    ).map((ref) => createArtifactRef(ref.family, ref.artifact_id, ref.revision))
    this.session
      .prepare(
        'INSERT INTO pc_artifact_version(family, artifact_id, revision, content_json, source_refs_json, artifact_refs_json) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(
        draft.family,
        artifactId,
        revision,
        contentJson,
        sourceRefsJson,
        artifactRefsJson,
      )
    this.session
      .prepare(
        'INSERT INTO pc_artifact_head(family, artifact_id, revision) VALUES (?, ?, ?) ON CONFLICT(family, artifact_id) DO UPDATE SET revision = excluded.revision',
      )
      .run(draft.family, artifactId, revision)
    return createArtifact({
      family: draft.family,
      artifactId,
      revision,
      content: JSON.parse(contentJson) as unknown,
      lineage: {
        sources: typedSources,
        artifacts: typedArtifacts,
      },
    })
  }

  private headRow(family: string, artifactId: string): ArtifactRow | undefined {
    return this.session
      .prepare(
        'SELECT v.family, v.artifact_id, v.revision, v.content_json, v.source_refs_json, v.artifact_refs_json FROM pc_artifact_head h JOIN pc_artifact_version v ON v.family = h.family AND v.artifact_id = h.artifact_id AND v.revision = h.revision WHERE h.family = ? AND h.artifact_id = ?',
      )
      .get(family, artifactId) as ArtifactRow | undefined
  }
}

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

import { SourceConflictError, SourceNotFoundError } from '../errors.js'
import { immutableSnapshot } from '../snapshot.js'
import { sourcesEqual, type Source } from './models.js'
import type { SourceCatalogBackend, SourceStore } from './catalog.js'

export type SourceStoreTrace =
  | {
      readonly op: 'add'
      readonly sourceType: string
      readonly sourceId: string
    }
  | {
      readonly op: 'conflict'
      readonly sourceType: string
      readonly sourceId: string
    }

function sourceIdentity(source: Source): string {
  return `${source.sourceKind}\0${source.name}`
}

export class FakeSourceStore implements SourceCatalogBackend, SourceStore<Source> {
  private readonly sources: Source[] = []
  private readonly events: SourceStoreTrace[] = []

  async add<TSource extends Source>(source: TSource): Promise<TSource> {
    const stored = immutableSnapshot(source, 'source') as TSource
    const existing = this.sources.find(
      (item) => sourceIdentity(item) === sourceIdentity(stored),
    )
    if (existing !== undefined) {
      return this.reuseOrConflict(existing, stored)
    }
    this.sources.push(stored)
    this.record({
      op: 'add',
      sourceType: stored.sourceKind,
      sourceId: stored.name,
    })
    return stored
  }

  async get(source: Source): Promise<Source> {
    const stored = this.sources.find((item) => sourcesEqual(item, source))
    if (stored === undefined) {
      throw new SourceNotFoundError(source)
    }
    return stored
  }

  async list(): Promise<readonly Source[]> {
    return [...this.sources]
  }

  traces(): readonly SourceStoreTrace[] {
    return [...this.events]
  }

  private reuseOrConflict<TSource extends Source>(
    existing: Source,
    stored: TSource,
  ): TSource {
    if (sourcesEqual(existing, stored)) {
      return existing as TSource
    }
    this.record({
      op: 'conflict',
      sourceType: stored.sourceKind,
      sourceId: stored.name,
    })
    throw new SourceConflictError('identity', `${stored.sourceKind}:${stored.name}`)
  }

  private record(event: SourceStoreTrace): void {
    this.events.push(Object.freeze(event))
  }
}

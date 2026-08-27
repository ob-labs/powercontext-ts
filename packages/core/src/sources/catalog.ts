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
  InvalidSourceAdapterError,
  InvalidSourceEntryError,
  InvalidSourceResultError,
  SourceAdapterNotFoundError,
  SourceConflictError,
  SourceNotFoundError,
} from '../errors.js'
import { createSourceRef, sourcesEqual, type Source, type SourceRef } from './models.js'

export interface SourceAdapter<
  TInput = unknown,
  TSource extends Source = Source,
  TValue = unknown,
> {
  readonly name: string
  matchesInput(value: unknown): value is TInput
  belongsTo(source: Source): source is TSource
  resolve(value: TInput): Promise<TSource>
  read(source: TSource): Promise<TValue>
}

export interface SourceStore<TSource extends Source = Source> {
  add(source: TSource): Promise<TSource>
}

export interface SourceCatalogBackend {
  get(source: Source): Promise<Source>
  list(): Promise<readonly Source[]>
}

export function createSourceAdapter<TInput, TSource extends Source, TValue>(
  adapter: SourceAdapter<TInput, TSource, TValue>,
): SourceAdapter<TInput, TSource, TValue> {
  if (adapter.name.trim().length === 0 || adapter.name !== adapter.name.trim()) {
    throw new InvalidSourceAdapterError('name', 'must be a non-empty string')
  }
  return adapter
}

function adapterForSource(
  source: Source,
  adapters: readonly SourceAdapter[],
): SourceAdapter {
  const adapter = adapters.find((item) => item.belongsTo(source))
  if (adapter === undefined) {
    throw new SourceAdapterNotFoundError('source', source.sourceKind)
  }
  return adapter
}

export class SourceCatalog {
  private readonly backend: SourceCatalogBackend
  private readonly adapters: readonly SourceAdapter[]

  constructor(options: {
    readonly backend: SourceCatalogBackend
    readonly adapters: readonly SourceAdapter[]
  }) {
    const names = new Set<string>()
    for (const adapter of options.adapters) {
      if (names.has(adapter.name)) {
        throw new SourceConflictError('name', adapter.name)
      }
      names.add(adapter.name)
    }
    this.backend = options.backend
    this.adapters = options.adapters
  }

  asRef(source: Source): SourceRef {
    if (typeof source.name !== 'string' || typeof source.sourceKind !== 'string') {
      throw new InvalidSourceEntryError(source)
    }
    const adapter = adapterForSource(source, this.adapters)
    if (adapter.name !== source.sourceKind) {
      throw new InvalidSourceResultError(
        adapter.name,
        'asRef',
        adapter.name,
        source.sourceKind,
      )
    }
    return createSourceRef(adapter.name, source.name)
  }

  async list(): Promise<readonly Source[]> {
    const sources = await this.backend.list()
    for (const source of sources) {
      this.asRef(source)
    }
    return sources
  }

  async get(source: Source): Promise<Source> {
    this.asRef(source)
    const stored = await this.backend.get(source)
    this.asRef(stored)
    if (!sourcesEqual(stored, source)) {
      throw new SourceNotFoundError(source)
    }
    return stored
  }

  async resolve(value: unknown): Promise<Source> {
    const adapter = this.adapters.find((item) => item.matchesInput(value))
    if (adapter === undefined) {
      throw new SourceAdapterNotFoundError('input', value)
    }
    const source = await adapter.resolve(value)
    this.asRef(source)
    return source
  }

  async read(source: Source): Promise<unknown> {
    return adapterForSource(source, this.adapters).read(source)
  }
}

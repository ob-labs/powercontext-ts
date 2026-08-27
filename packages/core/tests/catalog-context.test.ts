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

import { describe, expect, it } from 'vitest'
import {
  ArtifactFamilyMismatchError,
  FakeArtifactStore,
  FakeSourceStore,
  InvalidSourceReferenceError,
  InvalidSourceResultError,
  PowerContext,
  SourceAdapterNotFoundError,
  SourceCatalog,
  SourceConflictError,
  SourceNotFoundError,
  activateTrigger,
  createArtifact,
  createArtifactDraft,
  createFrozenClock,
  createSequenceIdFactory,
  createSource,
  createSourceAdapter,
  type Source,
} from '../src/index.js'

interface ConversationCapture {
  readonly kind: 'conversation-capture'
  readonly name: string
  readonly sessionId: string
  readonly capture: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function conversationAdapter(sessions: Record<string, readonly string[]>) {
  return createSourceAdapter<
    ConversationCapture,
    ReturnType<typeof createSource>,
    readonly string[]
  >({
    name: 'conversation',
    matchesInput(value): value is ConversationCapture {
      return isRecord(value) && value['kind'] === 'conversation-capture'
    },
    belongsTo(source): source is Source {
      return source.sourceKind === 'conversation'
    },
    async resolve(value) {
      return createSource({
        name: value.name,
        sourceKind: 'conversation',
        materialization: value.capture ? 'captured' : 'referenced',
      })
    },
    async read(source) {
      return sessions[source.name] ?? []
    },
  })
}

describe('Source catalog and composition root', () => {
  it('resolves, persists, and reads through an injected catalog without choosing storage', async () => {
    const sessions = { 'session-42-snapshot': ['aisle seats'] }
    const backend = new FakeSourceStore()
    const catalog = new SourceCatalog({
      backend,
      adapters: [conversationAdapter(sessions)],
    })
    const captured = await catalog.resolve({
      kind: 'conversation-capture',
      name: 'session-42-snapshot',
      sessionId: 'session-42',
      capture: true,
    })
    expect(await catalog.list()).toEqual([])
    const stored = await backend.add(captured)
    expect(await catalog.get(stored)).toEqual(stored)
    expect(await catalog.read(stored)).toEqual(['aisle seats'])
    expect(catalog.asRef(stored)).toEqual({
      sourceType: 'conversation',
      sourceId: 'session-42-snapshot',
    })
    expect(backend.traces()).toEqual([
      {
        op: 'add',
        sourceType: 'conversation',
        sourceId: 'session-42-snapshot',
      },
    ])
  })

  it('rejects unregistered inputs and duplicate adapter names before storage', async () => {
    const adapter = conversationAdapter({})
    expect(
      () =>
        new SourceCatalog({
          backend: new FakeSourceStore(),
          adapters: [adapter, adapter],
        }),
    ).toThrow(SourceConflictError)

    const catalog = new SourceCatalog({
      backend: new FakeSourceStore(),
      adapters: [adapter],
    })
    await expect(catalog.resolve({ kind: 'unknown' })).rejects.toBeInstanceOf(
      SourceAdapterNotFoundError,
    )
    await expect(
      catalog.get(
        createSource({
          name: 'missing',
          sourceKind: 'conversation',
          materialization: 'referenced',
        }),
      ),
    ).rejects.toBeInstanceOf(SourceNotFoundError)
  })

  it('rejects adapter names that do not match the stored source kind', () => {
    const catalog = new SourceCatalog({
      backend: new FakeSourceStore(),
      adapters: [
        createSourceAdapter({
          name: 'conversation-v2',
          matchesInput: (_value): _value is never => false,
          belongsTo: (source): source is Source => source.sourceKind === 'conversation',
          async resolve() {
            return createSource({
              name: 'session',
              sourceKind: 'conversation',
              materialization: 'referenced',
            })
          },
          async read() {
            return []
          },
        }),
      ],
    })
    expect(() =>
      catalog.asRef(
        createSource({
          name: 'session',
          sourceKind: 'conversation',
          materialization: 'referenced',
        }),
      ),
    ).toThrow(InvalidSourceResultError)
  })

  it('snapshots sources and treats identical identities as idempotent', async () => {
    const store = new FakeSourceStore()
    const first = createSource({
      name: 'session-42',
      sourceKind: 'conversation',
      materialization: 'captured',
      description: 'keep',
    })
    const stored = await store.add(first)
    expect(await store.add(first)).toBe(stored)
    await expect(
      store.add(
        createSource({
          name: 'session-42',
          sourceKind: 'conversation',
          materialization: 'referenced',
        }),
      ),
    ).rejects.toBeInstanceOf(SourceConflictError)
    expect(store.traces().at(-1)).toEqual({
      op: 'conflict',
      sourceType: 'conversation',
      sourceId: 'session-42',
    })
  })

  it('rejects an unknown materialization at construction time', () => {
    expect(() =>
      createSource({
        name: 'session',
        sourceKind: 'conversation',
        materialization: 'derived' as Source['materialization'],
      }),
    ).toThrow(InvalidSourceReferenceError)
  })

  it('binds sources, artifacts, and a pure trigger without selecting a database', async () => {
    const artifacts = new FakeArtifactStore()
    const sources = new FakeSourceStore()
    const clock = createFrozenClock('2026-08-26T12:00:00.000000Z')
    const ids = createSequenceIdFactory('test')
    const context = new PowerContext({
      sources,
      artifacts,
      triggers: {
        window: {
          initialState: () => ({ count: 0 }),
          activate(signal: { increment: number }, state: { count: number }) {
            return {
              state: { count: state.count + signal.increment },
              actions: state.count + signal.increment >= 2 ? (['flush'] as const) : [],
            }
          },
        },
      },
      clock,
      ids,
    })
    expect(context.clock.nowIso()).toBe('2026-08-26T12:00:00.000000Z')
    expect(context.ids.next('artifact')).toBe('test-artifact-0001')
    const first = activateTrigger(context.triggers.window, { increment: 1 })
    const second = activateTrigger(
      context.triggers.window,
      { increment: 1 },
      first.state,
    )
    expect(first.actions).toEqual([])
    expect(second.actions).toEqual(['flush'])
    const draft = createArtifactDraft({ family: 'memory', content: { text: 'ok' } })
    await expect(
      context.artifacts.revise(
        createArtifact({
          family: 'handoff',
          artifactId: 'x',
          revision: 1,
          content: {},
        }),
        draft,
      ),
    ).rejects.toBeInstanceOf(ArtifactFamilyMismatchError)
  })

  it('passes an explicit null trigger state through unchanged', () => {
    const trigger = {
      initialState: () => 'initial',
      activate: (_signal: string, state: string | null) => ({ state, actions: [] }),
    }

    expect(activateTrigger(trigger, 'signal', null).state).toBeNull()
  })
})

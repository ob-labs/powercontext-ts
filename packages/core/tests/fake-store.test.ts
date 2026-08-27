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
  ArtifactNotFoundError,
  FakeArtifactStore,
  InvalidArtifactReferenceError,
  InvalidSourceReferenceError,
  RevisionConflictError,
  createArtifactDraft,
  createArtifactRef,
  createSourceRef,
} from '../src/index.js'

describe('FakeArtifactStore revision and head traces', () => {
  it('creates revision 1, appends history, and records head CAS traces', async () => {
    const store = new FakeArtifactStore()
    const source = createSourceRef('conversation', 'session-42')
    const created = await store.create(
      'handoff-1',
      createArtifactDraft({
        family: 'handoff',
        content: { summary: 'v1' },
        sources: [source],
      }),
    )
    expect(created.revision).toBe(1)
    expect(created.asRef()).toEqual(createArtifactRef('handoff', 'handoff-1', 1))
    expect(created.lineage.sources).toEqual([source])

    const revised = await store.revise(
      created,
      createArtifactDraft({
        family: 'handoff',
        content: { summary: 'v2' },
        sources: [source],
      }),
    )
    expect(revised.revision).toBe(2)
    expect(await store.latest('handoff', 'handoff-1')).toEqual(revised)
    expect(await store.revisions('handoff', 'handoff-1')).toEqual([created, revised])
    expect(await store.get(createArtifactRef('handoff', 'handoff-1', 1))).toEqual(
      created,
    )
    expect(store.traces()).toEqual([
      {
        op: 'create',
        family: 'handoff',
        artifactId: 'handoff-1',
        revision: 1,
        head: 1,
      },
      {
        op: 'revise',
        family: 'handoff',
        artifactId: 'handoff-1',
        from: 1,
        to: 2,
        head: 2,
      },
    ])
  })

  it('rejects a stale base revision and keeps the current head', async () => {
    const store = new FakeArtifactStore()
    const original = await store.create(
      'handoff-1',
      createArtifactDraft({ family: 'handoff', content: { summary: 'v1' } }),
    )
    const current = await store.revise(
      original,
      createArtifactDraft({ family: 'handoff', content: { summary: 'v2' } }),
    )
    await expect(
      store.revise(
        original,
        createArtifactDraft({ family: 'handoff', content: { summary: 'stale' } }),
      ),
    ).rejects.toBeInstanceOf(RevisionConflictError)
    expect(await store.latest('handoff', 'handoff-1')).toEqual(current)
    expect(store.traces().at(-1)).toEqual({
      op: 'conflict',
      family: 'handoff',
      artifactId: 'handoff-1',
      expectedRevision: 1,
      actualRevision: 2,
    })
  })

  it('rejects a second create on the same identity as a revision conflict', async () => {
    const store = new FakeArtifactStore()
    await store.create(
      'report-1',
      createArtifactDraft({ family: 'report', content: { status: 'green' } }),
    )
    await expect(
      store.create(
        'report-1',
        createArtifactDraft({ family: 'report', content: { status: 'red' } }),
      ),
    ).rejects.toBeInstanceOf(RevisionConflictError)
  })

  it('rejects cross-family revise before mutating history', async () => {
    const store = new FakeArtifactStore()
    const memory = await store.create(
      'preference',
      createArtifactDraft({ family: 'memory', content: ['aisle'] }),
    )
    await expect(
      store.revise(
        memory,
        createArtifactDraft({ family: 'handoff', content: { summary: 'no' } }),
      ),
    ).rejects.toBeInstanceOf(ArtifactFamilyMismatchError)
    expect(await store.revisions('memory', 'preference')).toEqual([memory])
  })

  it('fails lookup of an unknown revision without inventing a head', async () => {
    const store = new FakeArtifactStore()
    await expect(store.latest('handoff', 'missing')).rejects.toBeInstanceOf(
      ArtifactNotFoundError,
    )
    expect(store.traces()).toEqual([])
  })

  it('snapshots revision content so external mutation cannot rewrite history', async () => {
    const content = { summary: 'v1', evidence: [{ id: 'source-1' }] }
    const store = new FakeArtifactStore()
    const draft = createArtifactDraft({ family: 'handoff', content })
    const created = await store.create('handoff-1', draft)

    content.summary = 'tampered'
    content.evidence[0]!.id = 'tampered'

    const storedContent = created.content as typeof content
    expect(storedContent).toEqual({
      summary: 'v1',
      evidence: [{ id: 'source-1' }],
    })
    expect(Object.isFrozen(storedContent)).toBe(true)
    expect(Object.isFrozen(storedContent.evidence)).toBe(true)
    expect(await store.latest('handoff', 'handoff-1')).toBe(created)
    expect(store.traces()).toHaveLength(1)
  })

  it('validates lineage refs when constructing drafts and artifacts', () => {
    expect(() =>
      createArtifactDraft({
        family: 'handoff',
        content: {},
        sources: [{ sourceType: '', sourceId: 'session-42' }],
      }),
    ).toThrow(InvalidSourceReferenceError)
    expect(() =>
      createArtifactDraft({
        family: 'handoff',
        content: {},
        artifacts: [{ family: 'memory', artifactId: 'id', revision: 0 }],
      }),
    ).toThrow(InvalidArtifactReferenceError)
  })

  it('implements ArtifactCatalog by dispatching through the stored artifact', async () => {
    const store = new FakeArtifactStore()
    const created = await store.create(
      'handoff-1',
      createArtifactDraft({ family: 'handoff', content: { summary: 'v1' } }),
    )
    expect(await store.get(created)).toEqual(created)
    expect(await store.latest(created)).toEqual(created)
    expect(await store.revisions(created)).toEqual([created])
  })

  it('keeps identities containing NUL distinct and protects trace snapshots', async () => {
    const separator = String.fromCharCode(0)
    const store = new FakeArtifactStore()
    await store.create(
      `b${separator}c`,
      createArtifactDraft({ family: 'a', content: { value: 1 } }),
    )
    await store.create(
      'c',
      createArtifactDraft({ family: `a${separator}b`, content: { value: 2 } }),
    )

    const traces = store.traces()
    expect(traces).toHaveLength(2)
    expect(traces[0]).not.toBe(traces[1])
    expect(Object.isFrozen(traces[0])).toBe(true)
    expect(await store.latest('a', `b${separator}c`)).toMatchObject({
      content: { value: 1 },
    })
    expect(await store.latest(`a${separator}b`, 'c')).toMatchObject({
      content: { value: 2 },
    })
  })
})

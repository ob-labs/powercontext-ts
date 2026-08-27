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
  InvalidArtifactReferenceError,
  InvalidSourceReferenceError,
  canonicalizeDomain,
  createArtifactRef,
  createSourceRef,
  normalizeRefs,
} from '../src/index.js'

describe('SourceRef and ArtifactRef', () => {
  it('constructs stable references and rejects empty, padded, or oversized identity', () => {
    const source = createSourceRef('conversation', 'session-42')
    expect(source).toEqual({ sourceType: 'conversation', sourceId: 'session-42' })
    expect(() => createSourceRef('', 'id')).toThrow(InvalidSourceReferenceError)
    expect(() => createSourceRef(' conversation', 'id')).toThrow(
      InvalidSourceReferenceError,
    )
    expect(() => createSourceRef('x'.repeat(129), 'id')).toThrow(
      InvalidSourceReferenceError,
    )
    expect(() => createSourceRef('conversation', 'x'.repeat(257))).toThrow(
      InvalidSourceReferenceError,
    )

    const artifact = createArtifactRef('memory', 'preference', 3)
    expect(artifact).toEqual({
      family: 'memory',
      artifactId: 'preference',
      revision: 3,
    })
    expect(() => createArtifactRef('', 'id', 1)).toThrow(InvalidArtifactReferenceError)
    expect(() => createArtifactRef('memory', ' artifact', 1)).toThrow(
      InvalidArtifactReferenceError,
    )
    expect(() => createArtifactRef('memory', 'x'.repeat(129), 1)).toThrow(
      InvalidArtifactReferenceError,
    )
    expect(() => createArtifactRef('memory', 'id', 0)).toThrow(
      InvalidArtifactReferenceError,
    )
    expect(() => createArtifactRef('memory', 'id', 1.5)).toThrow(
      InvalidArtifactReferenceError,
    )

    expect(createSourceRef('😀'.repeat(128), 'id').sourceType).toBe('😀'.repeat(128))
    expect(createArtifactRef('😀'.repeat(128), 'id', 1).family).toBe('😀'.repeat(128))
    expect(() => createSourceRef('😀'.repeat(129), 'id')).toThrow(
      InvalidSourceReferenceError,
    )
    expect(() => createArtifactRef('😀'.repeat(129), 'id', 1)).toThrow(
      InvalidArtifactReferenceError,
    )
  })

  it('NFC-normalizes, JCS-sorts, and exactly deduplicates refs without localeCompare', () => {
    const refs = normalizeRefs([
      { id: 'b' },
      { id: 'a' },
      { id: 'a' },
      { id: 'e\u0301' },
      { id: 'é' },
    ])
    expect(refs).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'é' }])
    expect(canonicalizeDomain({ refs })).toBe(
      canonicalizeDomain({ refs: [{ id: 'a' }, { id: 'b' }, { id: 'é' }] }),
    )
  })

  it('sorts ArtifactRef by canonical bytes, not insertion order', () => {
    const sorted = normalizeRefs([
      { artifact_id: 'z', revision: 2, family: 'memory' },
      { family: 'handoff', artifact_id: 'a', revision: 1 },
      { revision: 2, artifact_id: 'z', family: 'memory' },
    ])
    expect(sorted).toEqual([
      { artifact_id: 'a', family: 'handoff', revision: 1 },
      { artifact_id: 'z', family: 'memory', revision: 2 },
    ])
  })

  it('projects typed camelCase refs onto the Python wire shape before sorting', () => {
    const sorted = normalizeRefs([
      createArtifactRef('memory', 'z', 2),
      createSourceRef('conversation', 'session-42'),
    ])
    expect(sorted).toEqual([
      { artifact_id: 'z', family: 'memory', revision: 2 },
      { source_id: 'session-42', source_type: 'conversation' },
    ])
    expect(canonicalizeDomain(sorted)).toBe(
      '[{"artifact_id":"z","family":"memory","revision":2},{"source_id":"session-42","source_type":"conversation"}]',
    )
  })

  it('sorts by UTF-8 JCS bytes when UTF-16 order would reverse the pair', () => {
    const sorted = normalizeRefs([{ id: '\u{10000}' }, { id: '\uffff' }])
    expect(sorted).toEqual([{ id: '\uffff' }, { id: '\u{10000}' }])
  })
})

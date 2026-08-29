/**
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from 'vitest'
import { ANALYZER_ID, admitsFtsText, analyzeText, ftsMatchQuery } from '../src/index.js'

describe('Analyzer v1', () => {
  it('keeps ASCII underscores inside case-folded words', () => {
    expect(ANALYZER_ID).toBe('powercontext.analyzer.v1')
    expect(analyzeText('Hello_World')).toBe('hello_world')
    expect(analyzeText('Straße ẞ')).toBe('strasse ss')
    expect(analyzeText('µ ς ϵ Ꭰ ꭰ')).toBe('μ σ ε Ꭰ Ꭰ')
  })

  it('emits CJK unigrams followed by adjacent bigrams', () => {
    expect(analyzeText('中文')).toBe('u_4e2d u_6587 b_4e2d_6587')
  })

  it('preserves segment order when mixing Latin and CJK', () => {
    expect(analyzeText('Hello中文World')).toBe('hello u_4e2d u_6587 b_4e2d_6587 world')
  })

  it('normalizes canonically equivalent input before tokenization', () => {
    expect(analyzeText('CAFÉ')).toBe('café')
    expect(analyzeText('cafe\u0301')).toBe('café')
  })

  it('returns no query for punctuation-only input', () => {
    expect(analyzeText('... 😄')).toBe('')
    expect(ftsMatchQuery('... 😄')).toBeNull()
    expect(admitsFtsText('... 😄', 'anything')).toBe(false)
  })

  it('quotes analyzed terms for FTS MATCH', () => {
    expect(ftsMatchQuery('Hello 中文')).toBe(
      '"hello" OR "u_4e2d" OR "u_6587" OR "b_4e2d_6587"',
    )
  })

  it('uses one hit for short queries and the coverage gate for long queries', () => {
    expect(admitsFtsText('one two', 'zero two')).toBe(true)
    expect(admitsFtsText('one two three four', 'one only')).toBe(false)
    expect(admitsFtsText('one two three four', 'one and four')).toBe(true)
    expect(
      admitsFtsText('one two three four five six seven eight nine', 'one two'),
    ).toBe(false)
    expect(
      admitsFtsText('one two three four five six seven eight nine', 'one two nine'),
    ).toBe(true)
  })
})

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

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { canonicalizeStrict, JcsInputError } from './canonicalize-strict.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const corpusPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'jcs-reference-corpus.json',
)

interface ReferenceVector {
  readonly name: string
  readonly inputBase64: string
  readonly inputSha256: string
  readonly outputBase64: string
  readonly outputSha256: string
}

interface ReferenceCorpus {
  readonly schema: string
  readonly sourceRepository: string
  readonly sourceCommit: string
  readonly sourceLicense: string
  readonly vectors: readonly ReferenceVector[]
}

const referenceCorpus = JSON.parse(readFileSync(corpusPath, 'utf8')) as ReferenceCorpus

function sha256(value: Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function oraclePython(): string {
  const configured = process.env['POWERCONTEXT_ORACLE_PYTHON']
  if (configured !== undefined) {
    return configured
  }
  return process.platform === 'win32'
    ? join(root, 'conformance', 'runners', 'python', '.venv', 'Scripts', 'python.exe')
    : join(root, 'conformance', 'runners', 'python', '.venv', 'bin', 'python')
}

const vectors: ReadonlyArray<{ name: string; input: unknown; expected: string }> = [
  {
    name: 'RFC 8785 literals and numbers',
    input: {
      numbers: [333333333.3333333, 1e30, 4.5, 2e-3, 1e-27],
      literals: [null, true, false],
    },
    expected:
      '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27]}',
  },
  {
    name: 'RFC 8785 key order and unicode escape',
    input: {
      '\u20ac': 'Euro Symbol',
      '\r\n': 'Carriage Return New Line',
    },
    expected: '{"\\r\\n":"Carriage Return New Line","€":"Euro Symbol"}',
  },
  {
    name: 'negative zero becomes zero',
    input: { value: -0 },
    expected: '{"value":0}',
  },
  {
    name: 'subnormal and maximum finite doubles',
    input: { maximum: Number.MAX_VALUE, minimum: Number.MIN_VALUE },
    expected: '{"maximum":1.7976931348623157e+308,"minimum":5e-324}',
  },
  {
    name: 'UTF-16 property ordering',
    input: { '😀': 'astral', '€': 'euro', '1': 'digit', '\r': 'control' },
    expected: '{"\\r":"control","1":"digit","€":"euro","😀":"astral"}',
  },
  {
    name: 'control character escaping',
    input: { value: '\b\t\n\f\r"\\\u0001' },
    expected: '{"value":"\\b\\t\\n\\f\\r\\"\\\\\\u0001"}',
  },
]

const appendixBNumbers: ReadonlyArray<
  readonly [ieee754: string, expected: string | null]
> = [
  ['0000000000000000', '0'],
  ['8000000000000000', '0'],
  ['0000000000000001', '5e-324'],
  ['8000000000000001', '-5e-324'],
  ['7fefffffffffffff', '1.7976931348623157e+308'],
  ['ffefffffffffffff', '-1.7976931348623157e+308'],
  ['4340000000000000', '9007199254740992'],
  ['c340000000000000', '-9007199254740992'],
  ['4430000000000000', '295147905179352830000'],
  ['7fffffffffffffff', null],
  ['7ff0000000000000', null],
  ['44b52d02c7e14af5', '9.999999999999997e+22'],
  ['44b52d02c7e14af6', '1e+23'],
  ['44b52d02c7e14af7', '1.0000000000000001e+23'],
  ['444b1ae4d6e2ef4e', '999999999999999700000'],
  ['444b1ae4d6e2ef4f', '999999999999999900000'],
  ['444b1ae4d6e2ef50', '1e+21'],
  ['3eb0c6f7a0b5ed8c', '9.999999999999997e-7'],
  ['3eb0c6f7a0b5ed8d', '0.000001'],
  ['41b3de4355555553', '333333333.3333332'],
  ['41b3de4355555554', '333333333.33333325'],
  ['41b3de4355555555', '333333333.3333333'],
  ['41b3de4355555556', '333333333.3333334'],
  ['41b3de4355555557', '333333333.33333343'],
  ['becbf647612f3696', '-0.0000033333333333333333'],
  ['43143ff3c1cb0959', '1424953923781206.2'],
]

describe('JCS spike D', () => {
  it('does not treat JSON.stringify as JCS', () => {
    const value = { b: 1, a: 2 }
    expect(JSON.stringify(value)).toBe('{"b":1,"a":2}')
    expect(canonicalizeStrict(value)).toBe('{"a":2,"b":1}')
  })

  it.each(vectors)('matches official vector: $name', ({ input, expected }) => {
    expect(canonicalizeStrict(input)).toBe(expected)
  })

  it.each(referenceCorpus.vectors)(
    'matches the RFC-cited reference corpus byte-for-byte: $name',
    (vector) => {
      expect(referenceCorpus.schema).toBe('powercontext.jcs-reference-corpus.v1')
      expect(referenceCorpus.sourceCommit).toBe(
        '19d51d7fe467d4706a3ff08adf8a748f29fc21e0',
      )
      const input = Buffer.from(vector.inputBase64, 'base64')
      const expected = Buffer.from(vector.outputBase64, 'base64')
      expect(sha256(input)).toBe(vector.inputSha256)
      expect(sha256(expected)).toBe(vector.outputSha256)
      const actual = Buffer.from(
        canonicalizeStrict(JSON.parse(input.toString('utf8'))),
        'utf8',
      )
      expect(actual.toString('base64')).toBe(expected.toString('base64'))
    },
  )

  it.each(appendixBNumbers)(
    'matches the complete RFC 8785 Appendix B row: $0',
    (ieee754, expected) => {
      const value = Buffer.from(ieee754, 'hex').readDoubleBE(0)
      if (expected === null) {
        expect(() => canonicalizeStrict(value)).toThrow(JcsInputError)
        return
      }
      expect(canonicalizeStrict(value)).toBe(expected)
    },
  )

  it('rejects non-I-JSON values before calling the serialization library', () => {
    expect(() => canonicalizeStrict({ value: '\ud800' })).toThrow(JcsInputError)
    expect(() => canonicalizeStrict({ value: '\udc00' })).toThrow(JcsInputError)
    expect(() => canonicalizeStrict({ value: Number.NaN })).toThrow(JcsInputError)
    expect(() => canonicalizeStrict({ value: Number.POSITIVE_INFINITY })).toThrow(
      JcsInputError,
    )
    expect(() => canonicalizeStrict({ value: 1n })).toThrow(JcsInputError)
    expect(() => canonicalizeStrict(new Array(1))).toThrow(JcsInputError)
    expect(() => canonicalizeStrict({ [Symbol('hidden')]: true })).toThrow(
      JcsInputError,
    )
  })

  it('requires byte-for-byte agreement with the pinned Python rfc8785 oracle', () => {
    const script = join(dirname(fileURLToPath(import.meta.url)), 'compare.py')
    const python = oraclePython()
    expect(existsSync(python), `oracle interpreter missing: ${python}`).toBe(true)
    const result = spawnSync(python, [script], { encoding: 'utf8' })
    expect(result.status, result.stderr + result.stdout).toBe(0)
    const report = JSON.parse(result.stdout) as {
      matches: boolean
      loneSurrogateRejected: boolean
      sourceCommit: string
      pairs: Array<{ expected: string; python: string; typescript: string }>
    }
    expect(report.matches).toBe(true)
    expect(report.loneSurrogateRejected).toBe(true)
    expect(report.sourceCommit).toBe(referenceCorpus.sourceCommit)
    expect(report.pairs).toHaveLength(referenceCorpus.vectors.length)
  })
})

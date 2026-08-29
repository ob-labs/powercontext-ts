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

import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { admitsFtsText, analyzeText, ftsMatchQuery } from '../src/index.js'

const PINNED_COMMIT = '733e4bf6b378785e76274ff07632029c699ecb09'

interface AnalyzeCase {
  readonly operation: 'analyze_text' | 'fts_match_query'
  readonly value: string
}

interface AdmitsCase {
  readonly operation: 'admits_fts_text'
  readonly query: string
  readonly text: string
}

type OracleCase = AnalyzeCase | AdmitsCase

function pythonRoot(): string {
  const root = process.env['POWERCONTEXT_PYTHON_ROOT']
  if (root === undefined || root.length === 0) {
    throw new Error(
      'POWERCONTEXT_PYTHON_ROOT must point at the pinned powercontext checkout',
    )
  }
  if (!existsSync(join(root, 'pyproject.toml'))) {
    throw new Error(`Python oracle root has no pyproject.toml: ${root}`)
  }
  const project = readFileSync(join(root, 'pyproject.toml'), 'utf8')
  if (!/^name\s*=\s*["']powercontext["']/m.test(project)) {
    throw new Error(
      `Python oracle root is not the powercontext project (PowerMem is not allowed): ${root}`,
    )
  }
  const revision = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
  })
  if (revision.status !== 0 || revision.stdout.trim() !== PINNED_COMMIT) {
    throw new Error(
      `Python oracle root must be checked out at ${PINNED_COMMIT}; got ${revision.stdout.trim() || revision.stderr.trim()}`,
    )
  }
  return root
}

function pythonExecutable(root: string): string {
  const configured = process.env['POWERCONTEXT_PYTHON']
  if (configured !== undefined && configured.length > 0) {
    return configured
  }
  const virtualEnvironment = join(root, '.venv', 'bin', 'python')
  return existsSync(virtualEnvironment) ? virtualEnvironment : 'python3'
}

function runPythonOracle(
  root: string,
  cases: readonly OracleCase[],
): readonly unknown[] {
  const script = `
import json
import importlib.util
import sys

module_path = sys.argv[1] + "/src/powercontext/builtin/artifacts/search.py"
spec = importlib.util.spec_from_file_location("pinned_search", module_path)
if spec is None or spec.loader is None:
    raise RuntimeError("could not load pinned Analyzer module")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
admits_fts_text = module.admits_fts_text
analyze_text = module.analyze_text
fts_match_query = module.fts_match_query

cases = json.load(sys.stdin)
results = []
for case in cases:
    if case["operation"] == "analyze_text":
        results.append(analyze_text(case["value"]))
    elif case["operation"] == "fts_match_query":
        results.append(fts_match_query(case["value"]))
    else:
        results.append(admits_fts_text(case["query"], case["text"]))
json.dump(results, sys.stdout, ensure_ascii=False)
`
  const result = spawnSync(pythonExecutable(root), ['-c', script, root], {
    input: JSON.stringify(cases),
    encoding: 'utf8',
  })
  if (result.error !== undefined || result.status !== 0) {
    throw new Error(
      `Python Analyzer oracle failed: ${result.error?.message ?? result.stderr.trim()}`,
    )
  }
  return JSON.parse(result.stdout) as readonly unknown[]
}

const ANALYZE_CASES: readonly OracleCase[] = [
  { operation: 'analyze_text', value: 'Hello_World' },
  { operation: 'analyze_text', value: '中文' },
  { operation: 'analyze_text', value: 'Hello中文World' },
  { operation: 'analyze_text', value: 'CAFÉ' },
  { operation: 'analyze_text', value: 'cafe\u0301' },
  { operation: 'analyze_text', value: 'Straße ẞ' },
  { operation: 'analyze_text', value: '... 😄' },
  { operation: 'analyze_text', value: 'mixed 中文 and 日本語' },
  { operation: 'fts_match_query', value: 'Hello 中文' },
  { operation: 'fts_match_query', value: '... 😄' },
  { operation: 'admits_fts_text', query: 'one two', text: 'zero two' },
  { operation: 'admits_fts_text', query: 'one two three four', text: 'one only' },
  { operation: 'admits_fts_text', query: 'one two three four', text: 'one and four' },
  {
    operation: 'admits_fts_text',
    query: 'one two three four five six seven eight nine',
    text: 'one two',
  },
  {
    operation: 'admits_fts_text',
    query: 'one two three four five six seven eight nine',
    text: 'one two nine',
  },
]

function jsResult(testCase: OracleCase): unknown {
  if (testCase.operation === 'analyze_text') {
    return analyzeText(testCase.value)
  }
  if (testCase.operation === 'fts_match_query') {
    return ftsMatchQuery(testCase.value)
  }
  if (testCase.operation === 'admits_fts_text') {
    return admitsFtsText(testCase.query, testCase.text)
  }
  throw new Error(`unsupported Analyzer oracle operation: ${testCase.operation}`)
}

describe('Analyzer v1 pinned Python oracle', () => {
  it.skipIf(process.env['POWERCONTEXT_SKELETON_ORACLE'] !== '1')(
    'matches analyze_text, fts_match_query, and admits_fts_text',
    () => {
      const root = pythonRoot()
      const expected = runPythonOracle(root, ANALYZE_CASES)
      expect(ANALYZE_CASES.map(jsResult)).toEqual(expected)
    },
  )
})

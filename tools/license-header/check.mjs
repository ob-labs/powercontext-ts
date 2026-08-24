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

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('../..', import.meta.url)))
const EXTENSIONS = new Set(['.ts', '.mts', '.mjs', '.js', '.cjs', '.py'])
const SKIP_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  '.venv',
  '.python-pin',
  'pack-smoke-tmp',
  '.ruff_cache',
  'generated',
])
const MARKERS = [
  'Copyright (c) 2026 OceanBase.',
  'Licensed under the Apache License, Version 2.0',
]

function shouldSkipDirectory(name) {
  return SKIP_DIR_NAMES.has(name)
}

function collectFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      if (!shouldSkipDirectory(entry)) {
        collectFiles(fullPath, files)
      }
      continue
    }
    const dotted = entry.includes('.') ? entry.slice(entry.lastIndexOf('.')) : ''
    if (EXTENSIONS.has(dotted)) {
      files.push(fullPath)
    }
  }
  return files
}

function hasLicenseHeader(text) {
  return MARKERS.every((marker) => text.includes(marker))
}

function main() {
  const files = collectFiles(ROOT)
  const missing = files.filter((file) => !hasLicenseHeader(readFileSync(file, 'utf8')))
  if (missing.length > 0) {
    process.stderr.write('license header check failed:\n')
    for (const file of missing) {
      process.stderr.write(`  ${relative(ROOT, file)}\n`)
    }
    process.exitCode = 1
    return
  }
  process.stdout.write(`license header check passed (${String(files.length)} files)\n`)
}

main()

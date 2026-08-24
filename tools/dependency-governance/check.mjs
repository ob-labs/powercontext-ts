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

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const ALLOWED_LICENSES = new Set([
  'Apache-2.0',
  'MIT',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'CC0-1.0',
  'Python-2.0',
  'Unlicense',
  'BlueOak-1.0.0',
])
const ALLOWED_LICENSE_EXPRESSIONS = new Set([
  '(MIT OR CC0-1.0)',
  // sqlite-vec publishes this legacy permissive expression in npm metadata.
  // It is a root-only development probe and never enters a published package.
  'MIT OR Apache',
])
const NATIVE_FORBIDDEN_IN = new Set([
  '@powercontext/protocol',
  '@powercontext/client',
  '@powercontext/core',
])
const NATIVE_NAME_MARKERS = [
  'better-sqlite3',
  'sqlite3',
  'node-gyp',
  'prebuild-install',
]

function runPnpm(arguments_) {
  const command =
    process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm'
  const argumentsWithLauncher =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', 'pnpm', ...arguments_]
      : arguments_
  return execFileSync(command, argumentsWithLauncher, {
    cwd: ROOT,
    encoding: 'utf8',
  })
}

function workspacePackages() {
  const listing = JSON.parse(runPnpm(['list', '--recursive', '--json', '--depth', '0']))
  return listing
}

function dependencyLicenses() {
  return JSON.parse(runPnpm(['licenses', 'list', '--json']))
}

function assertAllowedDependencyLicenses() {
  const report = dependencyLicenses()
  const rejected = []
  let dependencyCount = 0
  for (const [license, packages] of Object.entries(report)) {
    if (!Array.isArray(packages)) {
      throw new Error(`pnpm returned an invalid license group for ${license}`)
    }
    dependencyCount += packages.length
    if (ALLOWED_LICENSES.has(license) || ALLOWED_LICENSE_EXPRESSIONS.has(license)) {
      continue
    }
    for (const item of packages) {
      const name = typeof item?.name === 'string' ? item.name : '<unknown>'
      const versions = Array.isArray(item?.versions)
        ? item.versions.join(',')
        : '<unknown>'
      rejected.push(`${name}@${versions}: ${license}`)
    }
  }
  if (rejected.length > 0) {
    throw new Error(`dependency licenses require review:\n${rejected.join('\n')}`)
  }
  return { dependencyCount, licenseCount: Object.keys(report).length }
}

function assertNoNativeInClientGraph() {
  for (const item of workspacePackages()) {
    if (!NATIVE_FORBIDDEN_IN.has(item.name)) {
      continue
    }
    const manifest = JSON.parse(readFileSync(join(item.path, 'package.json'), 'utf8'))
    const names = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.optionalDependencies ?? {}),
    ]
    const native = names.filter((name) =>
      NATIVE_NAME_MARKERS.some((marker) => name.includes(marker)),
    )
    if (native.length > 0) {
      throw new Error(
        `${item.name} must not depend on native packages: ${native.join(', ')}`,
      )
    }
  }
}

function main() {
  assertNoNativeInClientGraph()
  const licenseReport = assertAllowedDependencyLicenses()
  const lock = readFileSync(join(ROOT, 'pnpm-lock.yaml'), 'utf8')
  if (!lock.includes('lockfileVersion:')) {
    throw new Error('pnpm-lock.yaml is missing')
  }
  process.stdout.write(
    `dependency governance passed (${String(licenseReport.dependencyCount)} installed dependencies, ` +
      `${String(licenseReport.licenseCount)} approved license expressions)\n`,
  )
}

main()

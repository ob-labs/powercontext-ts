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
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { copyPackageLicenses } from './copy-license.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PACKAGES = [
  { name: '@powercontext/protocol', dir: 'protocol' },
  { name: '@powercontext/core', dir: 'core' },
  { name: '@powercontext/client', dir: 'client' },
  { name: '@powercontext/builtin', dir: 'builtin' },
  { name: '@powercontext/server', dir: 'server' },
  { name: '@powercontext/cli', dir: 'cli' },
  { name: '@powercontext/conformance-runner', dir: 'conformance-runner' },
]

function run(command, args, cwd) {
  const executable =
    process.platform === 'win32' && command === 'pnpm'
      ? (process.env.ComSpec ?? 'cmd.exe')
      : command
  const executableArguments =
    process.platform === 'win32' && command === 'pnpm'
      ? ['/d', '/s', '/c', 'pnpm', ...args]
      : args
  return execFileSync(executable, executableArguments, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

function packOne(dir) {
  const output = run(
    'pnpm',
    ['pack', '--pack-destination', ROOT],
    join(ROOT, 'packages', dir),
  )
  const fileName = output
    .split(/\r?\n/)
    .map((entry) => entry.trim().replaceAll('\\', '/'))
    .reverse()
    .find((entry) => entry.endsWith('.tgz'))
  if (fileName === undefined) {
    throw new Error(`pnpm pack produced no tarball for ${dir}`)
  }
  return join(ROOT, fileName.split('/').at(-1) ?? fileName)
}

function assertCuratedExports(dir, name) {
  const manifest = JSON.parse(
    readFileSync(join(ROOT, 'packages', dir, 'package.json'), 'utf8'),
  )
  const exported = manifest.exports?.['.']
  if (exported?.types === undefined || exported.import === undefined) {
    throw new Error(`${name} is missing curated exports`)
  }
  if (manifest.sideEffects !== false) {
    throw new Error(`${name} must declare sideEffects: false`)
  }
}

function assertNoNativeBinding(tarballPath) {
  const listing = run('tar', ['-tf', tarballPath], ROOT)
  if (listing.includes('.node') || listing.toLowerCase().includes('binding.gyp')) {
    throw new Error(`${tarballPath} unexpectedly contains a native binding`)
  }
}

function findNativeBuildFiles(directory, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      findNativeBuildFiles(path, found)
      continue
    }
    const name = entry.name.toLowerCase()
    if (name === 'binding.gyp' || name.endsWith('.node')) {
      found.push(path)
    }
  }
  return found
}

function importPackedGraph(tarballs) {
  const workspace = mkdtempSync(join(tmpdir(), 'powercontext-pack-'))
  const localTarballs = tarballs.map((item) => {
    const fileName = basename(item.tarball)
    const localPath = join(workspace, fileName)
    copyFileSync(item.tarball, localPath)
    return { ...item, localFile: fileName }
  })
  writeFileSync(
    join(workspace, 'package.json'),
    JSON.stringify({
      name: 'pack-smoke',
      private: true,
      type: 'module',
      pnpm: {
        overrides: Object.fromEntries(
          localTarballs.map((item) => [item.name, `file:./${item.localFile}`]),
        ),
      },
    }),
  )
  for (const item of localTarballs) {
    run('pnpm', ['add', `file:./${item.localFile}`], workspace)
  }
  for (const item of tarballs) {
    const probe = join(workspace, 'probe.mjs')
    writeFileSync(
      probe,
      `import * as mod from ${JSON.stringify(item.name)}\n` +
        `if (mod.PACKAGE_NAME !== ${JSON.stringify(item.name)}) {\n` +
        `  throw new Error('bad export')\n` +
        `}\n`,
    )
    run(process.execPath, [probe], workspace)
  }
  const typeProbe = join(workspace, 'protocol-types.ts')
  writeFileSync(
    typeProbe,
    `import type {\n` +
      `  OpenApiComponents, OpenApiOperations, OpenApiPaths,\n` +
      `  components, operations, paths,\n` +
      `} from '@powercontext/protocol'\n` +
      `declare const pathsValue: paths\n` +
      `declare const componentsValue: components\n` +
      `declare const operationsValue: operations\n` +
      `const pathsAlias: OpenApiPaths = pathsValue\n` +
      `const componentsAlias: OpenApiComponents = componentsValue\n` +
      `const operationsAlias: OpenApiOperations = operationsValue\n` +
      `const health: components['schemas']['HealthResponse'] = { status: 'alive' }\n` +
      `void [pathsAlias, componentsAlias, operationsAlias, health]\n`,
  )
  run(
    'pnpm',
    [
      'exec',
      'tsc',
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      typeProbe,
    ],
    ROOT,
  )
  rmSync(workspace, { recursive: true, force: true })
}

function assertPureClientInstall(tarballs) {
  const selected = tarballs.filter(
    (item) =>
      item.name === '@powercontext/protocol' || item.name === '@powercontext/client',
  )
  const workspace = mkdtempSync(join(tmpdir(), 'powercontext-pure-pack-'))
  try {
    const localTarballs = selected.map((item) => {
      const fileName = basename(item.tarball)
      copyFileSync(item.tarball, join(workspace, fileName))
      return { ...item, localFile: fileName }
    })
    writeFileSync(
      join(workspace, 'package.json'),
      JSON.stringify({
        name: 'pure-client-pack-smoke',
        private: true,
        type: 'module',
        pnpm: {
          overrides: Object.fromEntries(
            localTarballs.map((item) => [item.name, `file:./${item.localFile}`]),
          ),
        },
      }),
    )
    let installOutput = ''
    for (const item of localTarballs) {
      installOutput += run(
        'pnpm',
        ['add', '--reporter', 'append-only', `file:./${item.localFile}`],
        workspace,
      )
    }
    const packageStore = readdirSync(join(workspace, 'node_modules', '.pnpm')).join(
      '\n',
    )
    const lockfile = readFileSync(join(workspace, 'pnpm-lock.yaml'), 'utf8')
    const installEvidence =
      `${installOutput}\n${packageStore}\n${lockfile}`.toLowerCase()
    const forbidden = [
      'better-sqlite3',
      'sqlite-vec',
      'node-gyp',
      'prebuild-install',
    ].filter((marker) => installEvidence.includes(marker))
    const nativeFiles = findNativeBuildFiles(join(workspace, 'node_modules'))
    if (forbidden.length > 0 || nativeFiles.length > 0) {
      throw new Error(
        `Protocol/Client-only install contains native build evidence: ` +
          `${[...forbidden, ...nativeFiles].join(', ')}`,
      )
    }
    for (const item of localTarballs) {
      const probe = join(workspace, `probe-${item.dir}.mjs`)
      writeFileSync(
        probe,
        `import * as mod from ${JSON.stringify(item.name)}\n` +
          `if (mod.PACKAGE_NAME !== ${JSON.stringify(item.name)}) throw new Error('bad export')\n`,
      )
      run(process.execPath, [probe], workspace)
    }
  } finally {
    rmSync(workspace, { recursive: true, force: true })
  }
}

function main() {
  copyPackageLicenses()
  const tarballs = []
  try {
    for (const item of PACKAGES) {
      assertCuratedExports(item.dir, item.name)
      const tarball = packOne(item.dir)
      assertNoNativeBinding(tarball)
      tarballs.push({ ...item, tarball })
    }
    importPackedGraph(tarballs)
    assertPureClientInstall(tarballs)
    process.stdout.write(
      `pack smoke passed (${String(tarballs.length)} tarballs; Protocol/Client-only install has no native build markers)\n`,
    )
  } finally {
    for (const item of tarballs) {
      rmSync(item.tarball, { force: true })
    }
  }
}

if (
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  main()
}

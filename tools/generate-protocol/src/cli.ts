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

import { loadOpenApi } from './load-openapi.js'
import { parseOperations } from './operations.js'
import { OPENAPI_PATH } from './paths.js'
import {
  artifactsMatch,
  buildArtifacts,
  readCurrentArtifacts,
  writeArtifacts,
} from './emit.js'

async function main(): Promise<void> {
  const check = process.argv.includes('--check')
  const loaded = loadOpenApi(OPENAPI_PATH)
  const operations = parseOperations(loaded.document)
  if (operations.length !== 52) {
    throw new Error(`expected 52 operations, parsed ${String(operations.length)}`)
  }
  const artifacts = await buildArtifacts(
    loaded.document,
    operations,
    OPENAPI_PATH,
    loaded.digest,
  )
  if (check) {
    const current = readCurrentArtifacts()
    const drifted = artifactsMatch(artifacts, current)
    if (drifted.length > 0) {
      throw new Error(
        `generated protocol assets drifted (${drifted.join(', ')}); run pnpm generate`,
      )
    }
    process.stdout.write(
      `generated protocol assets are current (${String(operations.length)} operations)\n`,
    )
    return
  }
  writeArtifacts(artifacts)
  process.stdout.write(
    `wrote protocol artifacts for ${String(operations.length)} operations\n`,
  )
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})

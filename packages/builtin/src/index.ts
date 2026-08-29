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

export const PACKAGE_NAME = '@powercontext/builtin' as const
export const PACKAGE_VERSION = '0.0.0' as const
export const PACKAGE_ROLE = 'builtin' as const
export const PACKAGE_PROFILE = 'sqlite-fts' as const
export const SHARED_DATABASE_WRITES_ALLOWED = false

export { ExperimentalRuntime, openExperimentalRuntime } from './runtime.js'
export {
  packPreparedContext,
  PREPARED_CONTEXT_DEFAULT_MAX_BYTES,
  PREPARED_CONTEXT_MAX_MAX_BYTES,
  PREPARED_CONTEXT_MIN_MAX_BYTES,
  PREPARED_CONTEXT_SCHEMA,
  type PreparedContext,
} from './persistence/context-packer.js'
export {
  SQLiteContentSourceStore,
  type CaptureContentInput,
  type CapturedContent,
} from './persistence/content-source-store.js'
export { SQLiteArtifactStore } from './persistence/artifact-store.js'
export {
  SQLiteMemoryStore,
  type MemoryEntry,
  type MemorySearchInput,
  type RememberInput,
} from './persistence/memory-store.js'
export {
  EXPERIMENTAL_DATABASE_STAMP,
  EXPERIMENTAL_SCHEMA_KIND,
  SchemaGateError,
  experimentalSchemaDdl,
  inspectSchemaGate,
  type SchemaGateKind,
} from './persistence/schema-gate.js'
export { SQLiteSession, openSQLiteSession } from './persistence/sqlite-session.js'
export { SQLiteSourceStore } from './persistence/source-store.js'

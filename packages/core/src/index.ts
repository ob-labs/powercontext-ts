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

export {
  PACKAGE_NAME,
  PACKAGE_PROFILE,
  PACKAGE_ROLE,
  PACKAGE_VERSION,
} from './package-info.js'
export {
  ArtifactError,
  ArtifactFamilyMismatchError,
  ArtifactNotFoundError,
  CanonicalizationError,
  InternalError,
  InvalidArtifactReferenceError,
  InvalidSourceAdapterError,
  InvalidSourceEntryError,
  InvalidSourceReferenceError,
  InvalidSourceResultError,
  LifecycleError,
  PowerContextError,
  RevisionConflictError,
  SourceAdapterNotFoundError,
  SourceConflictError,
  SourceError,
  SourceNotFoundError,
  UnavailableError,
  ValidationError,
} from './errors.js'
export {
  MAX_ARTIFACT_FAMILY_LENGTH,
  MAX_ARTIFACT_ID_LENGTH,
  MAX_BINDING_NAME_LENGTH,
  MAX_SCOPE_ID_LENGTH,
  MAX_SOURCE_ID_LENGTH,
  MAX_SOURCE_TYPE_LENGTH,
  MEMORY_CHANGE_REASON_MAX_CODE_POINTS,
  MEMORY_ENTRY_TEXT_MAX_BYTES,
} from './limits.js'
export {
  JS_MAX_SAFE_INTEGER,
  JS_MIN_SAFE_INTEGER,
  SafeIntegerError,
  assertSafeInteger,
  bigintToSafeInteger,
  findUnsafeIntegerTokens,
  isSafeInteger,
} from './integers.js'
export { canonicalizeJson, canonicalizeJsonBytes } from './canonical/jcs.js'
export {
  ANALYZER_ID,
  admitsFtsText,
  analyzeText,
  ftsMatchQuery,
} from './canonical/analyzer.js'
export {
  canonicalizeDomain,
  canonicalizeDomainBytes,
  normalizeUnicode,
} from './canonical/nfc.js'
export type { JsonValue } from './canonical/nfc.js'
export {
  EMBEDDING_CONTENT_HASH_DOMAIN,
  ENTRY_CONTENT_HASH_DOMAIN,
  domainSeparatedHash,
  hashDomain,
  sha256Canonical,
  sha256DigestLabel,
} from './canonical/hash.js'
export { assertUtf8Budget, codePointLength, utf8ByteLength } from './canonical/utf8.js'
export {
  materializeCanonicalInput,
  parseDomainIntegerToken,
} from './canonical/input.js'
export type { CanonicalInputMode } from './canonical/input.js'
export { normalizeRefs } from './canonical/refs.js'
export {
  createFrozenClock,
  createSequenceIdFactory,
  createSystemClock,
} from './time.js'
export type { Clock, IdFactory } from './time.js'
export {
  createSource,
  createSourceRef,
  sourceRefJson,
  sourcesEqual,
} from './sources/models.js'
export type { Source, SourceMaterialization, SourceRef } from './sources/models.js'
export { SourceCatalog, createSourceAdapter } from './sources/catalog.js'
export type {
  SourceAdapter,
  SourceCatalogBackend,
  SourceStore,
} from './sources/catalog.js'
export { FakeSourceStore } from './sources/fake-store.js'
export type { SourceStoreTrace } from './sources/fake-store.js'
export {
  artifactRefJson,
  createArtifact,
  createArtifactDraft,
  createArtifactRef,
} from './artifacts/models.js'
export type {
  Artifact,
  ArtifactCatalog,
  ArtifactDraft,
  ArtifactLineage,
  ArtifactRef,
  ArtifactStore,
} from './artifacts/models.js'
export { FakeArtifactStore } from './artifacts/fake-store.js'
export type { ArtifactStoreTrace } from './artifacts/fake-store.js'
export { activateTrigger } from './triggers.js'
export type { PolicyTransition, Trigger } from './triggers.js'
export { PowerContext } from './context.js'

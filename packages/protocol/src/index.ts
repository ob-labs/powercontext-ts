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

export {
  PACKAGE_NAME,
  PACKAGE_PROFILE,
  PACKAGE_ROLE,
  PACKAGE_VERSION,
} from './package-info.js'
export {
  JS_MAX_SAFE_INTEGER,
  JS_MIN_SAFE_INTEGER,
  SafeIntegerError,
  assertSafeInteger,
  bigintToSafeInteger,
  findUnsafeIntegerTokens,
  isSafeInteger,
} from './integers.js'
export type {
  HttpMethod,
  OperationMetadata,
  RequestLocation,
} from './generated/operations.js'
export {
  GENERATED_MANIFEST,
  OPERATION_METADATA,
  listOperationIds,
} from './generated/operations.js'
export type {
  $defs,
  components,
  operations,
  paths,
  webhooks,
  $defs as OpenApiDefinitions,
  components as OpenApiComponents,
  operations as OpenApiOperations,
  paths as OpenApiPaths,
  webhooks as OpenApiWebhooks,
} from './generated/openapi-types.js'
export { compileComponentValidator, validateWireValue } from './generated/validators.js'
export type {
  MediaContract,
  MediaKind,
  OperationContract,
  RequestContract,
} from './generated/operation-contracts.js'
export {
  getOperationContract,
  listOperationContracts,
  validateOperationError,
  validateOperationRequest,
  validateOperationSuccess,
} from './operation-validation.js'
export { validateWireJson } from './wire-json.js'

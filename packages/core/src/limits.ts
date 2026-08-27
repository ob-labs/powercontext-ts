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

/** Shared identity limits that remain safe for utf8mb4 relational indexes. */
export const MAX_SCOPE_ID_LENGTH = 256
export const MAX_SOURCE_ID_LENGTH = 256
export const MAX_SOURCE_TYPE_LENGTH = 128
export const MAX_ARTIFACT_FAMILY_LENGTH = 128
export const MAX_ARTIFACT_ID_LENGTH = 128
export const MAX_BINDING_NAME_LENGTH = 128
export const MEMORY_ENTRY_TEXT_MAX_BYTES = 8192
export const MEMORY_CHANGE_REASON_MAX_CODE_POINTS = 512

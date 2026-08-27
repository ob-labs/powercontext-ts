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

import { createHash } from 'node:crypto'

export const ENTRY_CONTENT_HASH_DOMAIN = Buffer.from('powercontext:entry-content:v1\0')
export const EMBEDDING_CONTENT_HASH_DOMAIN = Buffer.from(
  'powercontext:embedding-content:v1\0',
)

export function sha256Canonical(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

export function domainSeparatedHash(domain: Uint8Array, bytes: Uint8Array): string {
  return createHash('sha256').update(domain).update(bytes).digest('hex')
}

export function sha256DigestLabel(bytes: Uint8Array): string {
  return `sha256:${sha256Canonical(bytes)}`
}

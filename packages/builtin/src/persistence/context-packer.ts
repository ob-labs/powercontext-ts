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

import { ValidationError, utf8ByteLength } from '@powercontext/core'
import type { MemoryEntry } from './memory-store.js'

export const PREPARED_CONTEXT_SCHEMA = 'powercontext.prepared-context.v1' as const
export const PREPARED_CONTEXT_DEFAULT_MAX_BYTES = 8000
export const PREPARED_CONTEXT_MIN_MAX_BYTES = 512
export const PREPARED_CONTEXT_MAX_MAX_BYTES = 32768

export interface PreparedContext {
  readonly schema: typeof PREPARED_CONTEXT_SCHEMA
  readonly status: 'ready' | 'empty'
  readonly content: string | null
  readonly content_bytes: number
}

export function packPreparedContext(
  entries: readonly MemoryEntry[],
  maxBytes = PREPARED_CONTEXT_DEFAULT_MAX_BYTES,
): PreparedContext {
  if (
    !Number.isSafeInteger(maxBytes) ||
    maxBytes < PREPARED_CONTEXT_MIN_MAX_BYTES ||
    maxBytes > PREPARED_CONTEXT_MAX_MAX_BYTES
  ) {
    throw new ValidationError(
      `max_bytes must be an integer from ${String(PREPARED_CONTEXT_MIN_MAX_BYTES)} to ${String(PREPARED_CONTEXT_MAX_MAX_BYTES)}`,
    )
  }

  const included: string[] = []
  let content = ''
  for (const entry of entries) {
    const candidate = content === '' ? entry.text : `${content}\n${entry.text}`
    if (utf8ByteLength(candidate) > maxBytes) {
      continue
    }
    included.push(entry.text)
    content = candidate
  }

  if (included.length === 0) {
    return {
      schema: PREPARED_CONTEXT_SCHEMA,
      status: 'empty',
      content: null,
      content_bytes: 0,
    }
  }
  return {
    schema: PREPARED_CONTEXT_SCHEMA,
    status: 'ready',
    content,
    content_bytes: utf8ByteLength(content),
  }
}

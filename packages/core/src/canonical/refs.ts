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

import { artifactRefJson, createArtifactRef } from '../artifacts/models.js'
import { createSourceRef, sourceRefJson } from '../sources/models.js'
import { canonicalizeJson } from './jcs.js'
import { normalizeUnicode, type JsonValue } from './nfc.js'

const encoder = new TextEncoder()

function compareUtf8(left: string, right: string): number {
  const leftBytes = encoder.encode(left)
  const rightBytes = encoder.encode(right)
  const limit = Math.min(leftBytes.length, rightBytes.length)
  for (let index = 0; index < limit; index += 1) {
    const delta = (leftBytes[index] ?? 0) - (rightBytes[index] ?? 0)
    if (delta !== 0) {
      return delta
    }
  }
  return leftBytes.length - rightBytes.length
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function projectTypedRef(value: unknown): unknown {
  if (!isRecord(value)) {
    return value
  }
  const sourceType = asString(value['sourceType'] ?? value['source_type'])
  const sourceId = asString(value['sourceId'] ?? value['source_id'])
  if (sourceType !== undefined && sourceId !== undefined) {
    return sourceRefJson(createSourceRef(sourceType, sourceId))
  }
  const family = asString(value['family'])
  const artifactId = asString(value['artifactId'] ?? value['artifact_id'])
  const revision = value['revision']
  if (family !== undefined && artifactId !== undefined && typeof revision === 'number') {
    return artifactRefJson(createArtifactRef(family, artifactId, revision))
  }
  return value
}

/** NFC-normalize, JCS-encode, exact-dedupe, then sort by UTF-8 canonical bytes. */
export function normalizeRefs(values: readonly unknown[]): JsonValue[] {
  const byBytes = new Map<string, JsonValue>()
  for (const value of values) {
    const projected = projectTypedRef(value)
    const normalized = normalizeUnicode(projected)
    const encoded = canonicalizeJson(normalized)
    if (!byBytes.has(encoded)) {
      byBytes.set(encoded, JSON.parse(encoded) as JsonValue)
    }
  }
  return [...byBytes.entries()]
    .sort((left, right) => compareUtf8(left[0], right[0]))
    .map((entry) => entry[1])
}

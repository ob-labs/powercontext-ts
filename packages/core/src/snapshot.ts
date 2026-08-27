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

import { ValidationError } from './errors.js'

function freezeSnapshot(value: unknown, path: string, seen: WeakSet<object>): void {
  if (value === null || typeof value !== 'object') {
    return
  }
  if (seen.has(value)) {
    return
  }
  seen.add(value)
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      freezeSnapshot(value[index], `${path}[${String(index)}]`, seen)
    }
    Object.freeze(value)
    return
  }
  const prototype = Object.getPrototypeOf(value) as object | null
  if (prototype !== Object.prototype && prototype !== null) {
    throw new ValidationError(`${path} must contain only plain objects and arrays`)
  }
  for (const [key, item] of Object.entries(value)) {
    freezeSnapshot(item, `${path}.${key}`, seen)
  }
  Object.freeze(value)
}

/** Clone and deeply freeze one in-memory revision value. */
export function immutableSnapshot<T>(value: T, path: string): T {
  let snapshot: T
  try {
    snapshot = structuredClone(value)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new ValidationError(`${path} must be structured-cloneable: ${detail}`)
  }
  freezeSnapshot(snapshot, path, new WeakSet())
  return snapshot
}

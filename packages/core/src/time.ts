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

export interface Clock {
  nowIso(): string
}

export interface IdFactory {
  next(kind: string): string
}

export function createFrozenClock(iso: string): Clock {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(iso)) {
    throw new ValidationError('clock values must be UTC ISO-8601 strings')
  }
  return {
    nowIso() {
      return iso
    },
  }
}

export function createSystemClock(): Clock {
  return {
    nowIso() {
      return new Date()
        .toISOString()
        .replace(/Z$/, '000Z')
        .replace(/\.(\d{3})000Z$/, '.$1000Z')
    },
  }
}

export function createSequenceIdFactory(prefix = 'id'): IdFactory {
  if (!/^[A-Za-z0-9_-]+$/.test(prefix) || prefix.length > 32) {
    throw new ValidationError('id factory prefix must be short ASCII')
  }
  let sequence = 0
  return {
    next(kind: string) {
      if (!/^[A-Za-z0-9_-]+$/.test(kind) || kind.length > 32) {
        throw new ValidationError('id kind must be short ASCII')
      }
      sequence += 1
      return `${prefix}-${kind}-${String(sequence).padStart(4, '0')}`
    },
  }
}

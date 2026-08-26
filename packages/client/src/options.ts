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

import {
  CLIENT_USER_AGENT,
  DEFAULT_TIMEOUT_MS,
  MAX_RESPONSE_BYTES,
} from './constants.js'
import { ClientError } from './errors.js'
import { resolveAuthorization } from './headers.js'
import type { ClientOptions, ResolvedClientOptions } from './types.js'
import { normalizeBaseUrl } from './url.js'

function resolveTimeout(timeoutMs: number | undefined): number {
  const value = timeoutMs ?? DEFAULT_TIMEOUT_MS
  if (!Number.isInteger(value) || value <= 0) {
    throw new ClientError('timeoutMs must be a positive integer')
  }
  return value
}

function resolveMaxBytes(maxBytes: number | undefined): number {
  const value = maxBytes ?? MAX_RESPONSE_BYTES
  if (!Number.isInteger(value) || value <= 0) {
    throw new ClientError('maxResponseBytes must be a positive integer')
  }
  return value
}

export function resolveClientOptions(options: ClientOptions): ResolvedClientOptions {
  return {
    baseUrl: normalizeBaseUrl(options.baseUrl),
    authorization: resolveAuthorization(options),
    timeoutMs: resolveTimeout(options.timeoutMs),
    fetch: options.fetch ?? fetch,
    maxResponseBytes: resolveMaxBytes(options.maxResponseBytes),
    userAgent: options.userAgent ?? CLIENT_USER_AGENT,
    tracer: options.tracer,
  }
}

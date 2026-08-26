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

import type { ClientOptions } from './types.js'

export function resolveAuthorization(options: ClientOptions): string | undefined {
  if (options.authorization !== undefined) {
    return options.authorization
  }
  if (options.token !== undefined) {
    return `Bearer ${options.token}`
  }
  return undefined
}

export function buildRequestHeaders(input: {
  accept: string
  userAgent: string
  authorization?: string | undefined
  contentType?: string | undefined
  extra?: Readonly<Record<string, string>> | undefined
}): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: input.accept,
    'User-Agent': input.userAgent,
  }
  if (input.authorization !== undefined) {
    headers['Authorization'] = input.authorization
  }
  if (input.contentType !== undefined) {
    headers['Content-Type'] = input.contentType
  }
  if (input.extra !== undefined) {
    Object.assign(headers, input.extra)
  }
  return headers
}

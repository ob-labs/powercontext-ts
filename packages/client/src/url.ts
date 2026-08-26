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

import { ClientError } from './errors.js'

export function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim()
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new ClientError('base URL must be an absolute http(s) URL')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ClientError('base URL must use http or https')
  }
  if (parsed.username !== '' || parsed.password !== '') {
    throw new ClientError('base URL must not include credentials')
  }
  if (parsed.hash !== '') {
    throw new ClientError('base URL must not include a fragment')
  }
  if (parsed.search !== '') {
    throw new ClientError('base URL must not include a query string')
  }
  const path = parsed.pathname.replace(/\/+$/u, '')
  return `${parsed.origin}${path}`
}

export function queryString(payload: Record<string, unknown> | undefined): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(payload ?? {})) {
    if (value === undefined || value === null) {
      continue
    }
    params.set(key, String(value))
  }
  const encoded = params.toString()
  return encoded === '' ? '' : `?${encoded}`
}

export function buildRequestUrl(
  baseUrl: string,
  path: string,
  location: 'body' | 'query' | null,
  payload: Record<string, unknown> | undefined,
): string {
  const suffix = location === 'query' ? queryString(payload) : ''
  return `${baseUrl}${path}${suffix}`
}

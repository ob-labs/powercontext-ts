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

import { describe, expect, it } from 'vitest'
import Fastify from 'fastify'
import { JS_MAX_SAFE_INTEGER } from '../../../packages/protocol/src/integers.js'
import { oas3ToJsonSchema } from '../src/oas3.js'

describe('OpenAPI 3.0 to JSON Schema conversion', () => {
  it('rewrites nullable into an explicit anyOf null branch', () => {
    expect(oas3ToJsonSchema({ type: 'string', nullable: true, minLength: 1 })).toEqual({
      anyOf: [{ type: 'string', minLength: 1 }, { type: 'null' }],
    })
  })

  it('converts OAS3 boolean exclusiveMinimum into JSON Schema numeric form', () => {
    expect(
      oas3ToJsonSchema({ type: 'number', minimum: 0, exclusiveMinimum: true }),
    ).toEqual({ type: 'number', exclusiveMinimum: 0 })
  })

  it('applies the ADR 0001 safe-integer overlay when bounds are omitted', () => {
    expect(oas3ToJsonSchema({ type: 'integer' })).toEqual({
      type: 'integer',
      minimum: -9007199254740991,
      maximum: JS_MAX_SAFE_INTEGER,
    })
  })

  it('keeps a narrower declared integer maximum', () => {
    expect(oas3ToJsonSchema({ type: 'integer', minimum: 1, maximum: 8 })).toEqual({
      type: 'integer',
      minimum: 1,
      maximum: 8,
    })
  })

  it('recurses through allOf, oneOf and object properties', () => {
    const converted = oas3ToJsonSchema({
      allOf: [
        { type: 'object', properties: { name: { type: 'string', nullable: true } } },
        { oneOf: [{ type: 'object', properties: { kind: { type: 'string' } } }] },
      ],
    })
    expect(converted).toEqual({
      allOf: [
        {
          type: 'object',
          properties: {
            name: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          },
        },
        {
          oneOf: [{ type: 'object', properties: { kind: { type: 'string' } } }],
        },
      ],
    })
  })

  it('preserves default without applying it at conversion time', () => {
    expect(oas3ToJsonSchema({ type: 'boolean', default: false })).toEqual({
      type: 'boolean',
      default: false,
    })
  })

  it('serializes converted nullable/union responses deterministically through Fastify', async () => {
    const responseSchema = oas3ToJsonSchema({
      type: 'object',
      additionalProperties: false,
      required: ['status', 'value'],
      properties: {
        status: { type: 'string', enum: ['ok'] },
        value: { oneOf: [{ type: 'string' }, { type: 'integer' }], nullable: true },
        defaulted: { type: 'boolean', default: false },
      },
    })
    const app = Fastify()
    app.get('/probe', { schema: { response: { 200: responseSchema } } }, async () => ({
      status: 'ok',
      value: null,
      extra: 'must-not-leak',
    }))
    try {
      const response = await app.inject({ method: 'GET', url: '/probe' })
      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('application/json')
      expect(response.body).toBe('{"status":"ok","value":null,"defaulted":false}')
    } finally {
      await app.close()
    }
  })

  it('fails response serialization when a converted required field is missing', async () => {
    const responseSchema = oas3ToJsonSchema({
      type: 'object',
      additionalProperties: false,
      required: ['status'],
      properties: { status: { type: 'string' } },
    })
    const app = Fastify()
    app.get(
      '/probe',
      { schema: { response: { 200: responseSchema } } },
      async () => ({}),
    )
    try {
      const response = await app.inject({ method: 'GET', url: '/probe' })
      expect(response.statusCode).toBe(500)
    } finally {
      await app.close()
    }
  })
})

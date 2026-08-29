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

import { randomUUID } from 'node:crypto'
import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify'
import {
  ArtifactNotFoundError,
  SourceConflictError,
  SourceNotFoundError,
  UnavailableError,
  ValidationError,
} from '@powercontext/core'
import {
  OPERATION_METADATA,
  validateOperationError,
  validateOperationRequest,
  validateOperationSuccess,
  validateWireValue,
} from '@powercontext/protocol'
import {
  openExperimentalRuntime,
  type ExperimentalRuntime,
  type MemoryEntry,
} from '@powercontext/builtin'

export const PACKAGE_NAME = '@powercontext/server' as const
export const PACKAGE_VERSION = '0.0.0' as const
export const PACKAGE_ROLE = 'server' as const
export const PACKAGE_PROFILE = 'sqlite-fts' as const
export const EXPERIMENTAL_SUBSET = true

const JSON_CONTENT_TYPE = 'application/json'
const REQUEST_ID_HEADER = 'X-PowerContext-Request-ID'

export interface ExperimentalServerOptions {
  readonly dbPath: string
}

export interface ExperimentalListenOptions extends ExperimentalServerOptions {
  readonly host?: string
  readonly port: number
}

export interface ExperimentalHttpServer {
  readonly app: FastifyInstance
  readonly runtime: ExperimentalRuntime | undefined
  ready(): Promise<void>
  listen(): Promise<string>
  close(): Promise<void>
}

type JsonHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>

type ErrorBody = {
  readonly error: {
    readonly code: string
    readonly message: string
    readonly details: Record<string, unknown> | null
  }
}

function errorBody(
  code: string,
  message: string,
  details: Record<string, unknown> | null = null,
): ErrorBody {
  return { error: { code, message, details } }
}

function assertRequest(operationId: string, body: unknown): void {
  const result = validateOperationRequest(operationId, body)
  if (!result.valid) {
    throw new ValidationError(validationMessages(result.errors) || 'invalid request')
  }
}

function validationMessages(errors: unknown): string {
  if (!Array.isArray(errors)) {
    return ''
  }
  return errors
    .map((error: unknown) => {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message)
      }
      return String(error)
    })
    .join('; ')
}

function sendSuccess(
  operationId: string,
  status: number,
  value: unknown,
  reply: FastifyReply,
): FastifyReply {
  const result = validateOperationSuccess(operationId, status, JSON_CONTENT_TYPE, value)
  if (!result.valid) {
    throw new Error(
      `${operationId} produced an invalid success response: ${validationMessages(result.errors)}`,
    )
  }
  return reply.code(status).type(JSON_CONTENT_TYPE).send(value)
}

function sendError(
  operationId: string,
  status: number,
  value: ErrorBody,
  reply: FastifyReply,
): FastifyReply {
  const result = validateOperationError(operationId, status, value)
  if (!result.valid) {
    throw new Error(
      `${operationId} produced an invalid error response: ${validationMessages(result.errors)}`,
    )
  }
  return reply.code(status).type(JSON_CONTENT_TYPE).send(value)
}

function sendReadinessFailure(
  value: { readonly status: 'not_ready'; readonly checks: Record<string, string> },
  reply: FastifyReply,
): FastifyReply {
  const result = validateOperationError('get_readiness', 503, value)
  if (!result.valid) {
    throw new Error(
      `get_readiness produced an invalid error response: ${validationMessages(result.errors)}`,
    )
  }
  return reply.code(503).type(JSON_CONTENT_TYPE).send(value)
}

function sendUnknownError(reply: FastifyReply): FastifyReply {
  const value = errorBody(
    'unavailable',
    'route is not registered by the experimental subset',
  )
  const result = validateWireValue('ErrorResponse', value)
  if (!result.valid) {
    throw new Error('server produced an invalid not-found response')
  }
  return reply.code(404).type(JSON_CONTENT_TYPE).send(value)
}

function artifactReference(entry: MemoryEntry): Record<string, unknown> {
  return {
    family: entry.artifact.family,
    artifact_id: entry.artifact.artifactId,
    revision: entry.artifact.revision,
  }
}

function wireEntry(entry: MemoryEntry): Record<string, unknown> {
  const memoryRef = artifactReference(entry)
  return {
    citation: {
      memory_ref: memoryRef,
      entry_id: entry.entry_id,
      entry_version_id: entry.entry_id,
    },
    version: 1,
    kind: entry.kind,
    text: entry.text,
    state: 'active',
    source_refs: entry.source_refs.map((ref) => ({
      name: ref.source_type,
      source_id: ref.source_id,
    })),
    artifact_refs: entry.artifact_refs,
  }
}

function registerJsonRoute(
  app: FastifyInstance,
  operationId: string,
  handler: JsonHandler,
): void {
  const metadata = OPERATION_METADATA[operationId as keyof typeof OPERATION_METADATA]
  if (metadata === undefined) {
    throw new Error(`unknown route operation: ${operationId}`)
  }
  const routeHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<unknown> => {
    try {
      assertRequest(operationId, request.body)
      return await handler(request, reply)
    } catch (error) {
      return handleError(operationId, error, reply)
    }
  }
  if (metadata.method === 'GET') {
    app.get(metadata.path, routeHandler)
  } else {
    app.post(metadata.path, routeHandler)
  }
}

function handleError(
  operationId: string,
  error: unknown,
  reply: FastifyReply,
): FastifyReply {
  if (error instanceof ValidationError) {
    if (/not found/i.test(error.message)) {
      return sendError(operationId, 404, errorBody('not_found', error.message), reply)
    }
    return sendError(
      operationId,
      422,
      errorBody('invalid_request', error.message),
      reply,
    )
  }
  if (error instanceof SourceConflictError) {
    return sendError(operationId, 409, errorBody('conflict', error.message), reply)
  }
  if (error instanceof UnavailableError) {
    return sendError(operationId, 503, errorBody('unavailable', error.message), reply)
  }
  if (error instanceof SourceNotFoundError || error instanceof ArtifactNotFoundError) {
    return sendError(operationId, 404, errorBody('not_found', error.message), reply)
  }
  return sendError(
    operationId,
    500,
    errorBody(
      'internal_error',
      error instanceof Error ? error.message : 'internal server error',
    ),
    reply,
  )
}

function createApp(options: ExperimentalServerOptions): ExperimentalHttpServer {
  const app = Fastify({ logger: false })
  let runtime: ExperimentalRuntime | undefined
  let runtimeError: unknown
  const runtimeReady = openExperimentalRuntime({ path: options.dbPath })
    .then((opened) => {
      runtime = opened
    })
    .catch((error: unknown) => {
      runtimeError = error
    })

  app.addHook('onRequest', async (_request, reply) => {
    reply.header(REQUEST_ID_HEADER, randomUUID())
  })

  registerJsonRoute(app, 'get_liveness', async (_request, reply) =>
    sendSuccess('get_liveness', 200, { status: 'ok' }, reply),
  )
  registerJsonRoute(app, 'get_readiness', async (_request, reply) => {
    if (runtime === undefined) {
      return sendReadinessFailure(
        {
          status: 'not_ready',
          checks: {
            database: runtimeError instanceof Error ? runtimeError.message : 'opening',
          },
        },
        reply,
      )
    }
    return sendSuccess(
      'get_readiness',
      200,
      { status: 'ready', checks: { database: 'open' } },
      reply,
    )
  })
  registerJsonRoute(app, 'get_capabilities', async (_request, reply) =>
    sendSuccess(
      'get_capabilities',
      200,
      {
        source_types: ['content'],
        artifact_families: ['memory'],
        memory_extraction: false,
        experience_generation: false,
        managed_skill_generation: false,
        external_skill_registry: false,
        handoff_generation: false,
        search_modes: ['fts'],
        context_versions: [],
      },
      reply,
    ),
  )
  registerJsonRoute(app, 'capture_content_source', async (_request, reply) =>
    sendError(
      'capture_content_source',
      503,
      errorBody(
        'unavailable',
        'content Source capture is unavailable in the experimental skeleton',
      ),
      reply,
    ),
  )
  registerJsonRoute(app, 'remember_memory', async (request, reply) => {
    if (runtime === undefined) {
      return sendError(
        'remember_memory',
        503,
        errorBody('unavailable', 'database is not ready'),
        reply,
      )
    }
    const body = request.body as {
      readonly scope_id: string
      readonly kind: string
      readonly text: string
    }
    const entry = await runtime.remember(body)
    return sendSuccess(
      'remember_memory',
      200,
      { memory: artifactReference(entry), entry: wireEntry(entry) },
      reply,
    )
  })
  registerJsonRoute(app, 'search_memory', async (request, reply) => {
    if (runtime === undefined) {
      return sendError(
        'search_memory',
        503,
        errorBody('unavailable', 'database is not ready'),
        reply,
      )
    }
    const body = request.body as {
      readonly scope_id: string
      readonly query: string
      readonly limit?: number
      readonly mode?: 'auto' | 'fts' | 'vector' | 'hybrid'
    }
    const entries = await runtime.search({
      scope_id: body.scope_id,
      query: body.query,
      ...(body.limit === undefined ? {} : { limit: body.limit }),
      mode: body.mode === 'auto' || body.mode === undefined ? 'fts' : body.mode,
    })
    const hits = entries.map((entry) => ({
      citation: (wireEntry(entry) as { citation: unknown }).citation,
      text: entry.text,
      score: 1,
      matched_by: ['fts'],
    }))
    return sendSuccess(
      'search_memory',
      200,
      {
        memory: entries[0] === undefined ? null : artifactReference(entries[0]),
        mode: 'fts',
        hits,
      },
      reply,
    )
  })
  registerJsonRoute(app, 'list_memory_entries', async (request, reply) => {
    if (runtime === undefined) {
      return sendError(
        'list_memory_entries',
        503,
        errorBody('unavailable', 'database is not ready'),
        reply,
      )
    }
    const body = request.body as { readonly scope_id: string }
    const entries = await runtime.list(body.scope_id)
    return sendSuccess(
      'list_memory_entries',
      200,
      {
        ...(entries[0] === undefined ? {} : { memory: artifactReference(entries[0]) }),
        entries: entries.map(wireEntry),
      },
      reply,
    )
  })
  registerJsonRoute(app, 'get_memory_entry', async (request, reply) => {
    if (runtime === undefined) {
      return sendError(
        'get_memory_entry',
        503,
        errorBody('unavailable', 'database is not ready'),
        reply,
      )
    }
    const body = request.body as {
      readonly scope_id: string
      readonly citation: { readonly entry_id: string }
    }
    const entry = await runtime.get(body.scope_id, body.citation.entry_id)
    return sendSuccess('get_memory_entry', 200, wireEntry(entry), reply)
  })

  app.setNotFoundHandler((_request, reply) => sendUnknownError(reply))

  return {
    app,
    get runtime() {
      return runtime
    },
    async ready(): Promise<void> {
      await runtimeReady
    },
    async listen(): Promise<string> {
      await runtimeReady
      return app.listen({ host: '127.0.0.1', port: 0 })
    },
    async close(): Promise<void> {
      runtime?.close()
      await app.close()
    },
  }
}

export function createServer(
  options: ExperimentalServerOptions,
): ExperimentalHttpServer {
  return createApp(options)
}

export async function listen(
  options: ExperimentalListenOptions,
): Promise<ExperimentalHttpServer> {
  if (options.host !== undefined && options.host !== '127.0.0.1') {
    throw new ValidationError('experimental Server only listens on 127.0.0.1')
  }
  const server = createApp(options)
  await server.ready()
  await server.app.listen({
    host: options.host ?? '127.0.0.1',
    port: options.port,
  })
  return server
}

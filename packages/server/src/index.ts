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
import { localhostHostValidation } from '@modelcontextprotocol/fastify'
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node'
import {
  McpServer,
  fromJsonSchema,
  type CallToolResult,
  type JsonSchemaType,
  type ToolAnnotations,
} from '@modelcontextprotocol/server'
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
const MCP_PROTOCOL_VERSION = '2025-03-26'

export const EXPERIMENTAL_MCP_TOOL_IDS = [
  'capture_content_source',
  'get_memory_entry',
  'list_memory_entries',
  'remember_memory',
  'search_memory',
] as const

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
  assertSuccess(operationId, status, value)
  return reply.code(status).type(JSON_CONTENT_TYPE).send(value)
}

function assertSuccess(operationId: string, status: number, value: unknown): void {
  const result = validateOperationSuccess(operationId, status, JSON_CONTENT_TYPE, value)
  if (!result.valid) {
    throw new Error(
      `${operationId} produced an invalid success response: ${validationMessages(result.errors)}`,
    )
  }
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

async function captureContentSource(
  runtime: ExperimentalRuntime,
  body: unknown,
): Promise<Record<string, unknown>> {
  assertRequest('capture_content_source', body)
  const input = body as {
    readonly scope_id: string
    readonly source_id: string
    readonly content: string
    readonly metadata?: Record<string, unknown> | null
  }
  const captured = await runtime.captureContent(input)
  const value = {
    status: 'accepted',
    source: { name: 'content', source_id: captured.source_id },
    position: captured.position,
  }
  assertSuccess('capture_content_source', 202, value)
  return value
}

async function rememberMemory(
  runtime: ExperimentalRuntime,
  body: unknown,
): Promise<Record<string, unknown>> {
  assertRequest('remember_memory', body)
  const input = body as {
    readonly scope_id: string
    readonly kind: string
    readonly text: string
  }
  const entry = await runtime.remember(input)
  const value = { memory: artifactReference(entry), entry: wireEntry(entry) }
  assertSuccess('remember_memory', 200, value)
  return value
}

async function searchMemory(
  runtime: ExperimentalRuntime,
  body: unknown,
): Promise<Record<string, unknown>> {
  assertRequest('search_memory', body)
  const input = body as {
    readonly scope_id: string
    readonly query: string
    readonly limit?: number
    readonly mode?: 'auto' | 'fts' | 'vector' | 'hybrid'
  }
  const entries = await runtime.search({
    scope_id: input.scope_id,
    query: input.query,
    ...(input.limit === undefined ? {} : { limit: input.limit }),
    mode: input.mode === 'auto' || input.mode === undefined ? 'fts' : input.mode,
  })
  const value = {
    memory: entries[0] === undefined ? null : artifactReference(entries[0]),
    mode: 'fts',
    hits: entries.map((entry) => ({
      citation: (wireEntry(entry) as { citation: unknown }).citation,
      text: entry.text,
      score: 1,
      matched_by: ['fts'],
    })),
  }
  assertSuccess('search_memory', 200, value)
  return value
}

async function listMemoryEntries(
  runtime: ExperimentalRuntime,
  body: unknown,
): Promise<Record<string, unknown>> {
  assertRequest('list_memory_entries', body)
  const input = body as { readonly scope_id: string }
  const entries = await runtime.list(input.scope_id)
  const value = {
    ...(entries[0] === undefined ? {} : { memory: artifactReference(entries[0]) }),
    entries: entries.map(wireEntry),
  }
  assertSuccess('list_memory_entries', 200, value)
  return value
}

async function getMemoryEntry(
  runtime: ExperimentalRuntime,
  body: unknown,
): Promise<Record<string, unknown>> {
  assertRequest('get_memory_entry', body)
  const input = body as {
    readonly scope_id: string
    readonly citation: { readonly entry_id: string }
  }
  const value = wireEntry(await runtime.get(input.scope_id, input.citation.entry_id))
  assertSuccess('get_memory_entry', 200, value)
  return value
}

const SCOPE_PROPERTY = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  pattern: '.*\\S.*',
} as const

const ARTIFACT_REFERENCE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['family', 'artifact_id', 'revision'],
  properties: {
    family: { type: 'string' },
    artifact_id: { type: 'string' },
    revision: { type: 'integer', minimum: 1 },
  },
} as const

const MCP_TOOL_SCHEMAS: Record<
  (typeof EXPERIMENTAL_MCP_TOOL_IDS)[number],
  JsonSchemaType
> = {
  capture_content_source: {
    type: 'object',
    additionalProperties: false,
    required: ['scope_id', 'source_id', 'content'],
    properties: {
      scope_id: SCOPE_PROPERTY,
      source_id: { type: 'string', minLength: 1, maxLength: 256 },
      content: { type: 'string', minLength: 1, maxLength: 200000 },
      metadata: { type: ['object', 'null'], additionalProperties: true },
    },
  },
  remember_memory: {
    type: 'object',
    additionalProperties: false,
    required: ['scope_id', 'kind', 'text'],
    properties: {
      scope_id: SCOPE_PROPERTY,
      kind: { type: 'string', minLength: 1, maxLength: 128 },
      text: { type: 'string', minLength: 1 },
      reason: { type: ['string', 'null'], maxLength: 512 },
      expected_revision: { type: ['integer', 'null'], minimum: 1 },
    },
  },
  search_memory: {
    type: 'object',
    additionalProperties: false,
    required: ['scope_id', 'query'],
    properties: {
      scope_id: SCOPE_PROPERTY,
      query: { type: 'string', minLength: 1, maxLength: 8192 },
      limit: { type: 'integer', minimum: 1, maximum: 50 },
      mode: { type: 'string', enum: ['auto', 'fts', 'vector', 'hybrid'] },
    },
  },
  list_memory_entries: {
    type: 'object',
    additionalProperties: false,
    required: ['scope_id'],
    properties: {
      scope_id: SCOPE_PROPERTY,
      include_inactive: { type: 'boolean' },
    },
  },
  get_memory_entry: {
    type: 'object',
    additionalProperties: false,
    required: ['scope_id', 'citation'],
    properties: {
      scope_id: SCOPE_PROPERTY,
      citation: {
        type: 'object',
        additionalProperties: false,
        required: ['memory_ref', 'entry_id', 'entry_version_id'],
        properties: {
          memory_ref: ARTIFACT_REFERENCE_SCHEMA,
          entry_id: { type: 'string' },
          entry_version_id: { type: 'string' },
        },
      },
    },
  },
}

const READ_ONLY_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
}

function mcpText(value: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(value) }] }
}

function registerMcpTools(server: McpServer, runtime: ExperimentalRuntime): void {
  server.registerTool(
    'capture_content_source',
    {
      description: 'Append experimental ContentSource evidence.',
      inputSchema: fromJsonSchema(MCP_TOOL_SCHEMAS.capture_content_source),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) => mcpText(await captureContentSource(runtime, args)),
  )
  server.registerTool(
    'get_memory_entry',
    {
      description: 'Get one experimental Memory entry.',
      inputSchema: fromJsonSchema(MCP_TOOL_SCHEMAS.get_memory_entry),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async (args) => mcpText(await getMemoryEntry(runtime, args)),
  )
  server.registerTool(
    'list_memory_entries',
    {
      description: 'List experimental Memory entries.',
      inputSchema: fromJsonSchema(MCP_TOOL_SCHEMAS.list_memory_entries),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async (args) => mcpText(await listMemoryEntries(runtime, args)),
  )
  server.registerTool(
    'remember_memory',
    {
      description: 'Remember one experimental Memory entry.',
      inputSchema: fromJsonSchema(MCP_TOOL_SCHEMAS.remember_memory),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => mcpText(await rememberMemory(runtime, args)),
  )
  server.registerTool(
    'search_memory',
    {
      description: 'Search experimental Memory using FTS.',
      inputSchema: fromJsonSchema(MCP_TOOL_SCHEMAS.search_memory),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async (args) => mcpText(await searchMemory(runtime, args)),
  )
}

function createMcpServer(runtime: ExperimentalRuntime): McpServer {
  const server = new McpServer(
    { name: '@powercontext/server-experimental', version: PACKAGE_VERSION },
    { supportedProtocolVersions: [MCP_PROTOCOL_VERSION] },
  )
  registerMcpTools(server, runtime)
  return server
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
  const mcpSessions = new Map<
    string,
    {
      readonly server: McpServer
      readonly transport: NodeStreamableHTTPServerTransport
    }
  >()
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
  app.addHook('onRequest', localhostHostValidation())

  const sessionIdFromRequest = (request: FastifyRequest): string | undefined => {
    const value = request.headers['mcp-session-id']
    return Array.isArray(value) ? value[0] : value
  }

  const isInitializeRequest = (request: FastifyRequest): boolean => {
    if (request.method !== 'POST') {
      return false
    }
    const body = request.body
    return (
      typeof body === 'object' &&
      body !== null &&
      !Array.isArray(body) &&
      'method' in body &&
      body.method === 'initialize'
    )
  }

  const createMcpSession = async (): Promise<{
    readonly server: McpServer
    readonly transport: NodeStreamableHTTPServerTransport
  }> => {
    if (runtime === undefined) {
      throw new UnavailableError('database is not ready')
    }
    const server = createMcpServer(runtime)
    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: randomUUID,
      onsessioninitialized: (sessionId) => {
        mcpSessions.set(sessionId, { server, transport })
      },
      onsessionclosed: (sessionId) => {
        mcpSessions.delete(sessionId)
      },
    })
    await server.connect(transport)
    return { server, transport }
  }

  const handleMcpRequest = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<unknown> => {
    await runtimeReady
    if (runtime === undefined) {
      return reply
        .code(503)
        .type(JSON_CONTENT_TYPE)
        .send(errorBody('unavailable', 'database is not ready'))
    }
    const sessionId = sessionIdFromRequest(request)
    if (isInitializeRequest(request)) {
      const session = await createMcpSession()
      return session.transport.handleRequest(request.raw, reply.raw, request.body)
    }
    const session = sessionId === undefined ? undefined : mcpSessions.get(sessionId)
    if (session === undefined) {
      return reply
        .code(404)
        .type(JSON_CONTENT_TYPE)
        .send({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Session not found' },
          id: null,
        })
    }
    return session.transport.handleRequest(request.raw, reply.raw, request.body)
  }

  app.post('/mcp', handleMcpRequest)
  app.get('/mcp', handleMcpRequest)

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
        context_versions: ['powercontext.prepared-context.v1'],
      },
      reply,
    ),
  )
  registerJsonRoute(app, 'prepare_context', async (request, reply) => {
    if (runtime === undefined) {
      return sendError(
        'prepare_context',
        503,
        errorBody('unavailable', 'database is not ready'),
        reply,
      )
    }
    const body = request.body as {
      readonly scope_id: string
      readonly query: string
      readonly max_bytes?: number
    }
    const prepared = await runtime.prepare(body)
    return sendSuccess('prepare_context', 200, prepared, reply)
  })
  registerJsonRoute(app, 'capture_content_source', async (request, reply) => {
    if (runtime === undefined) {
      return sendError(
        'capture_content_source',
        503,
        errorBody('unavailable', 'database is not ready'),
        reply,
      )
    }
    return sendSuccess(
      'capture_content_source',
      202,
      await captureContentSource(runtime, request.body),
      reply,
    )
  })
  registerJsonRoute(app, 'remember_memory', async (request, reply) => {
    if (runtime === undefined) {
      return sendError(
        'remember_memory',
        503,
        errorBody('unavailable', 'database is not ready'),
        reply,
      )
    }
    return sendSuccess(
      'remember_memory',
      200,
      await rememberMemory(runtime, request.body),
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
    return sendSuccess(
      'search_memory',
      200,
      await searchMemory(runtime, request.body),
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
    return sendSuccess(
      'list_memory_entries',
      200,
      await listMemoryEntries(runtime, request.body),
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
    return sendSuccess(
      'get_memory_entry',
      200,
      await getMemoryEntry(runtime, request.body),
      reply,
    )
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
      await Promise.all(
        [...mcpSessions.values()].map(async (session) => session.server.close()),
      )
      mcpSessions.clear()
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

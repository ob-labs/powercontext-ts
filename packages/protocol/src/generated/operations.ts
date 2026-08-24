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

/* DO NOT EDIT.
 * Generated operation metadata.
 * source: contract/openapi/powercontext.yaml
 * sourceDigest: a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3
 * generatorVersion: 0.2.0-phase2
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type RequestLocation = 'body' | 'query' | null

export interface OperationMetadata {
  readonly operationId: string
  readonly method: HttpMethod
  readonly path: string
  readonly location: RequestLocation
  readonly scope: boolean
}

export const GENERATED_MANIFEST = {
  generatorVersion: '0.2.0-phase2',
  sourceDigest: 'a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3',
  operationCount: 52,
  overlay: 'integer-safe-range.v1',
} as const

export const OPERATION_METADATA = {
  get_liveness: { operationId: 'get_liveness', method: 'GET', path: '/health/live', location: null, scope: false },
  get_readiness: { operationId: 'get_readiness', method: 'GET', path: '/health/ready', location: null, scope: false },
  get_capabilities: { operationId: 'get_capabilities', method: 'GET', path: '/v1/capabilities', location: null, scope: false },
  capture_content_source: { operationId: 'capture_content_source', method: 'POST', path: '/v1/sources/content', location: 'body', scope: true },
  prepare_context: { operationId: 'prepare_context', method: 'POST', path: '/v1/context/prepare', location: 'body', scope: true },
  create_work_contract: { operationId: 'create_work_contract', method: 'POST', path: '/v1/work/contracts/create', location: 'body', scope: true },
  handoff_current_work: { operationId: 'handoff_current_work', method: 'POST', path: '/v1/work/handoffs/prepare-current', location: 'body', scope: true },
  acknowledge_handoff: { operationId: 'acknowledge_handoff', method: 'POST', path: '/v1/work/handoffs/acknowledge', location: 'body', scope: true },
  record_task_outcome: { operationId: 'record_task_outcome', method: 'POST', path: '/v1/work/outcomes/record', location: 'body', scope: true },
  activate_handoff: { operationId: 'activate_handoff', method: 'POST', path: '/v1/handoff/activate', location: 'body', scope: true },
  prepare_handoff: { operationId: 'prepare_handoff', method: 'POST', path: '/v1/handoff/prepare', location: 'body', scope: true },
  finalize_handoff: { operationId: 'finalize_handoff', method: 'POST', path: '/v1/handoff/finalize', location: 'body', scope: true },
  commit_handoff: { operationId: 'commit_handoff', method: 'POST', path: '/v1/handoff/commit', location: 'body', scope: true },
  continue_handoff: { operationId: 'continue_handoff', method: 'POST', path: '/v1/handoff/continue', location: 'body', scope: true },
  flush_memory: { operationId: 'flush_memory', method: 'POST', path: '/v1/memory/flush', location: 'body', scope: true },
  remember_memory: { operationId: 'remember_memory', method: 'POST', path: '/v1/memory/remember', location: 'body', scope: true },
  search_memory: { operationId: 'search_memory', method: 'POST', path: '/v1/memory/search', location: 'body', scope: true },
  list_memory_entries: { operationId: 'list_memory_entries', method: 'POST', path: '/v1/memory/entries/list', location: 'body', scope: true },
  get_memory_entry: { operationId: 'get_memory_entry', method: 'POST', path: '/v1/memory/entries/get', location: 'body', scope: true },
  revise_memory_entry: { operationId: 'revise_memory_entry', method: 'POST', path: '/v1/memory/entries/revise', location: 'body', scope: true },
  retire_memory_entry: { operationId: 'retire_memory_entry', method: 'POST', path: '/v1/memory/entries/retire', location: 'body', scope: true },
  list_memory_changes: { operationId: 'list_memory_changes', method: 'POST', path: '/v1/memory/changes', location: 'body', scope: true },
  propose_experience: { operationId: 'propose_experience', method: 'POST', path: '/v1/experience/propose', location: 'body', scope: true },
  generate_experience: { operationId: 'generate_experience', method: 'POST', path: '/v1/experience/generate', location: 'body', scope: true },
  get_experience: { operationId: 'get_experience', method: 'POST', path: '/v1/experience/get', location: 'body', scope: true },
  propose_skill: { operationId: 'propose_skill', method: 'POST', path: '/v1/skill/propose', location: 'body', scope: true },
  generate_skill: { operationId: 'generate_skill', method: 'POST', path: '/v1/skill/generate', location: 'body', scope: true },
  get_skill: { operationId: 'get_skill', method: 'POST', path: '/v1/skill/get', location: 'body', scope: true },
  scan_external_skills: { operationId: 'scan_external_skills', method: 'POST', path: '/v1/external-skills/scan', location: 'body', scope: true },
  list_external_skills: { operationId: 'list_external_skills', method: 'POST', path: '/v1/external-skills/list', location: 'body', scope: true },
  resolve_external_skill: { operationId: 'resolve_external_skill', method: 'POST', path: '/v1/external-skills/resolve', location: 'body', scope: true },
  import_external_skill: { operationId: 'import_external_skill', method: 'POST', path: '/v1/external-skills/import', location: 'body', scope: true },
  list_artifact_candidates: { operationId: 'list_artifact_candidates', method: 'POST', path: '/v1/artifact-candidates/list', location: 'body', scope: true },
  get_artifact_candidate: { operationId: 'get_artifact_candidate', method: 'POST', path: '/v1/artifact-candidates/get', location: 'body', scope: true },
  approve_artifact_candidate: { operationId: 'approve_artifact_candidate', method: 'POST', path: '/v1/artifact-candidates/approve', location: 'body', scope: true },
  reject_artifact_candidate: { operationId: 'reject_artifact_candidate', method: 'POST', path: '/v1/artifact-candidates/reject', location: 'body', scope: true },
  revise_artifact_candidate: { operationId: 'revise_artifact_candidate', method: 'POST', path: '/v1/artifact-candidates/revise', location: 'body', scope: true },
  get_stats: { operationId: 'get_stats', method: 'GET', path: '/v1/stats', location: 'query', scope: true },
  create_handoff_report_project: { operationId: 'create_handoff_report_project', method: 'POST', path: '/v1/handoff-reports/projects/create', location: 'body', scope: false },
  list_handoff_report_projects: { operationId: 'list_handoff_report_projects', method: 'POST', path: '/v1/handoff-reports/projects/list', location: 'body', scope: false },
  get_handoff_report_project: { operationId: 'get_handoff_report_project', method: 'POST', path: '/v1/handoff-reports/projects/get', location: 'body', scope: false },
  update_handoff_report_project: { operationId: 'update_handoff_report_project', method: 'POST', path: '/v1/handoff-reports/projects/update', location: 'body', scope: false },
  register_handoff_report_workstream: { operationId: 'register_handoff_report_workstream', method: 'POST', path: '/v1/handoff-reports/workstreams/register', location: 'body', scope: true },
  list_handoff_report_workstreams: { operationId: 'list_handoff_report_workstreams', method: 'POST', path: '/v1/handoff-reports/workstreams/list', location: 'body', scope: false },
  update_handoff_report_workstream: { operationId: 'update_handoff_report_workstream', method: 'POST', path: '/v1/handoff-reports/workstreams/update', location: 'body', scope: false },
  get_handoff_report: { operationId: 'get_handoff_report', method: 'POST', path: '/v1/handoff-reports/get', location: 'body', scope: false },
  record_handoff_report_activity: { operationId: 'record_handoff_report_activity', method: 'POST', path: '/v1/handoff-reports/activities/record', location: 'body', scope: true },
  list_handoff_report_activities: { operationId: 'list_handoff_report_activities', method: 'POST', path: '/v1/handoff-reports/activities/list', location: 'body', scope: false },
  purge_handoff_report_activities: { operationId: 'purge_handoff_report_activities', method: 'POST', path: '/v1/handoff-reports/activities/purge', location: 'body', scope: false },
  get_handoff_report_workspace: { operationId: 'get_handoff_report_workspace', method: 'POST', path: '/v1/handoff-reports/workspace-bindings/get', location: 'body', scope: false },
  attach_handoff_report_workspace: { operationId: 'attach_handoff_report_workspace', method: 'POST', path: '/v1/handoff-reports/workspace-bindings/attach', location: 'body', scope: false },
  detach_handoff_report_workspace: { operationId: 'detach_handoff_report_workspace', method: 'POST', path: '/v1/handoff-reports/workspace-bindings/detach', location: 'body', scope: false },
} as const satisfies Record<string, OperationMetadata>

export type OperationId = keyof typeof OPERATION_METADATA

export function listOperationIds(): OperationId[] {
  return Object.keys(OPERATION_METADATA) as OperationId[]
}

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

import type { OperationId } from '@powercontext/protocol'

export const SCOPE_ID = 'project:client-e2e'
export const SOURCE_REF = { name: 'content', source_id: 'missing-src' }
export const ARTIFACT_REF = {
  family: 'memory',
  artifact_id: 'missing-art',
  revision: 1,
}
export const MEMORY_CITATION = {
  memory_ref: ARTIFACT_REF,
  entry_id: 'entry-1',
  entry_version_id: 'ver-1',
}
export const SOURCE_CITATION = { kind: 'source' as const, source_ref: SOURCE_REF }

const CLAIM = {
  text: 'Keep the typed Client on the public HTTP contract.',
  basis: 'declared' as const,
  evidence: [SOURCE_CITATION],
}

const STATEMENT = {
  text: 'Continue from the official Client transport.',
  citations: [SOURCE_CITATION],
}

const WORK_CONTRACT = {
  schema: 'powercontext.work-contract.v1' as const,
  trust: 'untrusted_input' as const,
  objective: 'Cover every Client operation.',
  facts: [CLAIM],
  in_scope: ['typed client'],
  exclusions: [],
  completion_criteria: ['52 operations reach the server'],
  authorization_notes: [],
  open_questions: [],
}

const CURRENT_HANDOFF = {
  schema: 'powercontext.current-work-handoff.v1' as const,
  trust: 'untrusted_input' as const,
  objective: 'Pause after Client transport.',
  state: [CLAIM],
  disposition: 'continuable' as const,
  next_action: CLAIM,
  omissions: [],
}

const HANDOFF_CONTENT = {
  schema: 'powercontext.handoff.v1' as const,
  objective: 'Resume Client work.',
  state: [STATEMENT],
  disposition: 'continuable' as const,
  next_action: STATEMENT,
  omissions: [],
}

const PREPARED_HANDOFF = {
  schema: 'powercontext.prepared-handoff.v1' as const,
  scope_id: SCOPE_ID,
  base: null,
  content: HANDOFF_CONTENT,
}

const HANDOFF_DRAFT = {
  objective: 'Inspect the draft.',
  state: [STATEMENT],
  disposition: 'continuable' as const,
  next_action: STATEMENT,
  omissions: [],
}

const TASK_OUTCOME = {
  schema: 'powercontext.task-outcome.v1' as const,
  trust: 'untrusted_observation' as const,
  objective: 'Record one outcome.',
  status: 'unknown' as const,
  summary: 'No real work was executed.',
  observations: [CLAIM],
  checks: [],
  produced_artifacts: [],
  remaining_work: [],
}

const EXPERIENCE = {
  situation: 'Need an official TypeScript Client.',
  action: 'Hand-write a strict transport.',
  outcome: '52 operations can call a Python Server.',
  lesson: 'Validate responses at runtime.',
}

const SKILL = {
  name: 'client-coverage',
  description: 'Call every HTTP operation.',
  instructions: 'Use the official typed Client.',
  validation: ['Contract coverage stays green.'],
}

function scoped(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { scope_id: SCOPE_ID, ...extra }
}

export function callThroughPayload(operationId: OperationId): unknown {
  return CALL_THROUGH_REQUESTS[operationId]
}

export const CALL_THROUGH_REQUESTS: Record<OperationId, unknown> = {
  get_liveness: undefined,
  get_readiness: undefined,
  get_capabilities: undefined,
  capture_content_source: scoped({
    source_id: 'client-e2e-1',
    content: 'Official Client call-through evidence.',
  }),
  prepare_context: scoped({ query: 'official typed client' }),
  create_work_contract: scoped({ source_id: 'work-1', contract: WORK_CONTRACT }),
  handoff_current_work: scoped({ source_id: 'handoff-1', handoff: CURRENT_HANDOFF }),
  acknowledge_handoff: scoped({
    source_id: 'handoff-1',
    receiver: 'client-e2e',
    status: 'needs_clarification',
    selection: 'prepared',
  }),
  record_task_outcome: scoped({ source_id: 'outcome-1', outcome: TASK_OUTCOME }),
  activate_handoff: scoped({ boundary_source: SOURCE_REF, objective: 'Activate' }),
  prepare_handoff: scoped({ objective: 'Prepare', evidence: [SOURCE_CITATION] }),
  finalize_handoff: scoped({ draft: HANDOFF_DRAFT }),
  commit_handoff: scoped({ handoff: PREPARED_HANDOFF }),
  continue_handoff: scoped({ selection: 'latest' }),
  flush_memory: scoped(),
  remember_memory: scoped({ kind: 'decision', text: 'Keep the Client fetch-only.' }),
  search_memory: scoped({ query: 'typed client' }),
  list_memory_entries: scoped(),
  get_memory_entry: scoped({ citation: MEMORY_CITATION }),
  revise_memory_entry: scoped({
    citation: MEMORY_CITATION,
    kind: 'decision',
    text: 'Revise the Client note.',
  }),
  retire_memory_entry: scoped({ citation: MEMORY_CITATION }),
  list_memory_changes: scoped(),
  propose_experience: scoped({
    proposal: EXPERIENCE,
    source_refs: [SOURCE_REF],
    artifact_refs: [],
  }),
  generate_experience: scoped({ source_refs: [SOURCE_REF], artifact_refs: [] }),
  get_experience: scoped({
    artifact: { family: 'experience', artifact_id: 'e1', revision: 1 },
  }),
  propose_skill: scoped({
    proposal: SKILL,
    source_refs: [SOURCE_REF],
    artifact_refs: [],
  }),
  generate_skill: scoped({
    origin: 'source',
    source_refs: [SOURCE_REF],
    artifact_refs: [],
  }),
  get_skill: scoped({ artifact: { family: 'skill', artifact_id: 's1', revision: 1 } }),
  scan_external_skills: scoped(),
  list_external_skills: scoped(),
  resolve_external_skill: scoped({
    external_skill_id: 'missing-skill',
    fingerprint: 'a'.repeat(64),
  }),
  import_external_skill: scoped({
    external_skill_id: 'missing-skill',
    fingerprint: 'a'.repeat(64),
    mode: 'import',
  }),
  list_artifact_candidates: scoped(),
  get_artifact_candidate: scoped({ candidate_id: 'cand-1' }),
  approve_artifact_candidate: scoped({ candidate_id: 'cand-1', expected_version: 1 }),
  reject_artifact_candidate: scoped({
    candidate_id: 'cand-1',
    expected_version: 1,
    reason: 'not used in call-through',
  }),
  revise_artifact_candidate: scoped({
    candidate_id: 'cand-1',
    expected_version: 1,
    proposal: EXPERIENCE,
    source_refs: [SOURCE_REF],
    artifact_refs: [],
  }),
  get_stats: scoped({ period: '7d' }),
  create_handoff_report_project: {
    project_key: 'client-e2e',
    title: 'Client coverage',
  },
  list_handoff_report_projects: {},
  get_handoff_report_project: { project_id: 'missing-project' },
  update_handoff_report_project: {
    expected_version: 1,
    project: {
      schema: 'powercontext.project.v1',
      project_id: 'missing-project',
      project_key: 'client-e2e',
      title: 'Updated',
      description: null,
      default_locale: 'zh-CN',
      timezone: 'UTC',
      catalog_state: 'included',
      version: 1,
    },
  },
  register_handoff_report_workstream: {
    project_id: 'missing-project',
    scope_id: SCOPE_ID,
    title: 'Client',
    kind: 'operations',
  },
  list_handoff_report_workstreams: { project_id: 'missing-project' },
  update_handoff_report_workstream: {
    expected_version: 1,
    workstream: {
      schema: 'powercontext.workstream.v1',
      scope_id: SCOPE_ID,
      project_id: 'missing-project',
      key: 'client',
      title: 'Updated',
      kind: 'operations',
      catalog_state: 'included',
      external_refs: [],
      labels: [],
      version: 1,
    },
  },
  get_handoff_report: { project_id: 'missing-project', format: 'json' },
  record_handoff_report_activity: {
    project_id: 'missing-project',
    source: 'other',
    source_event_id: 'evt-1',
    time_basis: 'host_observed',
  },
  list_handoff_report_activities: { project_id: 'missing-project' },
  purge_handoff_report_activities: {
    project_id: 'missing-project',
    observed_before: '2026-01-01T00:00:00Z',
  },
  get_handoff_report_workspace: { workspace_instance_id: 'ws-1' },
  attach_handoff_report_workspace: {
    workspace_instance_id: 'ws-1',
    project_id: 'missing-project',
    expected_version: 1,
    repository_ref: {
      provider: 'local',
      repository_id: 'repo-1',
      normalized_remote: 'local/repo-1',
      subpath: '.',
    },
  },
  detach_handoff_report_workspace: {
    workspace_instance_id: 'ws-1',
    expected_version: 1,
  },
}

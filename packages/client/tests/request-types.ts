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

import type { PowerContextClient } from '../src/index.js'

declare const client: PowerContextClient

// Required OpenAPI request fields remain required on every typed method.
void client.remember_memory({
  scope_id: 'project:demo',
  kind: 'decision',
  text: 'keep required fields required',
})

// @ts-expect-error scope_id, kind and text are required by RememberMemoryRequest.
void client.remember_memory({})

// Server-defaulted OpenAPI fields stay optional for Client callers.
void client.get_stats({ scope_id: 'project:demo' })
void client.get_handoff_report({ project_id: 'demo' })

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

export interface UserPromptSubmitInput {
  readonly cwd?: string
  readonly prompt?: string
  readonly session_id?: string
  readonly turn_id?: string
}

export interface UserPromptSubmitError {
  readonly component: string
  readonly operation: string
  readonly error: string
}

export interface UserPromptSubmitResult {
  readonly output: {
    readonly continue: true
    readonly hookSpecificOutput: {
      readonly hookEventName: 'UserPromptSubmit'
      readonly additionalContext?: string
    }
  }
  readonly errors: readonly UserPromptSubmitError[]
}

export function deriveScopeId(cwd: string): string
export function normalizeBaseUrl(value: string | undefined): string
export function runUserPromptSubmit(
  input: UserPromptSubmitInput,
  options?: {
    readonly fetchImpl?: typeof fetch
    readonly env?: Record<string, string | undefined>
  },
): Promise<UserPromptSubmitResult>

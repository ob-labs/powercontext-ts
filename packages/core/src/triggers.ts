/**
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface PolicyTransition<TState, TAction = unknown> {
  readonly state: TState
  readonly actions: readonly TAction[]
}

export interface Trigger<TSignal, TState, TAction = unknown> {
  initialState(): TState
  activate(signal: TSignal, state: TState): PolicyTransition<TState, TAction>
}

/** Evaluate a Trigger without persisting state or executing actions. */
export function activateTrigger<TSignal, TState, TAction>(
  trigger: Trigger<TSignal, TState, TAction>,
  signal: TSignal,
  state?: TState,
): PolicyTransition<TState, TAction> {
  return trigger.activate(signal, state === undefined ? trigger.initialState() : state)
}

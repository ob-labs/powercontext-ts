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

import {
  createSequenceIdFactory,
  createSystemClock,
  type Clock,
  type IdFactory,
} from './time.js'

export class PowerContext<TSources, TArtifacts, TTriggers> {
  readonly sources: TSources
  readonly artifacts: TArtifacts
  readonly triggers: TTriggers
  readonly clock: Clock
  readonly ids: IdFactory

  constructor(options: {
    readonly sources: TSources
    readonly artifacts: TArtifacts
    readonly triggers: TTriggers
    readonly clock?: Clock
    readonly ids?: IdFactory
  }) {
    this.sources = options.sources
    this.artifacts = options.artifacts
    this.triggers = options.triggers
    this.clock = options.clock ?? createSystemClock()
    this.ids = options.ids ?? createSequenceIdFactory('pc')
  }
}

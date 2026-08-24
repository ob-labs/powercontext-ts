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

export const PACKAGE_NAME = '@powercontext/conformance-runner' as const
export const PACKAGE_VERSION = '0.0.0' as const
export const PACKAGE_ROLE = 'conformance-runner' as const
export const FIXTURE_ROOT = 'conformance/' as const
export const OWNS_FIXTURE_TRUTH = false

export function describeRunner(): {
  readonly assetRoot: typeof FIXTURE_ROOT
  readonly ownsFixtures: false
} {
  return {
    assetRoot: FIXTURE_ROOT,
    ownsFixtures: false,
  }
}

export { runConformance, assertConformancePassed } from './run.js'
export type { ConformanceReport } from './types.js'

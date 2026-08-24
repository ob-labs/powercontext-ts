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
import { PACKAGE_NAME, main, renderHelp } from '../src/index.js'

describe('@powercontext/cli skeleton', () => {
  it('reserves the CLI identity and help surface', () => {
    expect(PACKAGE_NAME).toBe('@powercontext/cli')
    expect(renderHelp()).toContain('Phase 1 skeleton')
    expect(main(['--help'])).toBe(0)
    expect(main([])).toBe(2)
  })
})

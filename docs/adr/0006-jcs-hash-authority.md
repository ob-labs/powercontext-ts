# ADR 0006：JCS 与 hash authority

- Status: Accepted
- Date: 2026-08-23
- Amended: 2026-08-27 (raw JCS vs domain integer split; IEEE float vs Python int)
- Kind: Regular
- Owners: runtime-owner, conformance-owner

## Context

PowerContext 的 identity、Memory hash、Report digest 和 Skill fingerprint 都依赖
canonical bytes。普通 `JSON.stringify` 不满足 RFC 8785，也不包含项目级 NFC、
引用排序和 domain prefix。

RFC 8785 Appendix B 把 `9007199254740992`（`2^53`）列为合法 JCS 输出。pinned
Python `rfc8785==0.1.4` 把 JSON 整数域收成 `±(2^53-1)`，对 Python `int` 的
`±2^53` 抛 `IntegerDomainError`。JavaScript 没有独立整数类型，该值是精确的
IEEE 754 number。两条权威在这一点上冲突。

## Decision

1. Canonical JSON 的权威是 RFC 8785（JCS）：I-JSON、ECMAScript 数值序列化、
   UTF-16 code unit key 排序、无额外空白、拒绝非法 Unicode 与非有限数值。
2. Python `rfc8785` 在 pinned baseline 上的输出是 oracle。TypeScript 必须与它
   byte-for-byte 一致，包括官方 vectors 与项目 vectors。
3. 对整数域冲突，按输入形态拆开，禁止混用：
   - raw JCS（`canonicalizeJson`）跟 RFC 8785 Appendix B，接受有限 IEEE 754
     值，包括 `±2^53` 与 `1e30`。
   - 已经解析成 JavaScript `number` 的 domain 值（`canonicalizeDomain`）跟
     Python `float` / `rfc8785.dumps`：有限 IEEE 数交给 JCS，`1e30` 与
     Appendix B `±2^53` 都合法。解析后无法区分 `1e30` 与整数 token，不能用
     `Number.isInteger` 假装对齐 Python `int` 域。
   - Python `int` 与共享 C2 `decimal-integer` token（以及 raw JSON 的
     `findUnsafeIntegerTokens`）跟 ADR 0001：超出 `±(2^53-1)` 的整数 token
     必须拒绝。`json.loads("9007199254740992")` 在 Python 里是 `int`。
   Identity 与 content hash 必须走 `hashDomain`（内部先 `canonicalizeDomain`），
   不得对未校验的 raw JCS 结果做 domain-separated hash。
4. 项目叠加规则同样是契约，不是实现细节：
   - recursive NFC；canonical key 在 NFC 后冲突则拒绝；
   - SourceRef / ArtifactRef 排序与去重；禁止 `localeCompare`；
   - Memory manifest / change 顺序；
   - domain-separated SHA-256；
   - embedding content hash 与 external Skill fingerprint。
   Memory / Skill 叠加随对应工作流落地，不是 Deterministic Core primitives
   （issue #2）的关闭条件。
5. hash 输入必须是已验证 canonical bytes。禁止 hash 普通对象的插入顺序。
6. `Date`、`Map`、`Set`、`BigInt`、typed array 不是 JSON domain 值，必须在
   边界转换成规范字符串或拒绝。
7. UTF-8 byte length 是 `max_bytes` 与 PreparedContext `content_bytes` 的唯一口径。

## Consequences

- 官方 JCS vectors 的证据见 `docs/develop/investigations/jcs.md`。
- canonical primitives 达到 C2 属于 Runtime 工作，不在 Client C1 范围内。
- 任何“为了方便改用 JSON.stringify”的补丁都直接否决。
- 不得为了迁就 Python `IntegerDomainError` 而改掉 raw JCS 的 Appendix B 行为。
- 不得对已经解析的 IEEE `number`（如 `1e30`）再套 `Number.isInteger` 去对齐
  Python `int` 域；整数 token 拒绝只发生在 `decimal-integer` / raw JSON lexer。

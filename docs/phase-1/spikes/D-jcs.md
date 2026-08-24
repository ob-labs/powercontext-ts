# Spike D：RFC 8785 JCS

## 问题

TypeScript 能否对官方 JCS vectors 以及 Python `rfc8785` 做到 byte-for-byte
一致？`JSON.stringify` 是否可以偷懒？

## 做法

使用 `canonicalize@2.1.0` 做 ECMAScript 数值和 UTF-16 key serialization，外层
`canonicalizeStrict` 强制 I-JSON、finite number、plain JSON value 与 surrogate
合法性。测试覆盖 RFC 8785 Appendix B 的全部 26 行，并纳入 RFC Appendix I
引用的 `cyberphone/json-canonicalization` reference corpus 全部 6 组 input/output，
精确 pin 到 commit `19d51d7fe467d4706a3ff08adf8a748f29fc21e0`；原始 bytes
以 base64 保存并附 SHA-256，避免换行或 Unicode checkout 改写。测试只调用 oracle
harness 中由 pinned `uv.lock` 安装的 `rfc8785==0.1.4`；oracle 缺失、corpus digest
漂移或差分脚本失败都会直接令测试失败，不再 skip。

## 数据

| 向量 | `canonicalize` | Python `rfc8785.dumps` |
| --- | --- | --- |
| literals + numbers | `{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27]}` | 逐字节相同 |
| Unicode / CRLF key | `{"\\r\\n":"Carriage Return New Line","€":"Euro Symbol"}` | 逐字节相同 |
| `-0` | `{"value":0}` | 未单独列入 Python 对，TS 侧符合 JCS |
| subnormal / max double | `5e-324` / `1.7976931348623157e+308` | 逐字节相同 |
| UTF-16 key ordering / control escaping | 固定 expected | 逐字节相同 |
| lone high/low surrogate | `JcsInputError` | Python `CanonicalizationError` |
| NaN / Infinity / bigint / non-JSON value | 拒绝 | 符合 I-JSON 边界 |
| RFC 8785 Appendix B | 26/26 行（含 NaN/Infinity 拒绝） | 规范全集 |
| RFC-cited reference corpus | 6/6 input/output bytes | Python/TS/expected 三方逐字节相同 |

控制实验：

```text
JSON.stringify({ b: 1, a: 2 }) === '{"b":1,"a":2}'
canonicalize({ b: 1, a: 2 })   === '{"a":2,"b":1}'
```

`JSON.stringify` 保留插入顺序，不是 JCS。

## 结论

**JCS spike 通过。** Phase 4 必须迁入“严格输入校验 + canonical serializer”整体，
不能裸用 `canonicalize`；随后叠加项目级 NFC / ref sort / domain hash。
任何用 `JSON.stringify` 冒充 canonical bytes 的补丁直接否决。

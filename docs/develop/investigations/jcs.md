# Investigation: RFC 8785 JCS

## Question

Can TypeScript match official JCS vectors and Python `rfc8785` byte-for-byte?
Is `JSON.stringify` enough?

## Method

`canonicalize@2.1.0` handles ECMAScript numbers and UTF-16 key serialization.
`canonicalizeStrict` enforces I-JSON, finite numbers, plain JSON values, and
surrogate legality. Tests cover RFC 8785 Appendix B (26 rows) and the
RFC-cited `cyberphone/json-canonicalization` corpus (6 groups), pinned to
commit `19d51d7fe467d4706a3ff08adf8a748f29fc21e0`. The oracle is
`rfc8785==0.1.4` from the pinned `uv.lock`.

## Result

Official vectors and the reference corpus match Python `rfc8785.dumps`
byte-for-byte. Lone surrogates, NaN, Infinity, bigint, and non-JSON values are
rejected.

Control:

```text
JSON.stringify({ b: 1, a: 2 }) === '{"b":1,"a":2}'
canonicalize({ b: 1, a: 2 })   === '{"a":2,"b":1}'
```

`JSON.stringify` keeps insertion order. That is not JCS.

## Conclusion

The JCS investigation passed. Canonical work must ship “strict input checks +
canonical serializer” as a whole. Do not call `canonicalize` bare. Do not
treat `JSON.stringify` as canonical bytes.

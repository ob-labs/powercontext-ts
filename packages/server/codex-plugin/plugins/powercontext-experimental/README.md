# PowerContext Experimental Codex Plugin

This is a small experimental Codex plugin for the TypeScript subset Server. It
is not the Python marketplace plugin, a shipped PowerContext CLI, M4, C3, or a
handoff/work Skill.

The `UserPromptSubmit` hook:

- derives a stable scope from the Git root (or current directory), unless
  `POWERCONTEXT_SCOPE_ID` is set;
- requests `POST /v1/context/prepare` and injects ready context;
- captures the prompt through `POST /v1/sources/content` in the same scope;
- writes JSON diagnostics to stderr and always fails open.

The bundled Streamable HTTP MCP configuration points to
`http://127.0.0.1:8787/mcp` and exposes exactly the Server's five experimental
tools. Set `POWERCONTEXT_BASE_URL` to override the hook URL at runtime. Use the
Server's experimental setup helper to render a plugin copy whose hook and MCP
URLs use the same configured base URL.

Start the Server, install the plugin, and smoke-test Codex using the
commands in the [Server README](../../../README.md).

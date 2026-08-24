# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.

"""Verify the frozen contract plus Phase 1 CI evidence against one Python pin."""

from __future__ import annotations

import argparse
import ast
import re
import subprocess
import sys
import tomllib
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from check_manifest import ManifestValidationError, validate_manifest
from digests import (
    canonical_json_sha256,
    count_operation_ids,
    count_schema_names,
    file_sha256,
    normalize_lf,
    sha256_bytes,
    source_manifest_sha256,
)
from lockfile import OPENAPI_PATH, ROOT, read_lock, read_yaml_mapping

EXPECTED_SYNC_VERSION = (
    (ROOT / "tools" / "contract-sync" / "VERSION").read_text(encoding="utf-8").strip()
)
RFC_LEDGER_PATH = ROOT / "docs" / "governance" / "rfc-ledger.yaml"
MANIFEST_PATH = ROOT / "docs" / "governance" / "capability-manifest.yaml"
_SHA256 = re.compile(r"^[0-9a-f]{64}$")
_COMMIT = re.compile(r"^[0-9a-f]{40}$")
_ANALYZER_POLICY_KEYS = (
    "analyzer_id",
    "memory_extract_coding",
    "memory_extract_conversation",
    "memory_rerank",
    "prepared_context_schema",
    "memory_schema",
    "handoff_schema",
    "work_continuity_schema",
    "handoff_report_schema",
)


class VerificationError(ValueError):
    """Report a baseline mismatch that must block Phase 0 exit."""


def _require_mapping(value: object, description: str) -> dict[str, Any]:
    if not isinstance(value, dict) or not all(isinstance(key, str) for key in value):
        raise VerificationError(f"{description} must be a string-keyed mapping")
    return value


def _require_list(value: object, description: str) -> list[Any]:
    if not isinstance(value, list):
        raise VerificationError(f"{description} must be a list")
    return value


def _require_string(value: object, description: str) -> str:
    if not isinstance(value, str) or not value:
        raise VerificationError(f"{description} must be a non-empty string")
    return value


def _require_sha256(value: object, description: str) -> str:
    digest = _require_string(value, description)
    if _SHA256.fullmatch(digest) is None:
        raise VerificationError(f"{description} must be a lowercase SHA-256")
    return digest


def _require_run_url(value: object, description: str, repository: str) -> str:
    url = _require_string(value, description)
    prefix = f"{repository.rstrip('/')}/actions/runs/"
    run_id = url.removeprefix(prefix)
    if not url.startswith(prefix) or not run_id.isdigit() or int(run_id) < 1:
        raise VerificationError(
            f"{description} must be an immutable GitHub Actions run URL for {repository}"
        )
    return url


def _verify_phase1_ci_evidence(
    lock: dict[str, Any], supported_matrix: dict[str, Any]
) -> None:
    if lock.get("node_client_verified") != [22, 24]:
        raise VerificationError("Phase 1 CI must verify Node Client 22 and 24")
    if lock.get("node_verification_status") != "verified-phase1-ci":
        raise VerificationError("Node verification status must cite Phase 1 CI")
    if supported_matrix.get("status") != "phase1-ci-smoke-verified":
        raise VerificationError(
            "supported_matrix must distinguish Phase 1 smoke from product support"
        )
    expected_scope = {
        "node_client": [22, 24],
        "node_runtime": [24],
        "os": ["linux", "macos", "windows"],
        "gates": ["contract-sync", "oracle", "package-smoke"],
    }
    if supported_matrix.get("verified_scope") != expected_scope:
        raise VerificationError("supported_matrix verified_scope is incomplete")

    evidence = _require_mapping(lock.get("phase1_ci_evidence"), "phase1_ci_evidence")
    if evidence.get("verified_on") != "2026-08-24":
        raise VerificationError("Phase 1 CI evidence must record its verification date")
    repository = _require_string(evidence.get("repository"), "evidence repository")
    if repository != "https://github.com/knqiufan/powercontext-ts":
        raise VerificationError("Phase 1 CI evidence points at the wrong repository")
    commit = _require_string(evidence.get("verified_commit"), "verified_commit")
    if _COMMIT.fullmatch(commit) is None:
        raise VerificationError("verified_commit must be a full lowercase commit SHA")
    _require_run_url(evidence.get("ci_run"), "ci_run", repository)
    _require_run_url(evidence.get("nightly_run"), "nightly_run", repository)
    expected_jobs = {
        "quality": "passed",
        "client_matrix": [22, 24],
        "runtime_matrix": [24],
        "smoke_os": ["linux", "macos", "windows"],
        "oracle_os": ["linux", "macos", "windows"],
    }
    if evidence.get("jobs") != expected_jobs:
        raise VerificationError("Phase 1 CI evidence does not cover every required job")


def _git(repo: Path, *arguments: str) -> bytes:
    try:
        return subprocess.check_output(
            ["git", "-C", str(repo), *arguments],
            stderr=subprocess.STDOUT,
        )
    except (FileNotFoundError, subprocess.CalledProcessError) as error:
        detail = (
            "git is unavailable"
            if isinstance(error, FileNotFoundError)
            else error.output.decode("utf-8", errors="replace").strip()
        )
        raise VerificationError(
            f"git {' '.join(arguments)} failed: {detail}"
        ) from error


def _git_blob(repo: Path, commit: str, path: str) -> bytes:
    return _git(repo, "show", f"{commit}:{path}")


def _python_database_schema_files(repo: Path, commit: str) -> list[str]:
    pattern = (
        r"CREATE[[:space:]]+(VIRTUAL[[:space:]]+TABLE|TABLE|UNIQUE[[:space:]]+INDEX|"
        r"FULLTEXT[[:space:]]+INDEX|VECTOR[[:space:]]+INDEX|INDEX)|"
        r"ALTER[[:space:]]+TABLE|Table\("
    )
    output = _git(
        repo,
        "grep",
        "-l",
        "-E",
        pattern,
        commit,
        "--",
        "src/powercontext/builtin",
    ).decode("utf-8")
    prefix = f"{commit}:"
    paths = {
        line.removeprefix(prefix)
        for line in output.splitlines()
        if line.endswith(".py")
    }
    paths.add("src/powercontext/builtin/persistence/schema.py")
    return sorted(paths)


def _field_default(node: ast.expr) -> object:
    if isinstance(node, ast.Constant):
        return node.value
    if (
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "Field"
    ):
        for keyword in node.keywords:
            if keyword.arg == "default":
                return _field_default(keyword.value)
    raise VerificationError("a frozen Python setting no longer has a literal default")


def _class_defaults(source: bytes) -> dict[str, dict[str, object]]:
    tree = ast.parse(source.decode("utf-8"))
    result: dict[str, dict[str, object]] = {}
    for node in tree.body:
        if not isinstance(node, ast.ClassDef):
            continue
        fields: dict[str, object] = {}
        for statement in node.body:
            if isinstance(statement, ast.AnnAssign) and isinstance(
                statement.target, ast.Name
            ):
                if statement.value is None:
                    continue
                try:
                    fields[statement.target.id] = _field_default(statement.value)
                except VerificationError:
                    continue
        result[node.name] = fields
    return result


def _unconditional_route_constants(source: bytes) -> set[str]:
    tree = ast.parse(source.decode("utf-8"))
    create_app = next(
        (
            node
            for node in tree.body
            if isinstance(node, ast.FunctionDef) and node.name == "create_app"
        ),
        None,
    )
    if create_app is None:
        raise VerificationError("cannot locate create_app in pinned Python Server")
    result: set[str] = set()
    for statement in create_app.body:
        if not isinstance(statement, ast.Expr) or not isinstance(
            statement.value, ast.Call
        ):
            continue
        call = statement.value
        if not isinstance(call.func, ast.Name) or call.func.id != "_add_route":
            continue
        if len(call.args) >= 2 and isinstance(call.args[1], ast.Name):
            result.add(call.args[1].id)
    return result


def _python_default_configuration(repo: Path, commit: str) -> dict[str, object]:
    server = _class_defaults(
        _git_blob(repo, commit, "src/powercontext/server/settings.py")
    )
    runtime = _class_defaults(
        _git_blob(repo, commit, "src/powercontext/builtin/runtime/config.py")
    )
    unconditional_routes = _unconditional_route_constants(
        _git_blob(repo, commit, "src/powercontext/server/app.py")
    )
    work_routes = {
        "CREATE_WORK_CONTRACT",
        "HANDOFF_CURRENT_WORK",
        "ACKNOWLEDGE_HANDOFF",
        "RECORD_TASK_OUTCOME",
    }
    if not work_routes.issubset(unconditional_routes):
        raise VerificationError(
            "pinned work routes are no longer unconditionally registered"
        )
    try:
        return {
            "dashboard.enabled": server["DashboardConfig"]["enabled"],
            "handoff_report.enabled": runtime["HandoffReportConfig"]["enabled"],
            "work_routes.feature_flag": None,
            "mcp.enabled": server["McpConfig"]["enabled"],
            "mcp.path": server["McpConfig"]["path"],
            "auth.enabled": server["BearerAuthConfig"]["enabled"],
            "metrics.enabled": server["MetricsConfig"]["enabled"],
            "tracing.enabled": server["TracingConfig"]["enabled"],
            "runtime.memory_rerank_enabled": runtime["RuntimeConfig"][
                "memory_rerank_enabled"
            ],
            "http.host": server["HttpConfig"]["host"],
            "http.port": server["HttpConfig"]["port"],
        }
    except KeyError as error:
        raise VerificationError(
            f"cannot derive frozen default configuration: missing {error}"
        ) from error


def _operation_constants(source: bytes) -> dict[str, str]:
    tree = ast.parse(source.decode("utf-8"))
    result: dict[str, str] = {}
    for node in tree.body:
        if not isinstance(node, ast.Assign) or len(node.targets) != 1:
            continue
        target = node.targets[0]
        if not isinstance(target, ast.Name) or not isinstance(node.value, ast.Call):
            continue
        for keyword in node.value.keywords:
            if keyword.arg == "operation_id" and isinstance(
                keyword.value, ast.Constant
            ):
                if isinstance(keyword.value.value, str):
                    result[target.id] = keyword.value.value
    return result


def _named_frozenset(source: bytes, name: str, constants: dict[str, str]) -> list[str]:
    tree = ast.parse(source.decode("utf-8"))
    for node in tree.body:
        if not isinstance(node, ast.Assign) or len(node.targets) != 1:
            continue
        target = node.targets[0]
        if (
            not isinstance(target, ast.Name)
            or target.id != name
            or not isinstance(node.value, ast.Call)
        ):
            continue
        if not node.value.args or not isinstance(
            node.value.args[0], (ast.Set, ast.List, ast.Tuple)
        ):
            break
        result: list[str] = []
        for element in node.value.args[0].elts:
            if not (
                isinstance(element, ast.Attribute)
                and element.attr == "operation_id"
                and isinstance(element.value, ast.Name)
            ):
                raise VerificationError(f"{name} contains a non-operation constant")
            try:
                result.append(constants[element.value.id])
            except KeyError as error:
                raise VerificationError(
                    f"{name} references unknown operation {element.value.id}"
                ) from error
        return sorted(result)
    raise VerificationError(f"cannot locate {name} in pinned Python MCP source")


def _literal_keywords(call: ast.Call) -> dict[str, object]:
    result: dict[str, object] = {}
    for keyword in call.keywords:
        if keyword.arg is None:
            continue
        if not isinstance(keyword.value, ast.Constant):
            continue
        result[keyword.arg] = keyword.value.value
    return result


def _tool_annotations(call_nodes: list[ast.AST]) -> dict[str, object]:
    for node in call_nodes:
        if not isinstance(node, ast.Call):
            continue
        function = node.func
        if isinstance(function, ast.Name) and function.id == "ToolAnnotations":
            return _literal_keywords(node)
    raise VerificationError("cannot locate ToolAnnotations in pinned Python source")


def _python_mcp_annotations(
    mcp_source: bytes,
    picker_source: bytes,
    constants: dict[str, str],
    read_only_ids: list[str],
) -> dict[str, object]:
    tree = ast.parse(mcp_source.decode("utf-8"))
    annotation_function = next(
        (
            node
            for node in tree.body
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
            and node.name == "_annotate_mcp_component"
        ),
        None,
    )
    if annotation_function is None:
        raise VerificationError("cannot locate _annotate_mcp_component")

    annotations: dict[str, object] = {"read_only_operation_ids": read_only_ids}
    for branch in (
        node for node in ast.walk(annotation_function) if isinstance(node, ast.If)
    ):
        test = branch.test
        key: str | None = None
        if (
            isinstance(test, ast.Compare)
            and len(test.ops) == 1
            and len(test.comparators) == 1
        ):
            comparator = test.comparators[0]
            if isinstance(test.ops[0], ast.In) and isinstance(comparator, ast.Name):
                if comparator.id == "_MCP_READ_ONLY_OPERATION_IDS":
                    key = "read_only_hints"
            elif (
                isinstance(test.ops[0], ast.Eq)
                and isinstance(comparator, ast.Attribute)
                and comparator.attr == "operation_id"
                and isinstance(comparator.value, ast.Name)
            ):
                key = constants.get(comparator.value.id)
        if key is not None:
            annotations[key] = _tool_annotations(
                [item for statement in branch.body for item in ast.walk(statement)]
            )

    provider_calls = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "OpenAPIProvider"
    ]
    if len(provider_calls) != 1:
        raise VerificationError(
            "expected one OpenAPIProvider in pinned Python MCP source"
        )
    provider_options = _literal_keywords(provider_calls[0])
    annotations["validate_output"] = provider_options.get("validate_output")

    picker_tree = ast.parse(picker_source.decode("utf-8"))
    picker_tools = [
        node
        for node in ast.walk(picker_tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "tool"
    ]
    if len(picker_tools) != 1:
        raise VerificationError("expected one handoff picker tool registration")
    picker_options = _literal_keywords(picker_tools[0])
    picker_annotation_calls = [
        node
        for node in ast.walk(picker_tools[0])
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "ToolAnnotations"
    ]
    if len(picker_annotation_calls) != 1:
        raise VerificationError("expected one picker ToolAnnotations declaration")
    annotations["handoff_workstream_picker"] = {
        "name": picker_options.get("name"),
        "registered_when": "handoff-report-routes-present",
        **_literal_keywords(picker_annotation_calls[0]),
    }
    return annotations


def _typer_model(
    source: bytes,
) -> tuple[dict[str, str], dict[str, str], set[str], list[str]]:
    tree = ast.parse(source.decode("utf-8"))
    app_names: dict[str, str] = {}
    parents: dict[str, str] = {}
    invokable: set[str] = set()
    commands: list[str] = []

    for node in tree.body:
        if not isinstance(node, ast.Assign) or len(node.targets) != 1:
            continue
        target = node.targets[0]
        if not isinstance(target, ast.Name) or not isinstance(node.value, ast.Call):
            continue
        function = node.value.func
        if not (isinstance(function, ast.Attribute) and function.attr == "Typer"):
            continue
        options = _literal_keywords(node.value)
        app_names[target.id] = str(
            options.get("name", target.id.removesuffix("_app").replace("_", "-"))
        )
        if options.get("invoke_without_command") is True:
            invokable.add(target.id)

    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
            continue
        if (
            node.func.attr == "add_typer"
            and isinstance(node.func.value, ast.Name)
            and node.args
        ):
            child = node.args[0]
            if isinstance(child, ast.Name) and child.id in app_names:
                options = _literal_keywords(node)
                if isinstance(options.get("name"), str):
                    app_names[child.id] = options["name"]
                if node.func.value.id in app_names:
                    parents[child.id] = node.func.value.id

    def app_path(app: str) -> str:
        name = app_names[app]
        return f"{app_path(parents[app])} {name}" if app in parents else name

    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        for decorator in node.decorator_list:
            if not isinstance(decorator, ast.Call) or not isinstance(
                decorator.func, ast.Attribute
            ):
                continue
            value = decorator.func.value
            if not isinstance(value, ast.Name) or value.id not in app_names:
                continue
            if decorator.func.attr == "command":
                command = node.name.replace("_", "-")
                if decorator.args and isinstance(decorator.args[0], ast.Constant):
                    if isinstance(decorator.args[0].value, str):
                        command = decorator.args[0].value
                commands.append(f"{app_path(value.id)} {command}")
            elif decorator.func.attr == "callback":
                options = _literal_keywords(decorator)
                if options.get("invoke_without_command") is True:
                    invokable.add(value.id)

    return app_names, parents, invokable, commands


def _python_cli_tree(repo: Path, commit: str) -> list[str]:
    commands = {"powercontext --version"}
    client_source = _git_blob(repo, commit, "src/powercontext/client/cli.py")
    client_tree = ast.parse(client_source.decode("utf-8"))
    app_names, parents, invokable, app_commands = _typer_model(client_source)
    commands.update(f"powercontext {command}" for command in app_commands)
    commands.update(
        f"powercontext {app_names[app]}" for app in invokable if app not in parents
    )

    for node in ast.walk(client_tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Call):
            continue
        inner = node.func
        if (
            not isinstance(inner.func, ast.Attribute)
            or inner.func.attr != "command"
            or not node.args
        ):
            continue
        command_function = node.args[0]
        if isinstance(command_function, ast.Name):
            commands.add(f"powercontext {command_function.id.replace('_', '-')}")

    pyproject = tomllib.loads(_git_blob(repo, commit, "pyproject.toml").decode("utf-8"))
    entry_points = pyproject["project"]["entry-points"]["powercontext.cli"]
    if not isinstance(entry_points, dict):
        raise VerificationError("powercontext.cli entry points must be a mapping")
    visited_modules: set[str] = set()
    for target in entry_points.values():
        if not isinstance(target, str):
            raise VerificationError(
                "powercontext.cli entry point target must be a string"
            )
        module, _, variable = target.partition(":")
        if not module or not variable or module in visited_modules:
            continue
        visited_modules.add(module)
        path = module.replace(".", "/") + ".py"
        source = _git_blob(repo, commit, f"src/{path}")
        module_apps, module_parents, module_invokable, module_commands = _typer_model(
            source
        )
        if variable not in module_apps:
            raise VerificationError(
                f"CLI entry point {target} does not name a Typer app"
            )
        root_name = module_apps[variable]
        commands.update(f"powercontext {command}" for command in module_commands)
        if variable in module_invokable and variable not in module_parents:
            commands.add(f"powercontext {root_name}")

    return sorted(commands)


def _verify_analyzer_policy_lock(lock: dict[str, Any]) -> None:
    policy = _require_mapping(
        lock.get("analyzer_prompt_policy"), "analyzer_prompt_policy"
    )
    sources = _require_mapping(
        lock.get("analyzer_prompt_policy_sources"),
        "analyzer_prompt_policy_sources",
    )
    if set(policy) != set(_ANALYZER_POLICY_KEYS):
        raise VerificationError("analyzer_prompt_policy keys are incomplete")
    if set(sources) != set(policy):
        raise VerificationError(
            "analyzer_prompt_policy_sources keys must match the policy"
        )
    for key, identity in policy.items():
        _require_string(identity, f"analyzer_prompt_policy.{key}")
        source = _require_mapping(sources[key], f"analyzer_prompt_policy_sources.{key}")
        kind = _require_string(source.get("kind"), f"{key} kind")
        _require_string(source.get("path"), f"{key} path")
        if kind == "governance-label":
            _require_string(source.get("marker"), f"{key} marker")
        elif kind != "python-literal":
            raise VerificationError(f"{key} has an unsupported source kind")


def _analyzer_manifest_identity() -> str:
    manifest = read_yaml_mapping(MANIFEST_PATH)
    for capability in _require_list(
        manifest.get("domain_capabilities"), "domain_capabilities"
    ):
        entry = _require_mapping(capability, "domain capability")
        if entry.get("id") == "memory-analyzer-v1":
            return _require_string(entry.get("identity"), "memory-analyzer-v1 identity")
    raise VerificationError("capability manifest is missing memory-analyzer-v1")


def _verify_analyzer_policy_sources(
    repo: Path, commit: str, lock: dict[str, Any]
) -> None:
    policy = _require_mapping(
        lock.get("analyzer_prompt_policy"), "analyzer_prompt_policy"
    )
    sources = _require_mapping(
        lock.get("analyzer_prompt_policy_sources"),
        "analyzer_prompt_policy_sources",
    )
    if policy["analyzer_id"] != _analyzer_manifest_identity():
        raise VerificationError(
            "analyzer_id does not match capability manifest identity"
        )
    for key, identity in policy.items():
        source = _require_mapping(sources[key], f"analyzer_prompt_policy_sources.{key}")
        blob = _git_blob(repo, commit, str(source["path"])).decode("utf-8")
        if source["kind"] == "python-literal" and identity not in blob:
            raise VerificationError(
                f"{key} identity is absent from pinned {source['path']}"
            )
        if source["kind"] != "governance-label":
            continue
        if str(source["marker"]) not in blob:
            raise VerificationError(
                f"{key} marker is absent from pinned {source['path']}"
            )
        if "def analyze_text" not in blob:
            raise VerificationError("pinned Analyzer v1 function is missing")


def _verify_internal(lock: dict[str, Any]) -> dict[str, int]:
    if lock.get("schema") != "powercontext.parity-baseline.v1":
        raise VerificationError("unsupported baseline lock schema")
    if lock.get("lock_status") != "frozen" or lock.get("phase") != 0:
        raise VerificationError("baseline lock must be frozen for Phase 0")
    commit = _require_string(lock.get("python_commit"), "python_commit")
    if _COMMIT.fullmatch(commit) is None:
        raise VerificationError("python_commit must be a full lowercase commit SHA")
    package_pin = _require_string(lock.get("python_package_pin"), "python_package_pin")
    if not package_pin.endswith(f"@{commit}"):
        raise VerificationError("python_package_pin must reference python_commit")
    if lock.get("oracle_dependency_lock_mode") != (
        "export-python-source-at-python_commit-and-run-uv-sync-locked"
    ):
        raise VerificationError("unsupported oracle_dependency_lock_mode")
    if lock.get("contract_sync_version") != EXPECTED_SYNC_VERSION:
        raise VerificationError(
            "contract_sync_version does not match tools/contract-sync/VERSION"
        )
    if lock.get("structured_digest_algorithm") != "canonical-json-sha256-v1":
        raise VerificationError("unsupported structured_digest_algorithm")
    if lock.get("openapi_path") != "contract/openapi/powercontext.yaml":
        raise VerificationError("openapi_path does not name the checked-in snapshot")
    if lock.get("openapi_digest_encoding") != "git-blob-lf":
        raise VerificationError("unsupported openapi_digest_encoding")

    digest = file_sha256(OPENAPI_PATH)
    if digest != _require_sha256(lock.get("openapi_sha256"), "openapi_sha256"):
        raise VerificationError(f"OpenAPI SHA-256 {digest} does not match the lock")
    openapi_bytes = normalize_lf(OPENAPI_PATH.read_bytes())
    if len(openapi_bytes) != lock.get("openapi_bytes"):
        raise VerificationError("OpenAPI byte count does not match the lock")
    text = openapi_bytes.decode("utf-8")
    operations = count_operation_ids(text)
    schemas = count_schema_names(text)
    if len(operations) != lock.get("operation_count"):
        raise VerificationError("OpenAPI operation count does not match the lock")
    if len(schemas) != lock.get("schema_count"):
        raise VerificationError("OpenAPI schema count does not match the lock")
    openapi = read_yaml_mapping(OPENAPI_PATH)
    info = _require_mapping(openapi.get("info"), "OpenAPI info")
    if str(info.get("version")) != str(lock.get("api_version")):
        raise VerificationError("OpenAPI API version does not match the lock")

    mcp_ids = _require_list(lock.get("mcp_operation_ids"), "mcp_operation_ids")
    if not all(isinstance(operation_id, str) for operation_id in mcp_ids):
        raise VerificationError("mcp_operation_ids must contain strings")
    if mcp_ids != sorted(set(mcp_ids)):
        raise VerificationError("mcp_operation_ids must be unique and lexically sorted")
    if len(mcp_ids) != lock.get("mcp_operation_count"):
        raise VerificationError("MCP operation count does not match the lock")
    if not set(mcp_ids).issubset(operations):
        raise VerificationError(
            "MCP allowlist contains an operation absent from OpenAPI"
        )
    mcp_annotations = _require_mapping(lock.get("mcp_annotations"), "mcp_annotations")
    if lock.get("mcp_digest_scope") != "sorted-operation-ids-and-complete-annotations":
        raise VerificationError("unsupported mcp_digest_scope")
    mcp_digest = canonical_json_sha256(
        {"operation_ids": mcp_ids, "annotations": mcp_annotations}
    )
    if mcp_digest != _require_sha256(
        lock.get("mcp_allowlist_digest"), "mcp_allowlist_digest"
    ):
        raise VerificationError(
            "MCP operation/annotation digest does not match the lock"
        )

    cli_tree = _require_list(lock.get("cli_command_tree"), "cli_command_tree")
    if not all(isinstance(command, str) for command in cli_tree):
        raise VerificationError("cli_command_tree must contain strings")
    if (
        cli_tree != sorted(set(cli_tree))
        or lock.get("cli_command_tree_order") != "lexical"
    ):
        raise VerificationError("cli_command_tree must be unique and lexically sorted")
    if canonical_json_sha256(cli_tree) != _require_sha256(
        lock.get("cli_command_tree_digest"), "cli_command_tree_digest"
    ):
        raise VerificationError("CLI command tree digest does not match the lock")

    defaults = _require_mapping(
        lock.get("default_configuration"), "default_configuration"
    )
    if canonical_json_sha256(defaults) != _require_sha256(
        lock.get("default_configuration_digest"), "default_configuration_digest"
    ):
        raise VerificationError("default configuration digest does not match the lock")

    schema_files = _require_list(
        lock.get("database_schema_files"), "database_schema_files"
    )
    normalized_schema_files: list[dict[str, str]] = []
    for index, entry_value in enumerate(schema_files):
        entry = _require_mapping(entry_value, f"database_schema_files[{index}]")
        normalized_schema_files.append(
            {
                "path": _require_string(entry.get("path"), "database schema path"),
                "sha256": _require_sha256(
                    entry.get("sha256"), "database schema source SHA-256"
                ),
            }
        )
    if [entry["path"] for entry in normalized_schema_files] != sorted(
        {entry["path"] for entry in normalized_schema_files}
    ):
        raise VerificationError(
            "database_schema_files must be unique and lexically sorted"
        )
    if (
        lock.get("database_schema_digest_algorithm")
        != "canonical-json-source-manifest-sha256-v1"
    ):
        raise VerificationError("unsupported database_schema_digest_algorithm")
    if (
        lock.get("database_schema_source_selector")
        != "sqlalchemy-table-or-explicit-create-alter-ddl-plus-schema-orchestrator-v1"
    ):
        raise VerificationError("unsupported database_schema_source_selector")
    if source_manifest_sha256(normalized_schema_files) != _require_sha256(
        lock.get("database_schema_digest"), "database_schema_digest"
    ):
        raise VerificationError(
            "database schema source manifest digest does not match the lock"
        )

    _require_sha256(
        lock.get("oracle_dependency_lock_sha256"), "oracle_dependency_lock_sha256"
    )
    _require_string(lock.get("database_contract_version"), "database_contract_version")
    _require_string(
        lock.get("conformance_contract_version"), "conformance_contract_version"
    )
    expected_profiles = {
        "client",
        "sqlite-fts",
        "sqlite-vector",
        "oceanbase-hybrid",
        "full-product",
    }
    profiles = _require_list(lock.get("profiles"), "profiles")
    if set(profiles) != expected_profiles or len(profiles) != len(expected_profiles):
        raise VerificationError(
            "baseline profiles must contain the five standard profiles"
        )
    if lock.get("node_versions") != [22, 24]:
        raise VerificationError("Node Client targets must be 22 and 24")
    if lock.get("node_client_targets") != [22, 24]:
        raise VerificationError("node_client_targets must be 22 and 24")
    if lock.get("node_runtime_baseline") != 24 or lock.get("node_eol_excluded") != [20]:
        raise VerificationError(
            "Node Runtime baseline/exclusion does not match ADR 0007"
        )
    supported_matrix = _require_mapping(
        lock.get("supported_matrix"), "supported_matrix"
    )
    _verify_phase1_ci_evidence(lock, supported_matrix)

    _verify_analyzer_policy_lock(lock)
    try:
        counts = validate_manifest(
            expected_commit=commit,
            expected_api_version=str(lock.get("api_version")),
            expected_profiles=expected_profiles,
        )
    except (ManifestValidationError, ValueError) as error:
        raise VerificationError(str(error)) from error
    if counts["operations"] != len(operations) or counts["schemas"] != len(schemas):
        raise VerificationError("capability manifest counts do not match OpenAPI")
    return {**counts, "mcp_operations": len(mcp_ids), "cli_commands": len(cli_tree)}


def _verify_python_source(repo: Path, lock: dict[str, Any]) -> None:
    if not repo.is_dir():
        raise VerificationError(f"Python repository does not exist: {repo}")
    commit = _require_string(lock.get("python_commit"), "python_commit")
    _git(repo, "cat-file", "-e", f"{commit}^{{commit}}")

    pyproject = tomllib.loads(_git_blob(repo, commit, "pyproject.toml").decode("utf-8"))
    project = _require_mapping(pyproject.get("project"), "pinned Python project")
    if project.get("name") != lock.get("python_package_name"):
        raise VerificationError(
            "python_package_name does not match pinned pyproject.toml"
        )
    if project.get("requires-python") != lock.get("python_requires"):
        raise VerificationError("python_requires does not match pinned pyproject.toml")

    pinned_openapi = _git_blob(repo, commit, "openapi/powercontext.yaml")
    if normalize_lf(pinned_openapi) != normalize_lf(OPENAPI_PATH.read_bytes()):
        raise VerificationError("OpenAPI snapshot is not the pinned Python blob")

    oracle_lock_path = _require_string(
        lock.get("oracle_dependency_lock_path"), "oracle_dependency_lock_path"
    )
    oracle_lock = _git_blob(repo, commit, oracle_lock_path)
    if sha256_bytes(oracle_lock) != lock.get("oracle_dependency_lock_sha256"):
        raise VerificationError("pinned Python dependency lock SHA-256 does not match")

    schema_files = _require_list(
        lock.get("database_schema_files"), "database_schema_files"
    )
    locked_schema_paths = [
        _require_string(
            _require_mapping(entry, "database schema source entry").get("path"),
            "database schema source path",
        )
        for entry in schema_files
    ]
    derived_schema_paths = _python_database_schema_files(repo, commit)
    if locked_schema_paths != derived_schema_paths:
        missing = sorted(set(derived_schema_paths) - set(locked_schema_paths))
        extra = sorted(set(locked_schema_paths) - set(derived_schema_paths))
        raise VerificationError(
            "database schema source manifest is incomplete; "
            f"missing={missing}, extra={extra}"
        )
    for entry_value in schema_files:
        entry = _require_mapping(entry_value, "database schema source entry")
        path = _require_string(entry.get("path"), "database schema source path")
        digest = sha256_bytes(_git_blob(repo, commit, path))
        if digest != entry.get("sha256"):
            raise VerificationError(f"database schema source digest mismatch: {path}")

    ledger = read_yaml_mapping(RFC_LEDGER_PATH)
    if lock.get("rfc_ledger") != "docs/governance/rfc-ledger.yaml":
        raise VerificationError("rfc_ledger does not name the verified ledger")
    if ledger.get("schema") != "powercontext.rfc-ledger.v1":
        raise VerificationError("unsupported RFC ledger schema")
    if ledger.get("baseline_commit") != commit:
        raise VerificationError("RFC ledger baseline_commit does not match the lock")
    rfc_entries = _require_list(ledger.get("rfcs"), "RFC ledger entries")
    allowed_rfc_statuses = {
        "implemented",
        "accepted-not-implemented",
        "draft",
        "superseded",
    }
    ledger_ids: list[str] = []
    for entry_value in rfc_entries:
        entry = _require_mapping(entry_value, "RFC entry")
        rfc_id = _require_string(entry.get("id"), "RFC id")
        if re.fullmatch(r"\d{4}", rfc_id) is None:
            raise VerificationError(f"RFC id is not four digits: {rfc_id}")
        if entry.get("status") not in allowed_rfc_statuses:
            raise VerificationError(f"RFC {rfc_id} has an unsupported status")
        if not isinstance(entry.get("parity_source"), bool):
            raise VerificationError(f"RFC {rfc_id} parity_source must be boolean")
        if entry.get("status") != "implemented" and entry.get("parity_source"):
            raise VerificationError(
                f"RFC {rfc_id} cannot be a parity source with status {entry.get('status')}"
            )
        ledger_ids.append(rfc_id)
    if len(ledger_ids) != len(set(ledger_ids)):
        raise VerificationError("RFC ledger contains duplicate IDs")
    tree_paths = (
        _git(repo, "ls-tree", "-r", "--name-only", commit, "docs/en/rfcs")
        .decode("utf-8")
        .splitlines()
    )
    source_ids = sorted(
        match.group(1)
        for path in tree_paths
        if (match := re.fullmatch(r"docs/en/rfcs/(\d{4})_.+\.md", path)) is not None
    )
    if sorted(ledger_ids) != source_ids:
        missing = sorted(set(source_ids) - set(ledger_ids))
        extra = sorted(set(ledger_ids) - set(source_ids))
        raise VerificationError(
            f"RFC ledger does not match the pin; missing={missing}, extra={extra}"
        )

    cli_tree = _python_cli_tree(repo, commit)
    if cli_tree != lock.get("cli_command_tree"):
        missing = sorted(set(cli_tree) - set(lock.get("cli_command_tree", [])))
        extra = sorted(set(lock.get("cli_command_tree", [])) - set(cli_tree))
        raise VerificationError(
            f"CLI tree does not match the pin; missing={missing}, extra={extra}"
        )

    generated_operations = _operation_constants(
        _git_blob(repo, commit, "src/powercontext/http/_generated/operations.py")
    )
    mcp_source = _git_blob(repo, commit, "src/powercontext/server/mcp.py")
    mcp_ids = _named_frozenset(mcp_source, "_MCP_OPERATION_IDS", generated_operations)
    read_only_ids = _named_frozenset(
        mcp_source, "_MCP_READ_ONLY_OPERATION_IDS", generated_operations
    )
    if mcp_ids != lock.get("mcp_operation_ids"):
        raise VerificationError("MCP allowlist does not match pinned Python")
    source_annotations = _python_mcp_annotations(
        mcp_source,
        _git_blob(repo, commit, "src/powercontext/server/handoff_picker.py"),
        generated_operations,
        read_only_ids,
    )
    if source_annotations != lock.get("mcp_annotations"):
        raise VerificationError(
            "MCP annotations or picker semantics do not match pinned Python"
        )

    source_defaults = _python_default_configuration(repo, commit)
    if source_defaults != lock.get("default_configuration"):
        raise VerificationError("default configuration does not match pinned Python")
    _verify_analyzer_policy_sources(repo, commit, lock)


def _arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--python-repo",
        type=Path,
        help="Python reference checkout; defaults to python_repo_local from the lock.",
    )
    parser.add_argument(
        "--snapshot-only",
        action="store_true",
        help="Verify checked-in assets only; Phase 0 exit requires the default source verification.",
    )
    return parser.parse_args()


def main() -> None:
    arguments = _arguments()
    try:
        lock = read_lock()
        counts = _verify_internal(lock)
        source_verified = not arguments.snapshot_only
        if source_verified:
            configured_repo = arguments.python_repo
            if configured_repo is None:
                configured_repo = ROOT / _require_string(
                    lock.get("python_repo_local"), "python_repo_local"
                )
            _verify_python_source(configured_repo.resolve(), lock)
    except (OSError, UnicodeError, VerificationError, ValueError) as error:
        print(f"contract-sync verify failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error

    print("contract-sync verify passed")
    print(f"python_commit={lock['python_commit']}")
    print(f"source_verified={str(source_verified).lower()}")
    print(f"openapi_sha256={lock['openapi_sha256']}")
    print(
        f"operations={counts['operations']} schemas={counts['schemas']} "
        f"domain_capabilities={counts['domain_capabilities']}"
    )
    print(
        f"mcp_operations={counts['mcp_operations']} cli_commands={counts['cli_commands']}"
    )


if __name__ == "__main__":
    main()

# Copyright (c) 2026 OceanBase.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.

"""Validate Phase 0 operation and domain capability ownership."""

from __future__ import annotations

from typing import Any

from lockfile import OPENAPI_PATH, ROOT, read_yaml_mapping

MANIFEST = ROOT / "docs" / "governance" / "capability-manifest.yaml"
_HTTP_METHODS = frozenset(
    {"delete", "get", "head", "options", "patch", "post", "put", "trace"}
)
_MILESTONES = frozenset({"M1", "M2", "M3", "M4"})
_LEVELS = frozenset({"C0", "C1", "C2", "C3", "C4", "C5"})
_UNIMPLEMENTED_SURFACES = frozenset(
    {"http", "capabilities", "mcp", "cli", "persistence"}
)


class ManifestValidationError(ValueError):
    """Report one actionable capability manifest defect."""


def _require_mapping(value: object, description: str) -> dict[str, Any]:
    if not isinstance(value, dict) or not all(isinstance(key, str) for key in value):
        raise ManifestValidationError(f"{description} must be a string-keyed mapping")
    return value


def _require_list(value: object, description: str) -> list[Any]:
    if not isinstance(value, list):
        raise ManifestValidationError(f"{description} must be a list")
    return value


def _operation_contract(openapi: dict[str, Any]) -> dict[str, str]:
    paths = _require_mapping(openapi.get("paths"), "OpenAPI paths")
    result: dict[str, str] = {}
    for path, path_item_value in paths.items():
        path_item = _require_mapping(path_item_value, f"OpenAPI path {path}")
        for method, operation_value in path_item.items():
            if method not in _HTTP_METHODS:
                continue
            operation = _require_mapping(
                operation_value, f"OpenAPI operation {method.upper()} {path}"
            )
            operation_id = operation.get("operationId")
            tags = operation.get("tags")
            if not isinstance(operation_id, str):
                raise ManifestValidationError(
                    f"{method.upper()} {path} has no operationId"
                )
            if operation_id in result:
                raise ManifestValidationError(
                    f"duplicate OpenAPI operationId: {operation_id}"
                )
            if (
                not isinstance(tags, list)
                or len(tags) != 1
                or not isinstance(tags[0], str)
            ):
                raise ManifestValidationError(
                    f"{operation_id} must have exactly one string tag"
                )
            result[operation_id] = tags[0]
    return result


def _target_profiles(
    target_name: str, target: dict[str, Any], profiles: set[str]
) -> list[str]:
    raw_profiles = target.get("profiles")
    if raw_profiles is None and target_name in profiles:
        return [target_name]
    values = _require_list(raw_profiles, f"target {target_name} profiles")
    if not values or not all(isinstance(profile, str) for profile in values):
        raise ManifestValidationError(
            f"target {target_name} profiles must contain strings"
        )
    return values


def _validate_target(
    capability_id: str,
    target_name: str,
    target_value: object,
    profiles: set[str],
) -> None:
    target = _require_mapping(target_value, f"{capability_id} target {target_name}")
    if target.get("milestone") not in _MILESTONES:
        raise ManifestValidationError(
            f"{capability_id} target {target_name} has an invalid milestone"
        )
    if target.get("level") not in _LEVELS:
        raise ManifestValidationError(
            f"{capability_id} target {target_name} has an invalid parity level"
        )
    unknown_profiles = set(_target_profiles(target_name, target, profiles)) - profiles
    if unknown_profiles:
        raise ManifestValidationError(
            f"{capability_id} target {target_name} references unknown profiles: {sorted(unknown_profiles)}"
        )


def validate_manifest(
    *,
    expected_commit: str | None = None,
    expected_api_version: str | None = None,
    expected_profiles: set[str] | None = None,
) -> dict[str, int]:
    """Validate exact OpenAPI coverage plus owner, milestone, level and profile assignments."""

    manifest = read_yaml_mapping(MANIFEST)
    openapi = read_yaml_mapping(OPENAPI_PATH)
    if manifest.get("schema") != "powercontext.capability-manifest.v1":
        raise ManifestValidationError("unsupported capability manifest schema")
    if manifest.get("status") != "phase-0-frozen":
        raise ManifestValidationError("capability manifest must be frozen for Phase 0")
    if (
        expected_commit is not None
        and manifest.get("baseline_commit") != expected_commit
    ):
        raise ManifestValidationError(
            "capability manifest baseline_commit does not match baseline.lock.yaml"
        )
    if (
        expected_api_version is not None
        and str(manifest.get("api_version")) != expected_api_version
    ):
        raise ManifestValidationError(
            "capability manifest api_version does not match baseline.lock.yaml"
        )

    owners = set(_require_mapping(manifest.get("owners"), "manifest owners"))
    profile_entries = _require_mapping(manifest.get("profiles"), "manifest profiles")
    profiles = set(profile_entries)
    if not owners or not profiles:
        raise ManifestValidationError("manifest owners and profiles must not be empty")
    if expected_profiles is not None and profiles != expected_profiles:
        raise ManifestValidationError(
            "capability manifest profiles do not match baseline.lock.yaml"
        )
    for profile_name, profile_value in profile_entries.items():
        profile = _require_mapping(profile_value, f"profile {profile_name}")
        if profile.get("first_milestone") not in _MILESTONES:
            raise ManifestValidationError(
                f"profile {profile_name} has an invalid first_milestone"
            )
        if profile.get("target_level") not in _LEVELS:
            raise ManifestValidationError(
                f"profile {profile_name} has an invalid target_level"
            )

    unimplemented = set(
        _require_mapping(
            manifest.get("unimplemented_defaults"), "unimplemented_defaults"
        )
    )
    if unimplemented != _UNIMPLEMENTED_SURFACES:
        raise ManifestValidationError(
            "unimplemented_defaults must define exactly "
            f"{sorted(_UNIMPLEMENTED_SURFACES)}"
        )

    contract_operations = _operation_contract(openapi)
    operation_entries = _require_list(manifest.get("operations"), "manifest operations")
    operations: dict[str, dict[str, Any]] = {}
    for index, value in enumerate(operation_entries):
        operation = _require_mapping(value, f"manifest operation #{index + 1}")
        operation_id = operation.get("id")
        if not isinstance(operation_id, str):
            raise ManifestValidationError(
                f"manifest operation #{index + 1} has no string id"
            )
        if operation_id in operations:
            raise ManifestValidationError(
                f"duplicate manifest operation id: {operation_id}"
            )
        operations[operation_id] = operation

    missing = sorted(set(contract_operations) - set(operations))
    extra = sorted(set(operations) - set(contract_operations))
    if missing or extra:
        raise ManifestValidationError(
            f"operation coverage mismatch; missing={missing}, extra={extra}"
        )

    for operation_id, operation in operations.items():
        if operation.get("tag") != contract_operations[operation_id]:
            raise ManifestValidationError(f"{operation_id} tag does not match OpenAPI")
        if operation.get("owner") not in owners:
            raise ManifestValidationError(f"{operation_id} references an unknown owner")
        targets = _require_mapping(operation.get("targets"), f"{operation_id} targets")
        if "client" not in targets:
            raise ManifestValidationError(f"{operation_id} has no M1 client target")
        for target_name, target in targets.items():
            _validate_target(operation_id, target_name, target, profiles)

    domain_entries = _require_list(
        manifest.get("domain_capabilities"), "domain_capabilities"
    )
    domain_ids: set[str] = set()
    for index, value in enumerate(domain_entries):
        capability = _require_mapping(value, f"domain capability #{index + 1}")
        capability_id = capability.get("id")
        if not isinstance(capability_id, str):
            raise ManifestValidationError(
                f"domain capability #{index + 1} has no string id"
            )
        if capability_id in domain_ids or capability_id in operations:
            raise ManifestValidationError(f"duplicate capability id: {capability_id}")
        domain_ids.add(capability_id)
        if capability.get("owner") not in owners:
            raise ManifestValidationError(
                f"{capability_id} references an unknown owner"
            )
        if capability.get("target_milestone") not in _MILESTONES:
            raise ManifestValidationError(
                f"{capability_id} has an invalid target_milestone"
            )
        if capability.get("target_level") not in _LEVELS:
            raise ManifestValidationError(
                f"{capability_id} has an invalid target_level"
            )
        capability_profiles = _require_list(
            capability.get("profiles"), f"{capability_id} profiles"
        )
        if not capability_profiles or not all(
            isinstance(profile, str) for profile in capability_profiles
        ):
            raise ManifestValidationError(
                f"{capability_id} profiles must contain strings"
            )
        unknown_profiles = set(capability_profiles) - profiles
        if unknown_profiles:
            raise ManifestValidationError(
                f"{capability_id} references unknown profiles: {sorted(unknown_profiles)}"
            )

    components = _require_mapping(openapi.get("components"), "OpenAPI components")
    schemas = _require_mapping(components.get("schemas"), "OpenAPI schemas")
    return {
        "operations": len(operations),
        "schemas": len(schemas),
        "domain_capabilities": len(domain_ids),
    }


def main() -> None:
    try:
        counts = validate_manifest()
    except (ManifestValidationError, ValueError) as error:
        print(f"capability manifest check failed: {error}")
        raise SystemExit(1) from error
    print(
        "capability manifest check passed: "
        f"operations={counts['operations']} schemas={counts['schemas']} "
        f"domain_capabilities={counts['domain_capabilities']}"
    )


if __name__ == "__main__":
    main()

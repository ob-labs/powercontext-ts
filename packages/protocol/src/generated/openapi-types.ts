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

/* DO NOT EDIT.
 * Generated openapi-typescript wire types.
 * source: contract/openapi/powercontext.yaml
 * sourceDigest: a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3
 * generatorVersion: 0.2.0-phase2
 */
export interface paths {
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get process liveness */
        get: operations["get_liveness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get deployment readiness */
        get: operations["get_readiness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get runtime capabilities */
        get: operations["get_capabilities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Capture durable ContentSource evidence
         * @description Accept raw content as an idempotent Source without synchronously deriving Artifacts.
         */
        post: operations["capture_content_source"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/context/prepare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Prepare bounded context for an Agent turn
         * @description Prepare final, ephemeral context from Runtime-owned sources without persisting or injecting it.
         */
        post: operations["prepare_context"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/work/contracts/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a grounded Work Contract
         * @description Persist an inspectable delegation baseline without granting execution authority.
         */
        post: operations["create_work_contract"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/work/handoffs/prepare-current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Hand off current work in one high-level operation
         * @description Capture an inspected boundary and prepare a temporary evidence-bearing Handoff without committing it.
         */
        post: operations["handoff_current_work"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/work/handoffs/acknowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resolve and acknowledge a Handoff
         * @description Re-resolve one prepared or exact Handoff, check evidence, and capture the receiver's explicit live-state, capability, and authorization checks.
         */
        post: operations["acknowledge_handoff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/work/outcomes/record": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Record a completion-aware Task Outcome
         * @description Preserve one attempt's status and checks, optionally linked to the exact accepted Handoff Receipt that the result covers.
         */
        post: operations["record_task_outcome"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Activate Handoff generation at a Source boundary
         * @description Evaluate the standard Handoff Trigger and synchronously execute any emitted PrepareHandoff Action.
         */
        post: operations["activate_handoff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff/prepare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate an inspectable Handoff Draft */
        post: operations["prepare_handoff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff/finalize": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Finalize an inspected Handoff Draft */
        post: operations["finalize_handoff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff/commit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Commit an explicit Handoff milestone */
        post: operations["commit_handoff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff/continue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resolve a Handoff as untrusted historical input */
        post: operations["continue_handoff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/flush": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Process the pending Source window into Memory
         * @description Run one bounded Source-to-Memory activation for operational control and testing.
         */
        post: operations["flush_memory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/remember": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Remember explicit Memory content
         * @description Save one already-curated Memory entry without creating a Source or invoking extraction.
         */
        post: operations["remember_memory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Search active Memory entries
         * @description Retrieve relevant active Memory entries within one explicit application scope.
         */
        post: operations["search_memory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/entries/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * List Memory entries
         * @description Read active entries from the current Memory head. Inactive entries are available only when explicitly requested for audit.
         */
        post: operations["list_memory_entries"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/entries/get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Get an exact Memory entry version
         * @description Resolve an immutable entry citation within one Memory Revision.
         */
        post: operations["get_memory_entry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/entries/revise": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Revise an exact Memory entry
         * @description Replace active entry content against an explicit current Memory Revision.
         */
        post: operations["revise_memory_entry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/entries/retire": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retire an exact Memory entry
         * @description Deactivate an entry against an explicit current Memory Revision without deleting history.
         */
        post: operations["retire_memory_entry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/memory/changes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * List Memory Revision changes
         * @description Read compact entry changes without expanding entry bodies.
         */
        post: operations["list_memory_changes"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/experience/propose": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Propose Experience content
         * @description Persist a pending Experience Candidate without creating an Artifact Revision.
         */
        post: operations["propose_experience"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/experience/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate an Experience Candidate
         * @description Use the configured model and caller-selected exact evidence; persist only a schema-valid pending Candidate.
         */
        post: operations["generate_experience"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/experience/get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Get an exact Experience Revision
         * @description Read approved Experience content and its exact direct evidence.
         */
        post: operations["get_experience"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/skill/propose": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Propose managed Skill content
         * @description Persist a pending managed Skill Candidate without creating an Artifact Revision.
         */
        post: operations["propose_skill"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/skill/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate a managed Skill Candidate
         * @description Use the configured model with an explicit provenance shape; persist only a schema-valid pending Candidate.
         */
        post: operations["generate_skill"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/skill/get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Get an exact managed Skill Revision
         * @description Read approved managed Skill content and its exact direct evidence.
         */
        post: operations["get_skill"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external-skills/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Scan configured external Skill roots
         * @description Replace the current host-local Registry projection without copying or rewriting package content.
         */
        post: operations["scan_external_skills"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external-skills/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * List external Skills visible on this host
         * @description Return live local resolutions; unavailable registrations are omitted unless explicitly requested.
         */
        post: operations["list_external_skills"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external-skills/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resolve an exact external Skill fingerprint
         * @description Resolve only the registered local package version requested by the caller; never install or fall back.
         */
        post: operations["resolve_external_skill"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/external-skills/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Import or fork an external Skill into Review
         * @description Capture one exact local snapshot and use the configured model to propose a new managed Skill Candidate.
         */
        post: operations["import_external_skill"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/artifact-candidates/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * List Artifact Candidates
         * @description Page current Candidate heads; pending is the default Review Inbox view.
         */
        post: operations["list_artifact_candidates"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/artifact-candidates/get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Get an Artifact Candidate
         * @description Read the current head and exact immutable proposal version.
         */
        post: operations["get_artifact_candidate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/artifact-candidates/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve an Artifact Candidate
         * @description Commit the reviewed proposal and mark the Candidate approved in one transaction.
         */
        post: operations["approve_artifact_candidate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/artifact-candidates/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reject an Artifact Candidate
         * @description Move the exact pending version to its rejected terminal state without writing an Artifact.
         */
        post: operations["reject_artifact_candidate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/artifact-candidates/revise": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Revise an Artifact Candidate
         * @description Append a complete replacement proposal as the next immutable pending version.
         */
        post: operations["revise_artifact_candidate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get scoped product statistics */
        get: operations["get_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/projects/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create a Handoff Report Project */
        post: operations["create_handoff_report_project"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/projects/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** List Handoff Report Projects */
        post: operations["list_handoff_report_projects"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/projects/get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Get a Handoff Report Project */
        post: operations["get_handoff_report_project"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/projects/update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update a Handoff Report Project */
        post: operations["update_handoff_report_project"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/workstreams/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register a Handoff Report Workstream */
        post: operations["register_handoff_report_workstream"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/workstreams/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** List Handoff Report Workstreams */
        post: operations["list_handoff_report_workstreams"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/workstreams/update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update a Handoff Report Workstream */
        post: operations["update_handoff_report_workstream"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate a Handoff Report */
        post: operations["get_handoff_report"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/activities/record": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Record a Handoff Report Activity */
        post: operations["record_handoff_report_activity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/activities/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** List Handoff Report Activities */
        post: operations["list_handoff_report_activities"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/activities/purge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Purge Handoff Report Activities */
        post: operations["purge_handoff_report_activities"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/workspace-bindings/get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Get a Handoff Report Workspace Binding */
        post: operations["get_handoff_report_workspace"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/workspace-bindings/attach": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Attach a Handoff Report Workspace Binding */
        post: operations["attach_handoff_report_workspace"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/handoff-reports/workspace-bindings/detach": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Detach a Handoff Report Workspace Binding */
        post: operations["detach_handoff_report_workspace"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ActivateHandoffRequest: {
            scope_id: string;
            boundary_source: components["schemas"]["SourceReference"];
            objective: string;
            /** @default [] */
            evidence: components["schemas"]["HandoffCitation"][];
            /** @default 8000 */
            max_bytes: number;
        };
        ArtifactReference: {
            family: string;
            artifact_id: string;
            revision: number;
        };
        ArtifactCandidate: {
            candidate_id: string;
            version: number;
            family: components["schemas"]["CandidateFamily"];
            status: components["schemas"]["CandidateStatus"];
            proposal: components["schemas"]["ExperienceProposal"] | components["schemas"]["SkillProposal"];
            /** @description Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references. */
            source_refs: components["schemas"]["SourceReference"][];
            /** @description Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references. */
            artifact_refs: components["schemas"]["ArtifactReference"][];
            target: components["schemas"]["ArtifactReference"];
            reason: string | null;
            result_artifact: components["schemas"]["ArtifactReference"];
            decision_reason: string | null;
        };
        ArtifactCandidatePage: {
            candidates: components["schemas"]["ArtifactCandidate"][];
            next_cursor: string | null;
        };
        ApproveArtifactCandidateRequest: {
            scope_id: string;
            candidate_id: string;
            expected_version: number;
        };
        Capabilities: {
            source_types: string[];
            artifact_families: string[];
            /** @description Whether pending Sources can be extracted into Memory. */
            memory_extraction: boolean;
            /**
             * @description Whether the configured model can generate reviewed Experience Candidates.
             * @default false
             */
            experience_generation: boolean;
            /**
             * @description Whether the configured model can generate reviewed managed Skill Candidates.
             * @default false
             */
            managed_skill_generation: boolean;
            /**
             * @description Whether host-local external Skill discovery and exact resolution are configured.
             * @default false
             */
            external_skill_registry: boolean;
            /** @description Whether exact evidence can be generated into an inspectable Handoff Draft. */
            handoff_generation: boolean;
            search_modes: components["schemas"]["MemorySearchMode"][];
            context_versions: components["schemas"]["PreparedContextSchema"][];
        };
        FamilyCount: {
            family: string;
            total: number;
        };
        CandidateFamilyCount: {
            family: components["schemas"]["CandidateFamily"];
            total: number;
            pending: number;
            approved: number;
            rejected: number;
        };
        MemoryKindCount: {
            kind: string;
            total: number;
            active: number;
            inactive: number;
        };
        SourceInventoryStatistics: {
            total: number;
            memory_processed: number;
            memory_pending: number;
        };
        ArtifactInventoryStatistics: {
            total: number;
            by_family: components["schemas"]["FamilyCount"][];
        };
        CandidateInventoryStatistics: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            by_family: components["schemas"]["CandidateFamilyCount"][];
        };
        MemoryEntryInventoryStatistics: {
            total: number;
            active: number;
            inactive: number;
            by_kind: components["schemas"]["MemoryKindCount"][];
        };
        MemoryInventoryStatistics: {
            entries: components["schemas"]["MemoryEntryInventoryStatistics"];
        };
        InventoryStatistics: {
            sources: components["schemas"]["SourceInventoryStatistics"];
            artifacts: components["schemas"]["ArtifactInventoryStatistics"];
            candidates: components["schemas"]["CandidateInventoryStatistics"];
            memory: components["schemas"]["MemoryInventoryStatistics"];
        };
        ModelUsageValue: {
            requests: number;
            input_tokens: number | null;
            output_tokens: number | null;
        };
        ModelUsageStatistics: {
            generation: components["schemas"]["ModelUsageValue"];
            embedding: components["schemas"]["ModelUsageValue"];
        };
        ModelUsagePurposeBreakdown: {
            purpose: string;
            generation: components["schemas"]["ModelUsageValue"];
            embedding: components["schemas"]["ModelUsageValue"];
        };
        ModelUsageDay: {
            /** Format: date */
            date: string;
            generation: components["schemas"]["ModelUsageValue"];
            embedding: components["schemas"]["ModelUsageValue"];
            by_purpose: components["schemas"]["ModelUsagePurposeBreakdown"][];
        };
        ResolvedUsagePeriod: {
            preset: components["schemas"]["StatsPeriod"];
            /** Format: date */
            start_date: string;
            /** Format: date */
            end_date: string;
            /** @enum {string} */
            timezone: "UTC";
        };
        UsageStatistics: {
            period: components["schemas"]["ResolvedUsagePeriod"];
            totals: components["schemas"]["ModelUsageStatistics"];
            by_purpose: components["schemas"]["ModelUsagePurposeBreakdown"][];
            daily: components["schemas"]["ModelUsageDay"][];
        };
        TokenEstimatorProfile: {
            estimator_id: string;
            version: string;
        };
        RecallTokenValue: {
            preparations: number;
            ready_preparations: number;
            comparable_preparations: number;
            baseline_tokens: number;
            recalled_tokens: number;
            token_reduction: number;
        };
        RecallTokenDay: {
            /** Format: date */
            date: string;
            preparations: number;
            ready_preparations: number;
            comparable_preparations: number;
            baseline_tokens: number;
            recalled_tokens: number;
            token_reduction: number;
        };
        RecallTokenStatistics: {
            period: components["schemas"]["ResolvedUsagePeriod"];
            estimator: components["schemas"]["TokenEstimatorProfile"];
            totals: components["schemas"]["RecallTokenValue"];
            daily: components["schemas"]["RecallTokenDay"][];
        };
        ScopedStats: {
            scope_id: string;
            /** Format: date-time */
            as_of: string;
            inventory: components["schemas"]["InventoryStatistics"];
            usage: components["schemas"]["UsageStatistics"];
            recall: components["schemas"]["RecallTokenStatistics"];
        };
        GetStatsRequest: {
            scope_id: string;
            /** @default 30d */
            period: components["schemas"]["StatsPeriod"];
        };
        /** @enum {string} */
        WorkClaimBasis: "declared" | "verified";
        WorkClaim: {
            text: string;
            basis: components["schemas"]["WorkClaimBasis"];
            evidence: components["schemas"]["HandoffCitation"][];
        };
        WorkContract: {
            /** @enum {string} */
            schema: "powercontext.work-contract.v1";
            /** @enum {string} */
            trust: "untrusted_input";
            objective: string;
            facts: components["schemas"]["WorkClaim"][];
            in_scope: string[];
            exclusions: string[];
            completion_criteria: string[];
            authorization_notes: string[];
            open_questions: string[];
        };
        CreateWorkContractRequest: {
            scope_id: string;
            source_id: string;
            contract: components["schemas"]["WorkContract"];
        };
        CurrentWorkHandoff: {
            /** @enum {string} */
            schema: "powercontext.current-work-handoff.v1";
            /** @enum {string} */
            trust: "untrusted_input";
            objective: string;
            state: components["schemas"]["WorkClaim"][];
            disposition: components["schemas"]["HandoffDisposition"];
            next_action: components["schemas"]["WorkClaim"];
            omissions: string[];
        };
        HandoffCurrentWorkRequest: {
            scope_id: string;
            source_id: string;
            handoff: components["schemas"]["CurrentWorkHandoff"];
        };
        /** @enum {string} */
        WorkSourceKind: "work-contract" | "handoff-boundary" | "handoff-receipt" | "task-outcome";
        WorkSourceReceipt: {
            kind: components["schemas"]["WorkSourceKind"];
            source: components["schemas"]["SourceReference"];
            position: number;
            content_digest: string;
        };
        PreparedWorkHandoff: {
            boundary: components["schemas"]["WorkSourceReceipt"];
            handoff: components["schemas"]["PreparedHandoff"];
        };
        /** @enum {string} */
        HandoffReceiptStatus: "accepted" | "needs_clarification" | "declined";
        /** @enum {string} */
        HandoffAcknowledgementSelection: "prepared" | "exact";
        /** @enum {string} */
        LiveStateCheckStatus: "confirmed" | "mismatch" | "not_checked";
        /** @enum {string} */
        ReceiverReadinessCheckStatus: "confirmed" | "insufficient" | "not_checked";
        /** @description Untrusted receiver self-attestation kept separate from citation availability. All three values must be confirmed when status is accepted. */
        ReceiverChecks: {
            live_state: components["schemas"]["LiveStateCheckStatus"];
            capability: components["schemas"]["ReceiverReadinessCheckStatus"];
            authorization: components["schemas"]["ReceiverReadinessCheckStatus"];
        };
        AcknowledgeHandoffRequest: {
            scope_id: string;
            source_id: string;
            receiver: string;
            status: components["schemas"]["HandoffReceiptStatus"];
            selection: components["schemas"]["HandoffAcknowledgementSelection"];
            receiver_checks?: components["schemas"]["ReceiverChecks"];
            prepared?: components["schemas"]["PreparedHandoff"];
            revision?: components["schemas"]["ArtifactReference"];
            message?: string | null;
        };
        HandoffAcknowledgement: {
            resolution: components["schemas"]["HandoffResolution"];
            receipt: components["schemas"]["WorkSourceReceipt"];
        };
        /** @enum {string} */
        TaskOutcomeStatus: "succeeded" | "partial" | "blocked" | "failed" | "cancelled" | "unknown";
        /** @enum {string} */
        TaskCheckStatus: "passed" | "failed" | "skipped" | "timed_out" | "unavailable" | "cancelled" | "unknown";
        TaskCheck: {
            name: string;
            status: components["schemas"]["TaskCheckStatus"];
            details?: string | null;
            basis: components["schemas"]["WorkClaimBasis"];
            evidence: components["schemas"]["HandoffCitation"][];
        };
        TaskOutcome: {
            /** @enum {string} */
            schema: "powercontext.task-outcome.v1";
            /** @enum {string} */
            trust: "untrusted_observation";
            objective: string;
            status: components["schemas"]["TaskOutcomeStatus"];
            summary: string;
            handoff_receipt_ref?: components["schemas"]["SourceReference"];
            observations: components["schemas"]["WorkClaim"][];
            checks: components["schemas"]["TaskCheck"][];
            produced_artifacts: components["schemas"]["ArtifactReference"][];
            remaining_work: string[];
        };
        RecordTaskOutcomeRequest: {
            scope_id: string;
            source_id: string;
            outcome: components["schemas"]["TaskOutcome"];
        };
        CaptureContentSourceRequest: {
            scope_id: string;
            source_id: string;
            content: string;
            metadata?: {
                [key: string]: unknown;
            } | null;
        };
        CaptureContentSourceResponse: {
            status: components["schemas"]["CaptureStatus"];
            source: components["schemas"]["SourceReference"];
            position: number;
        };
        CommitHandoffRequest: {
            scope_id: string;
            handoff: components["schemas"]["PreparedHandoff"];
        };
        CommittedHandoff: {
            reference: components["schemas"]["ArtifactReference"];
            content: components["schemas"]["HandoffContent"];
            source_refs: components["schemas"]["SourceReference"][];
            artifact_refs: components["schemas"]["ArtifactReference"][];
        };
        ContinueHandoffRequest: {
            scope_id: string;
            selection: components["schemas"]["HandoffSelection"];
            prepared?: components["schemas"]["PreparedHandoff"];
            revision?: components["schemas"]["ArtifactReference"];
        };
        FinalizeHandoffRequest: {
            scope_id: string;
            draft: components["schemas"]["HandoffDraft"];
        };
        HandoffArtifactCitation: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "artifact";
            artifact_ref: components["schemas"]["ArtifactReference"];
        };
        HandoffActivation: {
            status: components["schemas"]["HandoffActivationStatus"];
            boundary_source: components["schemas"]["SourceReference"];
            previous_position: number;
            current_position: number;
            draft: components["schemas"]["HandoffDraft"];
        };
        HandoffCitation: components["schemas"]["HandoffSourceCitation"] | components["schemas"]["HandoffArtifactCitation"] | components["schemas"]["HandoffMemoryCitation"];
        HandoffContent: {
            schema: components["schemas"]["HandoffSchema"];
            objective: string;
            state: components["schemas"]["HandoffStatement"][];
            disposition: components["schemas"]["HandoffDisposition"];
            next_action: components["schemas"]["HandoffStatement"];
            omissions: components["schemas"]["HandoffOmission"][];
        };
        HandoffDraft: {
            objective: string;
            state: components["schemas"]["HandoffStatement"][];
            disposition: components["schemas"]["HandoffDisposition"];
            next_action: components["schemas"]["HandoffStatement"];
            omissions: components["schemas"]["HandoffOmission"][];
        };
        HandoffEvidenceCheck: {
            claim: components["schemas"]["HandoffClaim"];
            state_index: number | null;
            status: components["schemas"]["HandoffEvidenceStatus"];
            unavailable_evidence: components["schemas"]["HandoffCitation"][];
        };
        HandoffMemoryCitation: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "memory";
            memory_citation: components["schemas"]["MemoryCitation"];
        };
        HandoffOmission: {
            text: string;
            citation: components["schemas"]["HandoffCitation"];
        };
        HandoffResolution: {
            /** @enum {string} */
            trust: "untrusted_history";
            status: components["schemas"]["HandoffResolutionStatus"];
            scope_id: string;
            content: components["schemas"]["HandoffContent"];
            selection: components["schemas"]["HandoffSelection"];
            selected_revision: components["schemas"]["ArtifactReference"];
            current_revision: components["schemas"]["ArtifactReference"];
            evidence_checks: components["schemas"]["HandoffEvidenceCheck"][];
        };
        HandoffSourceCitation: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "source";
            source_ref: components["schemas"]["SourceReference"];
        };
        HandoffStatement: {
            text: string;
            citations: components["schemas"]["HandoffCitation"][];
        };
        PrepareHandoffRequest: {
            scope_id: string;
            objective: string;
            evidence: components["schemas"]["HandoffCitation"][];
            /** @default 8000 */
            max_bytes: number;
        };
        PreparedHandoff: {
            schema: components["schemas"]["PreparedHandoffSchema"];
            scope_id: string;
            base: components["schemas"]["ArtifactReference"];
            content: components["schemas"]["HandoffContent"];
        };
        PreparedContext: {
            schema: components["schemas"]["PreparedContextSchema"];
            status: components["schemas"]["PreparedContextStatus"];
            content: string | null;
            content_bytes: number;
        };
        EntryChange: {
            op: components["schemas"]["EntryChangeOperation"];
            entry_id: string;
            from_entry_version_id: string | null;
            to_entry_version_id: string | null;
            reason: string | null;
        };
        ExperienceArtifact: {
            artifact: components["schemas"]["ArtifactReference"];
            content: components["schemas"]["ExperienceProposal"];
            source_refs: components["schemas"]["SourceReference"][];
            artifact_refs: components["schemas"]["ArtifactReference"][];
        };
        ExperienceProposal: {
            situation: string;
            action: string;
            outcome: string;
            lesson: string;
        };
        SkillArtifact: {
            artifact: components["schemas"]["ArtifactReference"];
            content: components["schemas"]["SkillProposal"];
            source_refs: components["schemas"]["SourceReference"][];
            artifact_refs: components["schemas"]["ArtifactReference"][];
        };
        SkillProposal: {
            name: string;
            description: string;
            instructions: string;
            validation: components["schemas"]["SkillValidationItem"][];
        };
        SkillValidationItem: string;
        ExternalSkillRegistration: {
            external_skill_id: string;
            /** @enum {string} */
            provider: "codex";
            /** @enum {string} */
            agent_kind: "codex";
            host_id: string;
            installation_scope: components["schemas"]["ExternalSkillInstallationScope"];
            /** @description Host-local locator; not a cross-Agent or cross-host contract. */
            locator: string;
            fingerprint: string;
            name: string;
            description: string;
        };
        ExternalSkillResolution: {
            registration: components["schemas"]["ExternalSkillRegistration"];
            status: components["schemas"]["ExternalSkillResolutionStatus"];
            /** @description Host-local SKILL.md path; present only when the exact fingerprint is available. */
            entrypoint: string | null;
        };
        ScanExternalSkillsResponse: {
            registrations: components["schemas"]["ExternalSkillRegistration"][];
            skipped: number;
        };
        ListExternalSkillsResponse: {
            skills: components["schemas"]["ExternalSkillResolution"][];
        };
        ErrorDetail: {
            code: string;
            message: string;
            details: {
                [key: string]: unknown;
            } | null;
        };
        ErrorResponse: {
            error: components["schemas"]["ErrorDetail"];
        };
        FlushMemoryRequest: {
            scope_id: string;
        };
        FlushMemoryResponse: {
            status: components["schemas"]["FlushStatus"];
            previous_cursor: number;
            current_cursor: number;
            high_watermark: number;
            processed_source_count: number;
            memory?: components["schemas"]["ArtifactReference"];
        };
        GetMemoryEntryRequest: {
            scope_id: string;
            citation: components["schemas"]["MemoryCitation"];
        };
        GetArtifactCandidateRequest: {
            scope_id: string;
            candidate_id: string;
        };
        GetExperienceRequest: {
            scope_id: string;
            artifact: components["schemas"]["ArtifactReference"];
        };
        GetSkillRequest: {
            scope_id: string;
            artifact: components["schemas"]["ArtifactReference"];
        };
        CreateHandoffReportProjectRequest: {
            project_key: string;
            title: string;
            description?: string | null;
            /** @default zh-CN */
            default_locale: components["schemas"]["ReportLocale"];
            /** @default UTC */
            timezone: string;
        };
        ListHandoffReportProjectsRequest: {
            cursor?: string | null;
            /** @default 50 */
            limit: number;
            /** @default false */
            include_archived: boolean;
        };
        GetHandoffReportProjectRequest: {
            project_id: string;
        };
        UpdateHandoffReportProjectRequest: {
            project: components["schemas"]["ProjectDescriptor"];
            expected_version: number;
        };
        RegisterHandoffReportWorkstreamRequest: {
            project_id: string;
            scope_id: string;
            key?: string | null;
            title: string;
            kind: components["schemas"]["WorkstreamKind"];
            /** @default included */
            catalog_state: components["schemas"]["ReportCatalogState"];
            /** @default [] */
            external_refs: components["schemas"]["HandoffReportExternalReference"][];
            /** @default [] */
            labels: string[];
        };
        ListHandoffReportWorkstreamsRequest: {
            project_id: string;
            cursor?: string | null;
            /** @default 50 */
            limit: number;
            /** @default false */
            include_archived: boolean;
        };
        UpdateHandoffReportWorkstreamRequest: {
            workstream: components["schemas"]["WorkstreamDescriptor"];
            expected_version: number;
        };
        GetHandoffReportRequest: {
            project_id: string;
            locale?: components["schemas"]["ReportLocale"];
            /** @default true */
            include_evidence_checks: boolean;
            /** @default markdown */
            format: components["schemas"]["ReportFormat"];
            /** @default false */
            include_archived: boolean;
            /** @default false */
            download: boolean;
            period?: components["schemas"]["HandoffReportPeriodRequest"];
        };
        HandoffReportPeriodRequest: {
            /** Format: date-time */
            start: string;
            /** Format: date-time */
            end: string;
            timezone?: string | null;
            /** @default false */
            compare_to_previous_period: boolean;
        };
        HandoffReportResponse: {
            format: components["schemas"]["ReportFormat"];
            report: {
                [key: string]: unknown;
            } | null;
            markdown: string | null;
            selection_digest: string;
            report_digest: string;
        };
        /** @enum {string} */
        ReportActivitySource: "handoff_observation" | "git_commit" | "git_worktree" | "coding_session" | "other";
        /** @enum {string} */
        ReportTimeBasis: "source_reported" | "host_observed" | "first_seen" | "current_only" | "unknown";
        HandoffReportActivityAgent: {
            provider?: string | null;
            label?: string | null;
        };
        HandoffReportActivityVcsContext: {
            branch?: string | null;
            head_revision?: string | null;
        };
        RecordHandoffReportActivityRequest: {
            project_id: string;
            scope_id?: string | null;
            source: components["schemas"]["ReportActivitySource"];
            source_event_id: string;
            source_ref?: components["schemas"]["HandoffReportExternalReference"];
            /** Format: date-time */
            occurred_at?: string | null;
            time_basis: components["schemas"]["ReportTimeBasis"];
            title?: string | null;
            summary?: string | null;
            agent?: components["schemas"]["HandoffReportActivityAgent"];
            session_id?: string | null;
            vcs_context?: components["schemas"]["HandoffReportActivityVcsContext"];
            /** @default [] */
            evidence_refs: components["schemas"]["HandoffReportExternalReference"][];
        };
        HandoffReportActivity: {
            /** @enum {string} */
            schema: "powercontext.handoff-report-activity.v1";
            event_id: string;
            project_id: string;
            scope_id: string | null;
            source: components["schemas"]["ReportActivitySource"];
            source_event_id: string;
            source_ref: components["schemas"]["HandoffReportExternalReference"];
            /** Format: date-time */
            occurred_at: string | null;
            /** Format: date-time */
            observed_at: string;
            time_basis: components["schemas"]["ReportTimeBasis"];
            title: string | null;
            summary: string | null;
            agent: components["schemas"]["HandoffReportActivityAgent"];
            session_id: string | null;
            vcs_context: components["schemas"]["HandoffReportActivityVcsContext"];
            evidence_refs: components["schemas"]["HandoffReportExternalReference"][];
            /** @enum {string} */
            trust: "untrusted_observation";
        };
        StoredHandoffReportActivity: {
            cursor: number;
            event: components["schemas"]["HandoffReportActivity"];
        };
        ListHandoffReportActivitiesRequest: {
            project_id: string;
            /** Format: date-time */
            period_start?: string | null;
            /** Format: date-time */
            period_end?: string | null;
            sources?: components["schemas"]["ReportActivitySource"][] | null;
            /** @default 0 */
            after_cursor: number;
            through_cursor?: number | null;
            /** @default 50 */
            limit: number;
        };
        HandoffReportActivityPage: {
            items: components["schemas"]["HandoffReportActivity"][];
            next_cursor: number | null;
            high_watermark: number;
        };
        PurgeHandoffReportActivitiesRequest: {
            project_id: string;
            /** Format: date-time */
            observed_before: string;
        };
        PurgeHandoffReportActivitiesResponse: {
            deleted_count: number;
        };
        HandoffReportRepositoryRef: {
            /** @enum {string} */
            provider: "github" | "gitlab" | "local" | "other";
            repository_id: string | null;
            normalized_remote: string | null;
            subpath: string | null;
        };
        HandoffReportWorkspaceBinding: {
            /** @enum {string} */
            schema: "powercontext.workspace-binding.v1";
            workspace_instance_id: string;
            project_id: string;
            repository_ref: components["schemas"]["HandoffReportRepositoryRef"];
            /** @enum {string} */
            state: "confirmed" | "detached";
            /** Format: date-time */
            confirmed_at: string;
            version: number;
        };
        GetHandoffReportWorkspaceRequest: {
            workspace_instance_id: string;
        };
        AttachHandoffReportWorkspaceRequest: {
            workspace_instance_id: string;
            project_id: string;
            repository_ref: components["schemas"]["HandoffReportRepositoryRef"];
            expected_version: number | null;
        };
        DetachHandoffReportWorkspaceRequest: {
            workspace_instance_id: string;
            expected_version: number;
        };
        ProjectDescriptor: {
            /** @enum {string} */
            schema: "powercontext.project.v1";
            project_id: string;
            project_key: string;
            title: string;
            description: string | null;
            default_locale: components["schemas"]["ReportLocale"];
            timezone: string;
            catalog_state: components["schemas"]["ReportCatalogState"];
            version: number;
        };
        ProjectPage: {
            items: components["schemas"]["ProjectDescriptor"][];
            next_cursor: string | null;
        };
        WorkstreamDescriptor: {
            /** @enum {string} */
            schema: "powercontext.workstream.v1";
            scope_id: string;
            project_id: string;
            key: string | null;
            title: string;
            kind: components["schemas"]["WorkstreamKind"];
            catalog_state: components["schemas"]["ReportCatalogState"];
            external_refs: components["schemas"]["HandoffReportExternalReference"][];
            labels: string[];
            version: number;
        };
        WorkstreamPage: {
            items: components["schemas"]["WorkstreamDescriptor"][];
            next_cursor: string | null;
        };
        HandoffReportExternalReference: {
            /** @enum {string} */
            kind: "issue" | "task" | "pull_request" | "branch" | "feature" | "release" | "program" | "other";
            provider: string;
            external_id: string;
            url: string | null;
        };
        /** @enum {string} */
        ReportLocale: "zh-CN" | "en";
        /** @enum {string} */
        ReportFormat: "json" | "markdown";
        /** @enum {string} */
        ReportCatalogState: "included" | "archived";
        /** @enum {string} */
        WorkstreamKind: "feature" | "bug" | "refactor" | "operations" | "research" | "other";
        HealthResponse: {
            status: string;
        };
        ListMemoryChangesRequest: {
            scope_id: string;
            /** @description Exclusive lower bound; 0 requests complete history from Revision 1. Positive nonexistent revisions are errors. */
            since_revision?: number | null;
        };
        ListMemoryChangesResponse: {
            memory?: components["schemas"]["ArtifactReference"];
            revisions: components["schemas"]["MemoryRevisionChanges"][];
        };
        ListMemoryEntriesRequest: {
            scope_id: string;
            /**
             * @description Include inactive entries from the current Memory head for explicit audit.
             * @default false
             */
            include_inactive: boolean;
        };
        ListMemoryEntriesResponse: {
            memory?: components["schemas"]["ArtifactReference"];
            entries: components["schemas"]["MemoryEntry"][];
        };
        ListArtifactCandidatesRequest: {
            scope_id: string;
            /** @default pending */
            status: components["schemas"]["CandidateStatus"];
            family?: components["schemas"]["CandidateFamily"];
            cursor?: string | null;
            /** @default 50 */
            limit: number;
        };
        ListExternalSkillsRequest: {
            scope_id: string;
            /** @default false */
            include_unavailable: boolean;
        };
        MemoryEntry: {
            citation: components["schemas"]["MemoryCitation"];
            version: number;
            kind: string;
            text: string;
            state: components["schemas"]["MemoryEntryState"];
            source_refs: components["schemas"]["SourceReference"][];
            artifact_refs: components["schemas"]["ArtifactReference"][];
        };
        MemoryMutationResponse: {
            memory: components["schemas"]["ArtifactReference"];
            entry?: components["schemas"]["MemoryEntry"];
        };
        MemoryCitation: {
            memory_ref: components["schemas"]["ArtifactReference"];
            entry_id: string;
            entry_version_id: string;
        };
        MemoryRevisionChanges: {
            memory_ref: components["schemas"]["ArtifactReference"];
            changes: components["schemas"]["EntryChange"][];
        };
        PrepareContextRequest: {
            scope_id: string;
            query: string;
            /** @default 8000 */
            max_bytes: number;
        };
        ProposeExperienceRequest: {
            scope_id: string;
            proposal: components["schemas"]["ExperienceProposal"];
            /** @description Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references. */
            source_refs: components["schemas"]["SourceReference"][];
            /** @description Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references. */
            artifact_refs: components["schemas"]["ArtifactReference"][];
            target?: components["schemas"]["ArtifactReference"];
            reason?: string | null;
        };
        GenerateExperienceRequest: {
            scope_id: string;
            /** @description Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references. */
            source_refs: components["schemas"]["SourceReference"][];
            /** @description Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references. */
            artifact_refs: components["schemas"]["ArtifactReference"][];
            target?: components["schemas"]["ArtifactReference"];
            reason?: string | null;
        };
        ProposeSkillRequest: {
            scope_id: string;
            proposal: components["schemas"]["SkillProposal"];
            /** @description Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references. */
            source_refs: components["schemas"]["SourceReference"][];
            /** @description Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references. */
            artifact_refs: components["schemas"]["ArtifactReference"][];
            target?: components["schemas"]["ArtifactReference"];
            reason?: string | null;
        };
        /**
         * @description The operation-specific direct provenance shape required for managed Skill generation.
         * @enum {string}
         */
        SkillGenerationOrigin: "experience" | "source" | "usage";
        GenerateSkillRequest: {
            scope_id: string;
            origin: components["schemas"]["SkillGenerationOrigin"];
            /** @description Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references. */
            source_refs: components["schemas"]["SourceReference"][];
            /** @description Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references. */
            artifact_refs: components["schemas"]["ArtifactReference"][];
            target?: components["schemas"]["ArtifactReference"];
            reason?: string | null;
        };
        /** @enum {string} */
        GeneratedCandidateStatus: "pending" | "no_op";
        GeneratedCandidateResponse: {
            status: components["schemas"]["GeneratedCandidateStatus"];
            candidate: components["schemas"]["ArtifactCandidate"];
        };
        ReadinessResponse: {
            status: components["schemas"]["ReadinessStatus"];
            checks: {
                [key: string]: string;
            };
        };
        /** @enum {string} */
        ReadinessStatus: "ready" | "degraded" | "not_ready";
        RememberMemoryRequest: {
            scope_id: string;
            kind: string;
            /** @description Must not exceed 8192 UTF-8 bytes after normalization. */
            text: string;
            reason?: string | null;
            expected_revision?: number | null;
        };
        RetireMemoryEntryRequest: {
            scope_id: string;
            citation: components["schemas"]["MemoryCitation"];
            reason?: string | null;
        };
        RejectArtifactCandidateRequest: {
            scope_id: string;
            candidate_id: string;
            expected_version: number;
            reason: string;
        };
        ReviseArtifactCandidateRequest: {
            scope_id: string;
            candidate_id: string;
            expected_version: number;
            proposal: components["schemas"]["ExperienceProposal"] | components["schemas"]["SkillProposal"];
            /** @description Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references. */
            source_refs: components["schemas"]["SourceReference"][];
            /** @description Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references. */
            artifact_refs: components["schemas"]["ArtifactReference"][];
            target?: components["schemas"]["ArtifactReference"];
            reason?: string | null;
        };
        ReviseMemoryEntryRequest: {
            scope_id: string;
            citation: components["schemas"]["MemoryCitation"];
            kind: string;
            /** @description Must not exceed 8192 UTF-8 bytes after normalization. */
            text: string;
            reason?: string | null;
        };
        SearchMemoryHit: {
            citation: components["schemas"]["MemoryCitation"];
            text: string;
            score: number;
            matched_by: components["schemas"]["MemoryMatchedBy"][];
        };
        SearchMemoryRequest: {
            scope_id: string;
            query: string;
            /** @default 10 */
            limit: number;
            /** @default auto */
            mode: components["schemas"]["MemorySearchMode"];
        };
        ScanExternalSkillsRequest: {
            scope_id: string;
        };
        ResolveExternalSkillRequest: {
            scope_id: string;
            external_skill_id: string;
            fingerprint: string;
        };
        /** @enum {string} */
        ExternalSkillImportMode: "import" | "fork";
        ImportExternalSkillRequest: {
            scope_id: string;
            external_skill_id: string;
            /** @description Exact package fingerprint captured into Source lineage. */
            fingerprint: string;
            mode: components["schemas"]["ExternalSkillImportMode"];
            reason?: string | null;
        };
        SearchMemoryResponse: {
            memory?: components["schemas"]["ArtifactReference"];
            mode?: components["schemas"]["MemoryUsedSearchMode"];
            hits: components["schemas"]["SearchMemoryHit"][];
        };
        SourceReference: {
            /** @description Stable Source type. */
            name: string;
            source_id: string;
        };
        /** @enum {string} */
        CaptureStatus: "accepted";
        /** @enum {string} */
        StatsPeriod: "today" | "7d" | "30d";
        /** @enum {string} */
        CandidateFamily: "experience" | "skill";
        /** @enum {string} */
        ExternalSkillInstallationScope: "user" | "project" | "plugin";
        /** @enum {string} */
        ExternalSkillResolutionStatus: "available" | "unavailable";
        /** @enum {string} */
        CandidateStatus: "pending" | "approved" | "rejected";
        /** @enum {string} */
        PreparedContextSchema: "powercontext.prepared-context.v1";
        /** @enum {string} */
        PreparedContextStatus: "ready" | "empty";
        /** @enum {string} */
        EntryChangeOperation: "add" | "revise" | "deactivate" | "reactivate";
        /** @enum {string} */
        FlushStatus: "idle" | "processed";
        /** @enum {string} */
        MemoryEntryState: "active" | "inactive";
        /** @enum {string} */
        MemoryMatchedBy: "fts" | "vector";
        /** @enum {string} */
        MemorySearchMode: "auto" | "fts" | "vector" | "hybrid";
        /** @enum {string} */
        MemoryUsedSearchMode: "fts" | "vector" | "hybrid";
        /** @enum {string} */
        HandoffClaim: "state" | "next_action";
        /** @enum {string} */
        HandoffActivationStatus: "generated" | "ignored";
        /** @enum {string} */
        HandoffDisposition: "continuable" | "blocked" | "complete";
        /** @enum {string} */
        HandoffEvidenceStatus: "available" | "unavailable";
        /** @enum {string} */
        HandoffResolutionStatus: "empty" | "resolved";
        /** @enum {string} */
        HandoffSchema: "powercontext.handoff.v1";
        /** @enum {string} */
        HandoffSelection: "prepared" | "exact" | "latest";
        /** @enum {string} */
        PreparedHandoffSchema: "powercontext.prepared-handoff.v1";
    };
    responses: {
        /** @description A valid bearer token is required by this Server deployment. */
        Unauthorized: {
            headers: {
                "WWW-Authenticate": components["headers"]["BearerChallenge"];
                "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description The command conflicts with current immutable state. */
        Conflict: {
            headers: {
                "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description The request violates the transport or application contract. */
        InvalidRequest: {
            headers: {
                "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description The selected Handoff Report exceeds the deterministic output limit. */
        ReportTooLarge: {
            headers: {
                "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description The requested immutable Memory value was not found. */
        NotFound: {
            headers: {
                "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description A required Runtime binding or dependency is unavailable. */
        Unavailable: {
            headers: {
                "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description The Server failed without exposing internal details. */
        InternalError: {
            headers: {
                "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: {
        /** @description Authentication scheme required by the Server. */
        BearerChallenge: string;
        /** @description Opaque identifier for correlating one request. */
        RequestId: string;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    get_liveness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The API process is alive. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    get_readiness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Required Server bindings are ready; optional capabilities may be degraded. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
            /** @description Required Server bindings are not ready. */
            503: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
        };
    };
    get_capabilities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Behavior enabled by the assembled runtime. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Capabilities"];
                };
            };
            401: components["responses"]["Unauthorized"];
        };
    };
    capture_content_source: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaptureContentSourceRequest"];
            };
        };
        responses: {
            /** @description The Source is durably stored for later processing. */
            202: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CaptureContentSourceResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    prepare_context: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PrepareContextRequest"];
            };
        };
        responses: {
            /** @description Final context ready for direct injection, or a normal empty result. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreparedContext"];
                };
            };
            401: components["responses"]["Unauthorized"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    create_work_contract: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateWorkContractRequest"];
            };
        };
        responses: {
            /** @description The Work Contract is durably captured as exact Source evidence. */
            202: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkSourceReceipt"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    handoff_current_work: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HandoffCurrentWorkRequest"];
            };
        };
        responses: {
            /** @description The captured boundary and Prepared Handoff ready for explicit transfer. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreparedWorkHandoff"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    acknowledge_handoff: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcknowledgeHandoffRequest"];
            };
        };
        responses: {
            /** @description The resolved Handoff and durable receiver acknowledgement. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffAcknowledgement"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    record_task_outcome: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecordTaskOutcomeRequest"];
            };
        };
        responses: {
            /** @description The Task Outcome is durably captured for Handoff evidence and reviewed Experience incubation. */
            202: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkSourceReceipt"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    activate_handoff: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActivateHandoffRequest"];
            };
        };
        responses: {
            /** @description A generated inspectable Draft, or an ignored boundary that was already consumed. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffActivation"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    prepare_handoff: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PrepareHandoffRequest"];
            };
        };
        responses: {
            /** @description An uncommitted Draft generated from the selected exact evidence. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffDraft"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    finalize_handoff: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FinalizeHandoffRequest"];
            };
        };
        responses: {
            /** @description A temporary Handoff ready for direct transfer or explicit commit. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreparedHandoff"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    commit_handoff: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitHandoffRequest"];
            };
        };
        responses: {
            /** @description The committed immutable Handoff Revision. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommittedHandoff"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    continue_handoff: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContinueHandoffRequest"];
            };
        };
        responses: {
            /** @description Resolved content and per-statement evidence availability. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffResolution"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    flush_memory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FlushMemoryRequest"];
            };
        };
        responses: {
            /** @description The activation completed or found no pending Sources. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlushMemoryResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    remember_memory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RememberMemoryRequest"];
            };
        };
        responses: {
            /** @description The explicit Memory mutation completed. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryMutationResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    search_memory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SearchMemoryRequest"];
            };
        };
        responses: {
            /** @description Matching Memory entries, or an empty result when the scope has no Memory. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchMemoryResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    list_memory_entries: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListMemoryEntriesRequest"];
            };
        };
        responses: {
            /** @description The selected entries from the current Memory head. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListMemoryEntriesResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    get_memory_entry: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GetMemoryEntryRequest"];
            };
        };
        responses: {
            /** @description The exact Memory entry version. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryEntry"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    revise_memory_entry: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviseMemoryEntryRequest"];
            };
        };
        responses: {
            /** @description The Memory entry revision completed. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryMutationResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    retire_memory_entry: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RetireMemoryEntryRequest"];
            };
        };
        responses: {
            /** @description The Memory entry retirement completed. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryMutationResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    list_memory_changes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListMemoryChangesRequest"];
            };
        };
        responses: {
            /** @description Compact changes through the selected Memory Revision. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListMemoryChangesResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    propose_experience: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProposeExperienceRequest"];
            };
        };
        responses: {
            /** @description The pending Experience Candidate. */
            201: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactCandidate"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    generate_experience: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenerateExperienceRequest"];
            };
        };
        responses: {
            /** @description A pending Candidate or an explicit semantic no-op. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GeneratedCandidateResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    get_experience: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GetExperienceRequest"];
            };
        };
        responses: {
            /** @description The exact approved Experience Revision. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExperienceArtifact"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    propose_skill: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProposeSkillRequest"];
            };
        };
        responses: {
            /** @description The pending managed Skill Candidate. */
            201: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactCandidate"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    generate_skill: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenerateSkillRequest"];
            };
        };
        responses: {
            /** @description A pending Candidate or an explicit semantic no-op. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GeneratedCandidateResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    get_skill: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GetSkillRequest"];
            };
        };
        responses: {
            /** @description The exact approved managed Skill Revision. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SkillArtifact"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    scan_external_skills: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScanExternalSkillsRequest"];
            };
        };
        responses: {
            /** @description The rebuildable provider snapshot. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScanExternalSkillsResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    list_external_skills: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListExternalSkillsRequest"];
            };
        };
        responses: {
            /** @description External Skills resolved against the current Agent, host, scope, and fingerprint. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListExternalSkillsResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    resolve_external_skill: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveExternalSkillRequest"];
            };
        };
        responses: {
            /** @description The live exact-resolution result, which may be unavailable. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExternalSkillResolution"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    import_external_skill: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportExternalSkillRequest"];
            };
        };
        responses: {
            /** @description A pending managed Skill Candidate or an explicit semantic no-op. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GeneratedCandidateResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    list_artifact_candidates: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListArtifactCandidatesRequest"];
            };
        };
        responses: {
            /** @description The selected current Candidate heads. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactCandidatePage"];
                };
            };
            401: components["responses"]["Unauthorized"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    get_artifact_candidate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GetArtifactCandidateRequest"];
            };
        };
        responses: {
            /** @description The current Candidate head. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactCandidate"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    approve_artifact_candidate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApproveArtifactCandidateRequest"];
            };
        };
        responses: {
            /** @description The approved Candidate and exact result Artifact. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactCandidate"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    reject_artifact_candidate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RejectArtifactCandidateRequest"];
            };
        };
        responses: {
            /** @description The rejected Candidate. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactCandidate"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    revise_artifact_candidate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviseArtifactCandidateRequest"];
            };
        };
        responses: {
            /** @description The next pending Candidate version. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactCandidate"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    get_stats: {
        parameters: {
            query: {
                scope_id: string;
                period?: components["schemas"]["StatsPeriod"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current inventory, model usage, and recall token estimates for the scope. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    /** @description Prevent caches from retaining scoped statistics. */
                    "Cache-Control"?: "no-store";
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScopedStats"];
                };
            };
            401: components["responses"]["Unauthorized"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    create_handoff_report_project: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateHandoffReportProjectRequest"];
            };
        };
        responses: {
            /** @description The created Report Project. */
            201: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectDescriptor"];
                };
            };
            401: components["responses"]["Unauthorized"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    list_handoff_report_projects: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListHandoffReportProjectsRequest"];
            };
        };
        responses: {
            /** @description A cursor-paginated page of Report Projects. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectPage"];
                };
            };
            401: components["responses"]["Unauthorized"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    get_handoff_report_project: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GetHandoffReportProjectRequest"];
            };
        };
        responses: {
            /** @description The exact current Report Project descriptor. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectDescriptor"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    update_handoff_report_project: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateHandoffReportProjectRequest"];
            };
        };
        responses: {
            /** @description The updated Report Project descriptor. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectDescriptor"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    register_handoff_report_workstream: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterHandoffReportWorkstreamRequest"];
            };
        };
        responses: {
            /** @description The registered Report Workstream. */
            201: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkstreamDescriptor"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    list_handoff_report_workstreams: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListHandoffReportWorkstreamsRequest"];
            };
        };
        responses: {
            /** @description A cursor-paginated page of Report Workstreams. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkstreamPage"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    update_handoff_report_workstream: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateHandoffReportWorkstreamRequest"];
            };
        };
        responses: {
            /** @description The updated Report Workstream descriptor. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkstreamDescriptor"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    get_handoff_report: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GetHandoffReportRequest"];
            };
        };
        responses: {
            /** @description A canonical JSON report, optionally accompanied by Markdown. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    /** @description Prevent caches from retaining scoped report data. */
                    "Cache-Control"?: "no-store";
                    /** @description Digest of the exact report selection. */
                    "X-PowerContext-Selection-Digest"?: string;
                    /** @description Digest of the selected output projection. */
                    "X-PowerContext-Report-Digest"?: string;
                    /** @description Safe attachment filename when download is true. */
                    "Content-Disposition"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffReportResponse"];
                    "text/markdown": string;
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            413: components["responses"]["ReportTooLarge"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
            503: components["responses"]["Unavailable"];
        };
    };
    record_handoff_report_activity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecordHandoffReportActivityRequest"];
            };
        };
        responses: {
            /** @description The idempotently recorded Report Activity. */
            201: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StoredHandoffReportActivity"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    list_handoff_report_activities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListHandoffReportActivitiesRequest"];
            };
        };
        responses: {
            /** @description A frozen cursor page of Report Activities. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffReportActivityPage"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    purge_handoff_report_activities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PurgeHandoffReportActivitiesRequest"];
            };
        };
        responses: {
            /** @description The number of deleted Report-owned Activity rows. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PurgeHandoffReportActivitiesResponse"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    get_handoff_report_workspace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GetHandoffReportWorkspaceRequest"];
            };
        };
        responses: {
            /** @description The confirmed Workspace binding. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffReportWorkspaceBinding"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    attach_handoff_report_workspace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AttachHandoffReportWorkspaceRequest"];
            };
        };
        responses: {
            /** @description The confirmed Workspace binding. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffReportWorkspaceBinding"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
    detach_handoff_report_workspace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DetachHandoffReportWorkspaceRequest"];
            };
        };
        responses: {
            /** @description The detached Workspace binding record. */
            200: {
                headers: {
                    "X-PowerContext-Request-ID": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HandoffReportWorkspaceBinding"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            409: components["responses"]["Conflict"];
            422: components["responses"]["InvalidRequest"];
            500: components["responses"]["InternalError"];
        };
    };
}

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
 * Generated Ajv validators.
 * source: contract/openapi/powercontext.yaml
 * sourceDigest: a97488e85ab3a9f1db3f1dce720ec74b07c626b1974cc860c67b91cabb22f7e3
 * generatorVersion: 0.2.0-phase2
 */

import { createWireValidator } from '../validator-runtime.js'

export const COMPONENT_SCHEMAS = {
  "ActivateHandoffRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "boundary_source",
      "objective"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "boundary_source": {
        "$ref": "#/components/schemas/SourceReference"
      },
      "objective": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "evidence": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffCitation"
        },
        "default": []
      },
      "max_bytes": {
        "type": "integer",
        "minimum": 512,
        "maximum": 32768,
        "default": 8000
      }
    }
  },
  "ArtifactReference": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "family",
      "artifact_id",
      "revision"
    ],
    "properties": {
      "family": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "artifact_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "revision": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "ArtifactCandidate": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "candidate_id",
      "version",
      "family",
      "status",
      "proposal",
      "source_refs",
      "artifact_refs",
      "target",
      "reason",
      "result_artifact",
      "decision_reason"
    ],
    "properties": {
      "candidate_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      },
      "family": {
        "$ref": "#/components/schemas/CandidateFamily"
      },
      "status": {
        "$ref": "#/components/schemas/CandidateStatus"
      },
      "proposal": {
        "oneOf": [
          {
            "$ref": "#/components/schemas/ExperienceProposal"
          },
          {
            "$ref": "#/components/schemas/SkillProposal"
          }
        ]
      },
      "source_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      },
      "target": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      },
      "result_artifact": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "decision_reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ArtifactCandidatePage": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "candidates",
      "next_cursor"
    ],
    "properties": {
      "candidates": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ArtifactCandidate"
        }
      },
      "next_cursor": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ApproveArtifactCandidateRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "candidate_id",
      "expected_version"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "candidate_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "expected_version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "Capabilities": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "source_types",
      "artifact_families",
      "memory_extraction",
      "handoff_generation",
      "search_modes",
      "context_versions"
    ],
    "properties": {
      "source_types": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "artifact_families": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "memory_extraction": {
        "type": "boolean",
        "description": "Whether pending Sources can be extracted into Memory."
      },
      "experience_generation": {
        "type": "boolean",
        "default": false,
        "description": "Whether the configured model can generate reviewed Experience Candidates."
      },
      "managed_skill_generation": {
        "type": "boolean",
        "default": false,
        "description": "Whether the configured model can generate reviewed managed Skill Candidates."
      },
      "external_skill_registry": {
        "type": "boolean",
        "default": false,
        "description": "Whether host-local external Skill discovery and exact resolution are configured."
      },
      "handoff_generation": {
        "type": "boolean",
        "description": "Whether exact evidence can be generated into an inspectable Handoff Draft."
      },
      "search_modes": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/MemorySearchMode"
        }
      },
      "context_versions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PreparedContextSchema"
        }
      }
    }
  },
  "FamilyCount": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "family",
      "total"
    ],
    "properties": {
      "family": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "total": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "CandidateFamilyCount": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "family",
      "total",
      "pending",
      "approved",
      "rejected"
    ],
    "properties": {
      "family": {
        "$ref": "#/components/schemas/CandidateFamily"
      },
      "total": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "pending": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "approved": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "rejected": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "MemoryKindCount": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "kind",
      "total",
      "active",
      "inactive"
    ],
    "properties": {
      "kind": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128
      },
      "total": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "active": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "inactive": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "SourceInventoryStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "total",
      "memory_processed",
      "memory_pending"
    ],
    "properties": {
      "total": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "memory_processed": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "memory_pending": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "ArtifactInventoryStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "total",
      "by_family"
    ],
    "properties": {
      "total": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "by_family": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/FamilyCount"
        }
      }
    }
  },
  "CandidateInventoryStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "total",
      "pending",
      "approved",
      "rejected",
      "by_family"
    ],
    "properties": {
      "total": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "pending": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "approved": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "rejected": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "by_family": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CandidateFamilyCount"
        }
      }
    }
  },
  "MemoryEntryInventoryStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "total",
      "active",
      "inactive",
      "by_kind"
    ],
    "properties": {
      "total": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "active": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "inactive": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "by_kind": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/MemoryKindCount"
        }
      }
    }
  },
  "MemoryInventoryStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "entries"
    ],
    "properties": {
      "entries": {
        "$ref": "#/components/schemas/MemoryEntryInventoryStatistics"
      }
    }
  },
  "InventoryStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "sources",
      "artifacts",
      "candidates",
      "memory"
    ],
    "properties": {
      "sources": {
        "$ref": "#/components/schemas/SourceInventoryStatistics"
      },
      "artifacts": {
        "$ref": "#/components/schemas/ArtifactInventoryStatistics"
      },
      "candidates": {
        "$ref": "#/components/schemas/CandidateInventoryStatistics"
      },
      "memory": {
        "$ref": "#/components/schemas/MemoryInventoryStatistics"
      }
    }
  },
  "ModelUsageValue": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "requests",
      "input_tokens",
      "output_tokens"
    ],
    "properties": {
      "requests": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "input_tokens": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      },
      "output_tokens": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ModelUsageStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "generation",
      "embedding"
    ],
    "properties": {
      "generation": {
        "$ref": "#/components/schemas/ModelUsageValue"
      },
      "embedding": {
        "$ref": "#/components/schemas/ModelUsageValue"
      }
    }
  },
  "ModelUsagePurposeBreakdown": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "purpose",
      "generation",
      "embedding"
    ],
    "properties": {
      "purpose": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64
      },
      "generation": {
        "$ref": "#/components/schemas/ModelUsageValue"
      },
      "embedding": {
        "$ref": "#/components/schemas/ModelUsageValue"
      }
    }
  },
  "ModelUsageDay": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "date",
      "generation",
      "embedding",
      "by_purpose"
    ],
    "properties": {
      "date": {
        "type": "string",
        "format": "date"
      },
      "generation": {
        "$ref": "#/components/schemas/ModelUsageValue"
      },
      "embedding": {
        "$ref": "#/components/schemas/ModelUsageValue"
      },
      "by_purpose": {
        "type": "array",
        "maxItems": 16,
        "items": {
          "$ref": "#/components/schemas/ModelUsagePurposeBreakdown"
        }
      }
    }
  },
  "ResolvedUsagePeriod": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "preset",
      "start_date",
      "end_date",
      "timezone"
    ],
    "properties": {
      "preset": {
        "$ref": "#/components/schemas/StatsPeriod"
      },
      "start_date": {
        "type": "string",
        "format": "date"
      },
      "end_date": {
        "type": "string",
        "format": "date"
      },
      "timezone": {
        "type": "string",
        "enum": [
          "UTC"
        ]
      }
    }
  },
  "UsageStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "period",
      "totals",
      "by_purpose",
      "daily"
    ],
    "properties": {
      "period": {
        "$ref": "#/components/schemas/ResolvedUsagePeriod"
      },
      "totals": {
        "$ref": "#/components/schemas/ModelUsageStatistics"
      },
      "by_purpose": {
        "type": "array",
        "maxItems": 16,
        "items": {
          "$ref": "#/components/schemas/ModelUsagePurposeBreakdown"
        }
      },
      "daily": {
        "type": "array",
        "maxItems": 30,
        "items": {
          "$ref": "#/components/schemas/ModelUsageDay"
        }
      }
    }
  },
  "TokenEstimatorProfile": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "estimator_id",
      "version"
    ],
    "properties": {
      "estimator_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128
      },
      "version": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64
      }
    }
  },
  "RecallTokenValue": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "preparations",
      "ready_preparations",
      "comparable_preparations",
      "baseline_tokens",
      "recalled_tokens",
      "token_reduction"
    ],
    "properties": {
      "preparations": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "ready_preparations": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "comparable_preparations": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "baseline_tokens": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "recalled_tokens": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "token_reduction": {
        "type": "integer",
        "minimum": -9007199254740991,
        "maximum": 9007199254740991
      }
    }
  },
  "RecallTokenDay": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "date",
      "preparations",
      "ready_preparations",
      "comparable_preparations",
      "baseline_tokens",
      "recalled_tokens",
      "token_reduction"
    ],
    "properties": {
      "date": {
        "type": "string",
        "format": "date"
      },
      "preparations": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "ready_preparations": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "comparable_preparations": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "baseline_tokens": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "recalled_tokens": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "token_reduction": {
        "type": "integer",
        "minimum": -9007199254740991,
        "maximum": 9007199254740991
      }
    }
  },
  "RecallTokenStatistics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "period",
      "estimator",
      "totals",
      "daily"
    ],
    "properties": {
      "period": {
        "$ref": "#/components/schemas/ResolvedUsagePeriod"
      },
      "estimator": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/TokenEstimatorProfile"
          },
          {
            "type": "null"
          }
        ]
      },
      "totals": {
        "$ref": "#/components/schemas/RecallTokenValue"
      },
      "daily": {
        "type": "array",
        "maxItems": 30,
        "items": {
          "$ref": "#/components/schemas/RecallTokenDay"
        }
      }
    }
  },
  "ScopedStats": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "as_of",
      "inventory",
      "usage",
      "recall"
    ],
    "properties": {
      "scope_id": {
        "type": "string"
      },
      "as_of": {
        "type": "string",
        "format": "date-time"
      },
      "inventory": {
        "$ref": "#/components/schemas/InventoryStatistics"
      },
      "usage": {
        "$ref": "#/components/schemas/UsageStatistics"
      },
      "recall": {
        "$ref": "#/components/schemas/RecallTokenStatistics"
      }
    }
  },
  "GetStatsRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "period": {
        "$ref": "#/components/schemas/StatsPeriod",
        "default": "30d"
      }
    }
  },
  "WorkClaimBasis": {
    "type": "string",
    "enum": [
      "declared",
      "verified"
    ]
  },
  "WorkClaim": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "text",
      "basis",
      "evidence"
    ],
    "properties": {
      "text": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "basis": {
        "$ref": "#/components/schemas/WorkClaimBasis"
      },
      "evidence": {
        "type": "array",
        "maxItems": 31,
        "items": {
          "$ref": "#/components/schemas/HandoffCitation"
        }
      }
    }
  },
  "WorkContract": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "trust",
      "objective",
      "facts",
      "in_scope",
      "exclusions",
      "completion_criteria",
      "authorization_notes",
      "open_questions"
    ],
    "properties": {
      "schema": {
        "type": "string",
        "enum": [
          "powercontext.work-contract.v1"
        ]
      },
      "trust": {
        "type": "string",
        "enum": [
          "untrusted_input"
        ]
      },
      "objective": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "facts": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/WorkClaim"
        }
      },
      "in_scope": {
        "type": "array",
        "minItems": 1,
        "maxItems": 64,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 8192,
          "pattern": ".*\\S.*"
        }
      },
      "exclusions": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 8192,
          "pattern": ".*\\S.*"
        }
      },
      "completion_criteria": {
        "type": "array",
        "minItems": 1,
        "maxItems": 64,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 8192,
          "pattern": ".*\\S.*"
        }
      },
      "authorization_notes": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 8192,
          "pattern": ".*\\S.*"
        }
      },
      "open_questions": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 8192,
          "pattern": ".*\\S.*"
        }
      }
    }
  },
  "CreateWorkContractRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "source_id",
      "contract"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "source_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "contract": {
        "$ref": "#/components/schemas/WorkContract"
      }
    }
  },
  "CurrentWorkHandoff": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "trust",
      "objective",
      "state",
      "disposition",
      "next_action",
      "omissions"
    ],
    "properties": {
      "schema": {
        "type": "string",
        "enum": [
          "powercontext.current-work-handoff.v1"
        ]
      },
      "trust": {
        "type": "string",
        "enum": [
          "untrusted_input"
        ]
      },
      "objective": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "state": {
        "type": "array",
        "minItems": 1,
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/WorkClaim"
        }
      },
      "disposition": {
        "$ref": "#/components/schemas/HandoffDisposition"
      },
      "next_action": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/WorkClaim"
          },
          {
            "type": "null"
          }
        ]
      },
      "omissions": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 8192,
          "pattern": ".*\\S.*"
        }
      }
    }
  },
  "HandoffCurrentWorkRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "source_id",
      "handoff"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "source_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "handoff": {
        "$ref": "#/components/schemas/CurrentWorkHandoff"
      }
    }
  },
  "WorkSourceKind": {
    "type": "string",
    "enum": [
      "work-contract",
      "handoff-boundary",
      "handoff-receipt",
      "task-outcome"
    ]
  },
  "WorkSourceReceipt": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "kind",
      "source",
      "position",
      "content_digest"
    ],
    "properties": {
      "kind": {
        "$ref": "#/components/schemas/WorkSourceKind"
      },
      "source": {
        "$ref": "#/components/schemas/SourceReference"
      },
      "position": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      },
      "content_digest": {
        "type": "string",
        "minLength": 71,
        "maxLength": 71,
        "pattern": "^sha256:[0-9a-f]{64}$"
      }
    }
  },
  "PreparedWorkHandoff": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "boundary",
      "handoff"
    ],
    "properties": {
      "boundary": {
        "$ref": "#/components/schemas/WorkSourceReceipt"
      },
      "handoff": {
        "$ref": "#/components/schemas/PreparedHandoff"
      }
    }
  },
  "HandoffReceiptStatus": {
    "type": "string",
    "enum": [
      "accepted",
      "needs_clarification",
      "declined"
    ]
  },
  "HandoffAcknowledgementSelection": {
    "type": "string",
    "enum": [
      "prepared",
      "exact"
    ]
  },
  "LiveStateCheckStatus": {
    "type": "string",
    "enum": [
      "confirmed",
      "mismatch",
      "not_checked"
    ]
  },
  "ReceiverReadinessCheckStatus": {
    "type": "string",
    "enum": [
      "confirmed",
      "insufficient",
      "not_checked"
    ]
  },
  "ReceiverChecks": {
    "type": "object",
    "additionalProperties": false,
    "description": "Untrusted receiver self-attestation kept separate from citation availability. All three values must be confirmed when status is accepted.",
    "required": [
      "live_state",
      "capability",
      "authorization"
    ],
    "properties": {
      "live_state": {
        "$ref": "#/components/schemas/LiveStateCheckStatus"
      },
      "capability": {
        "$ref": "#/components/schemas/ReceiverReadinessCheckStatus"
      },
      "authorization": {
        "$ref": "#/components/schemas/ReceiverReadinessCheckStatus"
      }
    }
  },
  "AcknowledgeHandoffRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "source_id",
      "receiver",
      "status",
      "selection"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "source_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "receiver": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "status": {
        "$ref": "#/components/schemas/HandoffReceiptStatus"
      },
      "selection": {
        "$ref": "#/components/schemas/HandoffAcknowledgementSelection"
      },
      "receiver_checks": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ReceiverChecks"
          },
          {
            "type": "null"
          }
        ]
      },
      "prepared": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/PreparedHandoff"
          },
          {
            "type": "null"
          }
        ]
      },
      "revision": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "message": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 8192,
            "pattern": ".*\\S.*"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "HandoffAcknowledgement": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "resolution",
      "receipt"
    ],
    "properties": {
      "resolution": {
        "$ref": "#/components/schemas/HandoffResolution"
      },
      "receipt": {
        "$ref": "#/components/schemas/WorkSourceReceipt"
      }
    }
  },
  "TaskOutcomeStatus": {
    "type": "string",
    "enum": [
      "succeeded",
      "partial",
      "blocked",
      "failed",
      "cancelled",
      "unknown"
    ]
  },
  "TaskCheckStatus": {
    "type": "string",
    "enum": [
      "passed",
      "failed",
      "skipped",
      "timed_out",
      "unavailable",
      "cancelled",
      "unknown"
    ]
  },
  "TaskCheck": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "name",
      "status",
      "basis",
      "evidence"
    ],
    "properties": {
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "status": {
        "$ref": "#/components/schemas/TaskCheckStatus"
      },
      "details": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 8192,
            "pattern": ".*\\S.*"
          },
          {
            "type": "null"
          }
        ]
      },
      "basis": {
        "$ref": "#/components/schemas/WorkClaimBasis"
      },
      "evidence": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffCitation"
        }
      }
    }
  },
  "TaskOutcome": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "trust",
      "objective",
      "status",
      "summary",
      "observations",
      "checks",
      "produced_artifacts",
      "remaining_work"
    ],
    "properties": {
      "schema": {
        "type": "string",
        "enum": [
          "powercontext.task-outcome.v1"
        ]
      },
      "trust": {
        "type": "string",
        "enum": [
          "untrusted_observation"
        ]
      },
      "objective": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "status": {
        "$ref": "#/components/schemas/TaskOutcomeStatus"
      },
      "summary": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "handoff_receipt_ref": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/SourceReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "observations": {
        "type": "array",
        "minItems": 1,
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/WorkClaim"
        }
      },
      "checks": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/TaskCheck"
        }
      },
      "produced_artifacts": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      },
      "remaining_work": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 8192,
          "pattern": ".*\\S.*"
        }
      }
    }
  },
  "RecordTaskOutcomeRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "source_id",
      "outcome"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "source_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "outcome": {
        "$ref": "#/components/schemas/TaskOutcome"
      }
    }
  },
  "CaptureContentSourceRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "source_id",
      "content"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "source_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "content": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200000
      },
      "metadata": {
        "anyOf": [
          {
            "type": "object",
            "additionalProperties": true
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "CaptureContentSourceResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "status",
      "source",
      "position"
    ],
    "properties": {
      "status": {
        "$ref": "#/components/schemas/CaptureStatus"
      },
      "source": {
        "$ref": "#/components/schemas/SourceReference"
      },
      "position": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "CommitHandoffRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "handoff"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "handoff": {
        "$ref": "#/components/schemas/PreparedHandoff"
      }
    }
  },
  "CommittedHandoff": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "reference",
      "content",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "reference": {
        "$ref": "#/components/schemas/ArtifactReference"
      },
      "content": {
        "$ref": "#/components/schemas/HandoffContent"
      },
      "source_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      }
    }
  },
  "ContinueHandoffRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "selection"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "selection": {
        "$ref": "#/components/schemas/HandoffSelection"
      },
      "prepared": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/PreparedHandoff"
          },
          {
            "type": "null"
          }
        ]
      },
      "revision": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "FinalizeHandoffRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "draft"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "draft": {
        "$ref": "#/components/schemas/HandoffDraft"
      }
    }
  },
  "HandoffArtifactCitation": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "kind",
      "artifact_ref"
    ],
    "properties": {
      "kind": {
        "type": "string",
        "enum": [
          "artifact"
        ]
      },
      "artifact_ref": {
        "$ref": "#/components/schemas/ArtifactReference"
      }
    }
  },
  "HandoffActivation": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "status",
      "boundary_source",
      "previous_position",
      "current_position",
      "draft"
    ],
    "properties": {
      "status": {
        "$ref": "#/components/schemas/HandoffActivationStatus"
      },
      "boundary_source": {
        "$ref": "#/components/schemas/SourceReference"
      },
      "previous_position": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "current_position": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "draft": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffDraft"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "HandoffCitation": {
    "oneOf": [
      {
        "$ref": "#/components/schemas/HandoffSourceCitation"
      },
      {
        "$ref": "#/components/schemas/HandoffArtifactCitation"
      },
      {
        "$ref": "#/components/schemas/HandoffMemoryCitation"
      }
    ],
    "discriminator": {
      "propertyName": "kind",
      "mapping": {
        "source": "#/components/schemas/HandoffSourceCitation",
        "artifact": "#/components/schemas/HandoffArtifactCitation",
        "memory": "#/components/schemas/HandoffMemoryCitation"
      }
    }
  },
  "HandoffContent": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "objective",
      "state",
      "disposition",
      "next_action",
      "omissions"
    ],
    "properties": {
      "schema": {
        "$ref": "#/components/schemas/HandoffSchema"
      },
      "objective": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "state": {
        "type": "array",
        "minItems": 1,
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/HandoffStatement"
        }
      },
      "disposition": {
        "$ref": "#/components/schemas/HandoffDisposition"
      },
      "next_action": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffStatement"
          },
          {
            "type": "null"
          }
        ]
      },
      "omissions": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/HandoffOmission"
        }
      }
    }
  },
  "HandoffDraft": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "objective",
      "state",
      "disposition",
      "next_action",
      "omissions"
    ],
    "properties": {
      "objective": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "state": {
        "type": "array",
        "minItems": 1,
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/HandoffStatement"
        }
      },
      "disposition": {
        "$ref": "#/components/schemas/HandoffDisposition"
      },
      "next_action": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffStatement"
          },
          {
            "type": "null"
          }
        ]
      },
      "omissions": {
        "type": "array",
        "maxItems": 64,
        "items": {
          "$ref": "#/components/schemas/HandoffOmission"
        }
      }
    }
  },
  "HandoffEvidenceCheck": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "claim",
      "state_index",
      "status",
      "unavailable_evidence"
    ],
    "properties": {
      "claim": {
        "$ref": "#/components/schemas/HandoffClaim"
      },
      "state_index": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      },
      "status": {
        "$ref": "#/components/schemas/HandoffEvidenceStatus"
      },
      "unavailable_evidence": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffCitation"
        }
      }
    }
  },
  "HandoffMemoryCitation": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "kind",
      "memory_citation"
    ],
    "properties": {
      "kind": {
        "type": "string",
        "enum": [
          "memory"
        ]
      },
      "memory_citation": {
        "$ref": "#/components/schemas/MemoryCitation"
      }
    }
  },
  "HandoffOmission": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "text",
      "citation"
    ],
    "properties": {
      "text": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "citation": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffCitation"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "HandoffResolution": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "trust",
      "status",
      "scope_id",
      "content",
      "selection",
      "selected_revision",
      "current_revision",
      "evidence_checks"
    ],
    "properties": {
      "trust": {
        "type": "string",
        "enum": [
          "untrusted_history"
        ]
      },
      "status": {
        "$ref": "#/components/schemas/HandoffResolutionStatus"
      },
      "scope_id": {
        "type": "string"
      },
      "content": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffContent"
          },
          {
            "type": "null"
          }
        ]
      },
      "selection": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffSelection"
          },
          {
            "type": "null"
          }
        ]
      },
      "selected_revision": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "current_revision": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "evidence_checks": {
        "type": "array",
        "maxItems": 65,
        "items": {
          "$ref": "#/components/schemas/HandoffEvidenceCheck"
        }
      }
    }
  },
  "HandoffSourceCitation": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "kind",
      "source_ref"
    ],
    "properties": {
      "kind": {
        "type": "string",
        "enum": [
          "source"
        ]
      },
      "source_ref": {
        "$ref": "#/components/schemas/SourceReference"
      }
    }
  },
  "HandoffStatement": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "text",
      "citations"
    ],
    "properties": {
      "text": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "citations": {
        "type": "array",
        "minItems": 1,
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffCitation"
        }
      }
    }
  },
  "PrepareHandoffRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "objective",
      "evidence"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "objective": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "evidence": {
        "type": "array",
        "minItems": 1,
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffCitation"
        }
      },
      "max_bytes": {
        "type": "integer",
        "minimum": 512,
        "maximum": 32768,
        "default": 8000
      }
    }
  },
  "PreparedHandoff": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "scope_id",
      "base",
      "content"
    ],
    "properties": {
      "schema": {
        "$ref": "#/components/schemas/PreparedHandoffSchema"
      },
      "scope_id": {
        "type": "string"
      },
      "base": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "content": {
        "$ref": "#/components/schemas/HandoffContent"
      }
    }
  },
  "PreparedContext": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "status",
      "content",
      "content_bytes"
    ],
    "properties": {
      "schema": {
        "$ref": "#/components/schemas/PreparedContextSchema"
      },
      "status": {
        "$ref": "#/components/schemas/PreparedContextStatus"
      },
      "content": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "content_bytes": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "EntryChange": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "op",
      "entry_id",
      "from_entry_version_id",
      "to_entry_version_id",
      "reason"
    ],
    "properties": {
      "op": {
        "$ref": "#/components/schemas/EntryChangeOperation"
      },
      "entry_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "from_entry_version_id": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 128,
            "pattern": "^[\\x21-\\x7E]+$"
          },
          {
            "type": "null"
          }
        ]
      },
      "to_entry_version_id": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 128,
            "pattern": "^[\\x21-\\x7E]+$"
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ExperienceArtifact": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "artifact",
      "content",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "artifact": {
        "$ref": "#/components/schemas/ArtifactReference"
      },
      "content": {
        "$ref": "#/components/schemas/ExperienceProposal"
      },
      "source_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      }
    }
  },
  "ExperienceProposal": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "situation",
      "action",
      "outcome",
      "lesson"
    ],
    "properties": {
      "situation": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8000,
        "pattern": ".*\\S.*"
      },
      "action": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8000,
        "pattern": ".*\\S.*"
      },
      "outcome": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8000,
        "pattern": ".*\\S.*"
      },
      "lesson": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8000,
        "pattern": ".*\\S.*"
      }
    }
  },
  "SkillArtifact": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "artifact",
      "content",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "artifact": {
        "$ref": "#/components/schemas/ArtifactReference"
      },
      "content": {
        "$ref": "#/components/schemas/SkillProposal"
      },
      "source_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      }
    }
  },
  "SkillProposal": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "name",
      "description",
      "instructions",
      "validation"
    ],
    "properties": {
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^\\S(?:.*\\S)?$"
      },
      "description": {
        "type": "string",
        "minLength": 1,
        "maxLength": 2000,
        "pattern": "^\\S(?:.*\\S)?$"
      },
      "instructions": {
        "type": "string",
        "minLength": 1,
        "maxLength": 32000,
        "pattern": ".*\\S.*"
      },
      "validation": {
        "type": "array",
        "minItems": 1,
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/SkillValidationItem"
        }
      }
    }
  },
  "SkillValidationItem": {
    "type": "string",
    "minLength": 1,
    "maxLength": 2000,
    "pattern": "^\\S(?:.*\\S)?$"
  },
  "ExternalSkillRegistration": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "external_skill_id",
      "provider",
      "agent_kind",
      "host_id",
      "installation_scope",
      "locator",
      "fingerprint",
      "name",
      "description"
    ],
    "properties": {
      "external_skill_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "provider": {
        "type": "string",
        "enum": [
          "codex"
        ]
      },
      "agent_kind": {
        "type": "string",
        "enum": [
          "codex"
        ]
      },
      "host_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^\\S(?:.*\\S)?$"
      },
      "installation_scope": {
        "$ref": "#/components/schemas/ExternalSkillInstallationScope"
      },
      "locator": {
        "type": "string",
        "minLength": 1,
        "maxLength": 2000,
        "pattern": "^\\S(?:.*\\S)?$",
        "description": "Host-local locator; not a cross-Agent or cross-host contract."
      },
      "fingerprint": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^\\S(?:.*\\S)?$"
      },
      "description": {
        "type": "string",
        "minLength": 1,
        "maxLength": 2000,
        "pattern": "^\\S(?:.*\\S)?$"
      }
    }
  },
  "ExternalSkillResolution": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "registration",
      "status",
      "entrypoint"
    ],
    "properties": {
      "registration": {
        "$ref": "#/components/schemas/ExternalSkillRegistration"
      },
      "status": {
        "$ref": "#/components/schemas/ExternalSkillResolutionStatus"
      },
      "entrypoint": {
        "anyOf": [
          {
            "type": "string",
            "description": "Host-local SKILL.md path; present only when the exact fingerprint is available."
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ScanExternalSkillsResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "registrations",
      "skipped"
    ],
    "properties": {
      "registrations": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ExternalSkillRegistration"
        }
      },
      "skipped": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "ListExternalSkillsResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "skills"
    ],
    "properties": {
      "skills": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ExternalSkillResolution"
        }
      }
    }
  },
  "ErrorDetail": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "code",
      "message",
      "details"
    ],
    "properties": {
      "code": {
        "type": "string"
      },
      "message": {
        "type": "string"
      },
      "details": {
        "anyOf": [
          {
            "type": "object",
            "additionalProperties": true
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ErrorResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "error"
    ],
    "properties": {
      "error": {
        "$ref": "#/components/schemas/ErrorDetail"
      }
    }
  },
  "FlushMemoryRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      }
    }
  },
  "FlushMemoryResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "status",
      "previous_cursor",
      "current_cursor",
      "high_watermark",
      "processed_source_count"
    ],
    "properties": {
      "status": {
        "$ref": "#/components/schemas/FlushStatus"
      },
      "previous_cursor": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "current_cursor": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "high_watermark": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "processed_source_count": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      },
      "memory": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "GetMemoryEntryRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "citation"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "citation": {
        "$ref": "#/components/schemas/MemoryCitation"
      }
    }
  },
  "GetArtifactCandidateRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "candidate_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "candidate_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      }
    }
  },
  "GetExperienceRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "artifact"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "artifact": {
        "$ref": "#/components/schemas/ArtifactReference"
      }
    }
  },
  "GetSkillRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "artifact"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "artifact": {
        "$ref": "#/components/schemas/ArtifactReference"
      }
    }
  },
  "CreateHandoffReportProjectRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_key",
      "title"
    ],
    "properties": {
      "project_key": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "description": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      },
      "default_locale": {
        "$ref": "#/components/schemas/ReportLocale",
        "default": "zh-CN"
      },
      "timezone": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "default": "UTC"
      }
    }
  },
  "ListHandoffReportProjectsRequest": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "cursor": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "limit": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 50
      },
      "include_archived": {
        "type": "boolean",
        "default": false
      }
    }
  },
  "GetHandoffReportProjectRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id"
    ],
    "properties": {
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      }
    }
  },
  "UpdateHandoffReportProjectRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project",
      "expected_version"
    ],
    "properties": {
      "project": {
        "$ref": "#/components/schemas/ProjectDescriptor"
      },
      "expected_version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "RegisterHandoffReportWorkstreamRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "scope_id",
      "title",
      "kind"
    ],
    "properties": {
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "key": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 64
          },
          {
            "type": "null"
          }
        ]
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "kind": {
        "$ref": "#/components/schemas/WorkstreamKind"
      },
      "catalog_state": {
        "$ref": "#/components/schemas/ReportCatalogState",
        "default": "included"
      },
      "external_refs": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffReportExternalReference"
        },
        "default": []
      },
      "labels": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        },
        "default": []
      }
    }
  },
  "ListHandoffReportWorkstreamsRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id"
    ],
    "properties": {
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "cursor": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "limit": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 50
      },
      "include_archived": {
        "type": "boolean",
        "default": false
      }
    }
  },
  "UpdateHandoffReportWorkstreamRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "workstream",
      "expected_version"
    ],
    "properties": {
      "workstream": {
        "$ref": "#/components/schemas/WorkstreamDescriptor"
      },
      "expected_version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "GetHandoffReportRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id"
    ],
    "properties": {
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "locale": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ReportLocale"
          },
          {
            "type": "null"
          }
        ]
      },
      "include_evidence_checks": {
        "type": "boolean",
        "default": true
      },
      "format": {
        "$ref": "#/components/schemas/ReportFormat",
        "default": "markdown"
      },
      "include_archived": {
        "type": "boolean",
        "default": false
      },
      "download": {
        "type": "boolean",
        "default": false
      },
      "period": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffReportPeriodRequest"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "HandoffReportPeriodRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "start",
      "end"
    ],
    "properties": {
      "start": {
        "type": "string",
        "format": "date-time"
      },
      "end": {
        "type": "string",
        "format": "date-time"
      },
      "timezone": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "compare_to_previous_period": {
        "type": "boolean",
        "default": false
      }
    }
  },
  "HandoffReportResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "format",
      "report",
      "markdown",
      "selection_digest",
      "report_digest"
    ],
    "properties": {
      "format": {
        "$ref": "#/components/schemas/ReportFormat"
      },
      "report": {
        "anyOf": [
          {
            "type": "object",
            "additionalProperties": true
          },
          {
            "type": "null"
          }
        ]
      },
      "markdown": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "selection_digest": {
        "type": "string",
        "pattern": "^sha256:[0-9a-f]{64}$"
      },
      "report_digest": {
        "type": "string",
        "pattern": "^sha256:[0-9a-f]{64}$"
      }
    }
  },
  "ReportActivitySource": {
    "type": "string",
    "enum": [
      "handoff_observation",
      "git_commit",
      "git_worktree",
      "coding_session",
      "other"
    ]
  },
  "ReportTimeBasis": {
    "type": "string",
    "enum": [
      "source_reported",
      "host_observed",
      "first_seen",
      "current_only",
      "unknown"
    ]
  },
  "HandoffReportActivityAgent": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "provider": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 64
          },
          {
            "type": "null"
          }
        ]
      },
      "label": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 128
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "HandoffReportActivityVcsContext": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "branch": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "head_revision": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "RecordHandoffReportActivityRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "source",
      "source_event_id",
      "time_basis"
    ],
    "properties": {
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "scope_id": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "source": {
        "$ref": "#/components/schemas/ReportActivitySource"
      },
      "source_event_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "source_ref": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffReportExternalReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "occurred_at": {
        "anyOf": [
          {
            "type": "string",
            "format": "date-time"
          },
          {
            "type": "null"
          }
        ]
      },
      "time_basis": {
        "$ref": "#/components/schemas/ReportTimeBasis"
      },
      "title": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "summary": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      },
      "agent": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffReportActivityAgent"
          },
          {
            "type": "null"
          }
        ]
      },
      "session_id": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "vcs_context": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffReportActivityVcsContext"
          },
          {
            "type": "null"
          }
        ]
      },
      "evidence_refs": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffReportExternalReference"
        },
        "default": []
      }
    }
  },
  "HandoffReportActivity": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "event_id",
      "project_id",
      "scope_id",
      "source",
      "source_event_id",
      "source_ref",
      "occurred_at",
      "observed_at",
      "time_basis",
      "title",
      "summary",
      "agent",
      "session_id",
      "vcs_context",
      "evidence_refs",
      "trust"
    ],
    "properties": {
      "schema": {
        "type": "string",
        "enum": [
          "powercontext.handoff-report-activity.v1"
        ]
      },
      "event_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "scope_id": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "source": {
        "$ref": "#/components/schemas/ReportActivitySource"
      },
      "source_event_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "source_ref": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffReportExternalReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "occurred_at": {
        "anyOf": [
          {
            "type": "string",
            "format": "date-time"
          },
          {
            "type": "null"
          }
        ]
      },
      "observed_at": {
        "type": "string",
        "format": "date-time"
      },
      "time_basis": {
        "$ref": "#/components/schemas/ReportTimeBasis"
      },
      "title": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "summary": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      },
      "agent": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffReportActivityAgent"
          },
          {
            "type": "null"
          }
        ]
      },
      "session_id": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "vcs_context": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/HandoffReportActivityVcsContext"
          },
          {
            "type": "null"
          }
        ]
      },
      "evidence_refs": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffReportExternalReference"
        }
      },
      "trust": {
        "type": "string",
        "enum": [
          "untrusted_observation"
        ]
      }
    }
  },
  "StoredHandoffReportActivity": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "cursor",
      "event"
    ],
    "properties": {
      "cursor": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      },
      "event": {
        "$ref": "#/components/schemas/HandoffReportActivity"
      }
    }
  },
  "ListHandoffReportActivitiesRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id"
    ],
    "properties": {
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "period_start": {
        "anyOf": [
          {
            "type": "string",
            "format": "date-time"
          },
          {
            "type": "null"
          }
        ]
      },
      "period_end": {
        "anyOf": [
          {
            "type": "string",
            "format": "date-time"
          },
          {
            "type": "null"
          }
        ]
      },
      "sources": {
        "anyOf": [
          {
            "type": "array",
            "maxItems": 5,
            "items": {
              "$ref": "#/components/schemas/ReportActivitySource"
            }
          },
          {
            "type": "null"
          }
        ]
      },
      "after_cursor": {
        "type": "integer",
        "minimum": 0,
        "default": 0,
        "maximum": 9007199254740991
      },
      "through_cursor": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      },
      "limit": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 50
      }
    }
  },
  "HandoffReportActivityPage": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "items",
      "next_cursor",
      "high_watermark"
    ],
    "properties": {
      "items": {
        "type": "array",
        "maxItems": 100,
        "items": {
          "$ref": "#/components/schemas/HandoffReportActivity"
        }
      },
      "next_cursor": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      },
      "high_watermark": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "PurgeHandoffReportActivitiesRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "observed_before"
    ],
    "properties": {
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "observed_before": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "PurgeHandoffReportActivitiesResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deleted_count"
    ],
    "properties": {
      "deleted_count": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    }
  },
  "HandoffReportRepositoryRef": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "provider",
      "repository_id",
      "normalized_remote",
      "subpath"
    ],
    "properties": {
      "provider": {
        "type": "string",
        "enum": [
          "github",
          "gitlab",
          "local",
          "other"
        ]
      },
      "repository_id": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 256
          },
          {
            "type": "null"
          }
        ]
      },
      "normalized_remote": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2048
          },
          {
            "type": "null"
          }
        ]
      },
      "subpath": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 1024
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "HandoffReportWorkspaceBinding": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "workspace_instance_id",
      "project_id",
      "repository_ref",
      "state",
      "confirmed_at",
      "version"
    ],
    "properties": {
      "schema": {
        "type": "string",
        "enum": [
          "powercontext.workspace-binding.v1"
        ]
      },
      "workspace_instance_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "repository_ref": {
        "$ref": "#/components/schemas/HandoffReportRepositoryRef"
      },
      "state": {
        "type": "string",
        "enum": [
          "confirmed",
          "detached"
        ]
      },
      "confirmed_at": {
        "type": "string",
        "format": "date-time"
      },
      "version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "GetHandoffReportWorkspaceRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "workspace_instance_id"
    ],
    "properties": {
      "workspace_instance_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      }
    }
  },
  "AttachHandoffReportWorkspaceRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "workspace_instance_id",
      "project_id",
      "repository_ref",
      "expected_version"
    ],
    "properties": {
      "workspace_instance_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "repository_ref": {
        "$ref": "#/components/schemas/HandoffReportRepositoryRef"
      },
      "expected_version": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "DetachHandoffReportWorkspaceRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "workspace_instance_id",
      "expected_version"
    ],
    "properties": {
      "workspace_instance_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "expected_version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "ProjectDescriptor": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "project_id",
      "project_key",
      "title",
      "description",
      "default_locale",
      "timezone",
      "catalog_state",
      "version"
    ],
    "properties": {
      "schema": {
        "type": "string",
        "enum": [
          "powercontext.project.v1"
        ]
      },
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "project_key": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "description": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      },
      "default_locale": {
        "$ref": "#/components/schemas/ReportLocale"
      },
      "timezone": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "catalog_state": {
        "$ref": "#/components/schemas/ReportCatalogState"
      },
      "version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "ProjectPage": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "items",
      "next_cursor"
    ],
    "properties": {
      "items": {
        "type": "array",
        "maxItems": 100,
        "items": {
          "$ref": "#/components/schemas/ProjectDescriptor"
        }
      },
      "next_cursor": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "WorkstreamDescriptor": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "scope_id",
      "project_id",
      "key",
      "title",
      "kind",
      "catalog_state",
      "external_refs",
      "labels",
      "version"
    ],
    "properties": {
      "schema": {
        "type": "string",
        "enum": [
          "powercontext.workstream.v1"
        ]
      },
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "project_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "key": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 64
          },
          {
            "type": "null"
          }
        ]
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "kind": {
        "$ref": "#/components/schemas/WorkstreamKind"
      },
      "catalog_state": {
        "$ref": "#/components/schemas/ReportCatalogState"
      },
      "external_refs": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "$ref": "#/components/schemas/HandoffReportExternalReference"
        }
      },
      "labels": {
        "type": "array",
        "maxItems": 32,
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        }
      },
      "version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      }
    }
  },
  "WorkstreamPage": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "items",
      "next_cursor"
    ],
    "properties": {
      "items": {
        "type": "array",
        "maxItems": 100,
        "items": {
          "$ref": "#/components/schemas/WorkstreamDescriptor"
        }
      },
      "next_cursor": {
        "anyOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "HandoffReportExternalReference": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "kind",
      "provider",
      "external_id",
      "url"
    ],
    "properties": {
      "kind": {
        "type": "string",
        "enum": [
          "issue",
          "task",
          "pull_request",
          "branch",
          "feature",
          "release",
          "program",
          "other"
        ]
      },
      "provider": {
        "type": "string",
        "minLength": 1,
        "maxLength": 64
      },
      "external_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256
      },
      "url": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 2048
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ReportLocale": {
    "type": "string",
    "enum": [
      "zh-CN",
      "en"
    ]
  },
  "ReportFormat": {
    "type": "string",
    "enum": [
      "json",
      "markdown"
    ]
  },
  "ReportCatalogState": {
    "type": "string",
    "enum": [
      "included",
      "archived"
    ]
  },
  "WorkstreamKind": {
    "type": "string",
    "enum": [
      "feature",
      "bug",
      "refactor",
      "operations",
      "research",
      "other"
    ]
  },
  "HealthResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "status"
    ],
    "properties": {
      "status": {
        "type": "string"
      }
    }
  },
  "ListMemoryChangesRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "since_revision": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 0,
            "description": "Exclusive lower bound; 0 requests complete history from Revision 1. Positive nonexistent revisions are errors.",
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ListMemoryChangesResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "revisions"
    ],
    "properties": {
      "memory": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "revisions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/MemoryRevisionChanges"
        }
      }
    }
  },
  "ListMemoryEntriesRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "include_inactive": {
        "type": "boolean",
        "default": false,
        "description": "Include inactive entries from the current Memory head for explicit audit."
      }
    }
  },
  "ListMemoryEntriesResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "entries"
    ],
    "properties": {
      "memory": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "entries": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/MemoryEntry"
        }
      }
    }
  },
  "ListArtifactCandidatesRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "status": {
        "$ref": "#/components/schemas/CandidateStatus",
        "default": "pending"
      },
      "family": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/CandidateFamily"
          },
          {
            "type": "null"
          }
        ]
      },
      "cursor": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 128
          },
          {
            "type": "null"
          }
        ]
      },
      "limit": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 50
      }
    }
  },
  "ListExternalSkillsRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "include_unavailable": {
        "type": "boolean",
        "default": false
      }
    }
  },
  "MemoryEntry": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "citation",
      "version",
      "kind",
      "text",
      "state",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "citation": {
        "$ref": "#/components/schemas/MemoryCitation"
      },
      "version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      },
      "kind": {
        "type": "string"
      },
      "text": {
        "type": "string"
      },
      "state": {
        "$ref": "#/components/schemas/MemoryEntryState"
      },
      "source_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      }
    }
  },
  "MemoryMutationResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "memory"
    ],
    "properties": {
      "memory": {
        "$ref": "#/components/schemas/ArtifactReference"
      },
      "entry": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/MemoryEntry"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "MemoryCitation": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "memory_ref",
      "entry_id",
      "entry_version_id"
    ],
    "properties": {
      "memory_ref": {
        "$ref": "#/components/schemas/ArtifactReference"
      },
      "entry_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "entry_version_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      }
    }
  },
  "MemoryRevisionChanges": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "memory_ref",
      "changes"
    ],
    "properties": {
      "memory_ref": {
        "$ref": "#/components/schemas/ArtifactReference"
      },
      "changes": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/EntryChange"
        }
      }
    }
  },
  "PrepareContextRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "query"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "query": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192,
        "pattern": ".*\\S.*"
      },
      "max_bytes": {
        "type": "integer",
        "minimum": 512,
        "maximum": 32768,
        "default": 8000
      }
    }
  },
  "ProposeExperienceRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "proposal",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "proposal": {
        "$ref": "#/components/schemas/ExperienceProposal"
      },
      "source_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      },
      "target": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "GenerateExperienceRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "source_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      },
      "target": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ProposeSkillRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "proposal",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "proposal": {
        "$ref": "#/components/schemas/SkillProposal"
      },
      "source_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      },
      "target": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "SkillGenerationOrigin": {
    "type": "string",
    "enum": [
      "experience",
      "source",
      "usage"
    ],
    "description": "The operation-specific direct provenance shape required for managed Skill generation."
  },
  "GenerateSkillRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "origin",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "origin": {
        "$ref": "#/components/schemas/SkillGenerationOrigin"
      },
      "source_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      },
      "target": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "GeneratedCandidateStatus": {
    "type": "string",
    "enum": [
      "pending",
      "no_op"
    ]
  },
  "GeneratedCandidateResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "status",
      "candidate"
    ],
    "properties": {
      "status": {
        "$ref": "#/components/schemas/GeneratedCandidateStatus"
      },
      "candidate": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactCandidate"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ReadinessResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "status",
      "checks"
    ],
    "properties": {
      "status": {
        "$ref": "#/components/schemas/ReadinessStatus"
      },
      "checks": {
        "type": "object",
        "additionalProperties": {
          "type": "string"
        }
      }
    }
  },
  "ReadinessStatus": {
    "type": "string",
    "enum": [
      "ready",
      "degraded",
      "not_ready"
    ]
  },
  "RememberMemoryRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "kind",
      "text"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "kind": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128
      },
      "text": {
        "type": "string",
        "minLength": 1,
        "description": "Must not exceed 8192 UTF-8 bytes after normalization."
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 512
          },
          {
            "type": "null"
          }
        ]
      },
      "expected_revision": {
        "anyOf": [
          {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "RetireMemoryEntryRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "citation"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "citation": {
        "$ref": "#/components/schemas/MemoryCitation"
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 512
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "RejectArtifactCandidateRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "candidate_id",
      "expected_version",
      "reason"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "candidate_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "expected_version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      },
      "reason": {
        "type": "string",
        "minLength": 1,
        "maxLength": 2000,
        "pattern": ".*\\S.*"
      }
    }
  },
  "ReviseArtifactCandidateRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "candidate_id",
      "expected_version",
      "proposal",
      "source_refs",
      "artifact_refs"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "candidate_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "expected_version": {
        "type": "integer",
        "minimum": 1,
        "maximum": 9007199254740991
      },
      "proposal": {
        "oneOf": [
          {
            "$ref": "#/components/schemas/ExperienceProposal"
          },
          {
            "$ref": "#/components/schemas/SkillProposal"
          }
        ]
      },
      "source_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Source evidence. Counted with artifact_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/SourceReference"
        }
      },
      "artifact_refs": {
        "type": "array",
        "maxItems": 32,
        "description": "Exact Artifact evidence. Counted with source_refs toward a combined maximum of 32 references.",
        "items": {
          "$ref": "#/components/schemas/ArtifactReference"
        }
      },
      "target": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "ReviseMemoryEntryRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "citation",
      "kind",
      "text"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "citation": {
        "$ref": "#/components/schemas/MemoryCitation"
      },
      "kind": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128
      },
      "text": {
        "type": "string",
        "minLength": 1,
        "description": "Must not exceed 8192 UTF-8 bytes after normalization."
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 512
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "SearchMemoryHit": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "citation",
      "text",
      "score",
      "matched_by"
    ],
    "properties": {
      "citation": {
        "$ref": "#/components/schemas/MemoryCitation"
      },
      "text": {
        "type": "string"
      },
      "score": {
        "type": "number",
        "minimum": 0,
        "maximum": 1
      },
      "matched_by": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/MemoryMatchedBy"
        }
      }
    }
  },
  "SearchMemoryRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "query"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "query": {
        "type": "string",
        "minLength": 1,
        "maxLength": 8192
      },
      "limit": {
        "type": "integer",
        "minimum": 1,
        "maximum": 50,
        "default": 10
      },
      "mode": {
        "$ref": "#/components/schemas/MemorySearchMode",
        "default": "auto"
      }
    }
  },
  "ScanExternalSkillsRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      }
    }
  },
  "ResolveExternalSkillRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "external_skill_id",
      "fingerprint"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "external_skill_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "fingerprint": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      }
    }
  },
  "ExternalSkillImportMode": {
    "type": "string",
    "enum": [
      "import",
      "fork"
    ]
  },
  "ImportExternalSkillRequest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "scope_id",
      "external_skill_id",
      "fingerprint",
      "mode"
    ],
    "properties": {
      "scope_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 256,
        "pattern": ".*\\S.*"
      },
      "external_skill_id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 128,
        "pattern": "^[\\x21-\\x7E]+$"
      },
      "fingerprint": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$",
        "description": "Exact package fingerprint captured into Source lineage."
      },
      "mode": {
        "$ref": "#/components/schemas/ExternalSkillImportMode"
      },
      "reason": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 2000
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "SearchMemoryResponse": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "hits"
    ],
    "properties": {
      "memory": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/ArtifactReference"
          },
          {
            "type": "null"
          }
        ]
      },
      "mode": {
        "anyOf": [
          {
            "$ref": "#/components/schemas/MemoryUsedSearchMode"
          },
          {
            "type": "null"
          }
        ]
      },
      "hits": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SearchMemoryHit"
        }
      }
    }
  },
  "SourceReference": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "name",
      "source_id"
    ],
    "properties": {
      "name": {
        "type": "string",
        "description": "Stable Source type."
      },
      "source_id": {
        "type": "string"
      }
    }
  },
  "CaptureStatus": {
    "type": "string",
    "enum": [
      "accepted"
    ]
  },
  "StatsPeriod": {
    "type": "string",
    "enum": [
      "today",
      "7d",
      "30d"
    ]
  },
  "CandidateFamily": {
    "type": "string",
    "enum": [
      "experience",
      "skill"
    ]
  },
  "ExternalSkillInstallationScope": {
    "type": "string",
    "enum": [
      "user",
      "project",
      "plugin"
    ]
  },
  "ExternalSkillResolutionStatus": {
    "type": "string",
    "enum": [
      "available",
      "unavailable"
    ]
  },
  "CandidateStatus": {
    "type": "string",
    "enum": [
      "pending",
      "approved",
      "rejected"
    ]
  },
  "PreparedContextSchema": {
    "type": "string",
    "enum": [
      "powercontext.prepared-context.v1"
    ]
  },
  "PreparedContextStatus": {
    "type": "string",
    "enum": [
      "ready",
      "empty"
    ]
  },
  "EntryChangeOperation": {
    "type": "string",
    "enum": [
      "add",
      "revise",
      "deactivate",
      "reactivate"
    ]
  },
  "FlushStatus": {
    "type": "string",
    "enum": [
      "idle",
      "processed"
    ]
  },
  "MemoryEntryState": {
    "type": "string",
    "enum": [
      "active",
      "inactive"
    ]
  },
  "MemoryMatchedBy": {
    "type": "string",
    "enum": [
      "fts",
      "vector"
    ]
  },
  "MemorySearchMode": {
    "type": "string",
    "enum": [
      "auto",
      "fts",
      "vector",
      "hybrid"
    ]
  },
  "MemoryUsedSearchMode": {
    "type": "string",
    "enum": [
      "fts",
      "vector",
      "hybrid"
    ]
  },
  "HandoffClaim": {
    "type": "string",
    "enum": [
      "state",
      "next_action"
    ]
  },
  "HandoffActivationStatus": {
    "type": "string",
    "enum": [
      "generated",
      "ignored"
    ]
  },
  "HandoffDisposition": {
    "type": "string",
    "enum": [
      "continuable",
      "blocked",
      "complete"
    ]
  },
  "HandoffEvidenceStatus": {
    "type": "string",
    "enum": [
      "available",
      "unavailable"
    ]
  },
  "HandoffResolutionStatus": {
    "type": "string",
    "enum": [
      "empty",
      "resolved"
    ]
  },
  "HandoffSchema": {
    "type": "string",
    "enum": [
      "powercontext.handoff.v1"
    ]
  },
  "HandoffSelection": {
    "type": "string",
    "enum": [
      "prepared",
      "exact",
      "latest"
    ]
  },
  "PreparedHandoffSchema": {
    "type": "string",
    "enum": [
      "powercontext.prepared-handoff.v1"
    ]
  }
} as const

const runtime = createWireValidator(COMPONENT_SCHEMAS as Record<string, unknown>)

export function compileComponentValidator(name: string) {
  return runtime.compileComponentValidator(name)
}

export function validateWireValue(name: string, value: unknown) {
  return runtime.validateWireValue(name, value)
}

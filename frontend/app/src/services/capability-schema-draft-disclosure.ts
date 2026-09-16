import type {
  CapabilitySchemaDraft,
  DraftCapabilitySchemaRequestOutcome,
} from "../hooks/use-draft-capability-schema-from-openapi";
import {
  CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE,
  CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE,
  CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE,
  capabilitySchemaDraftNotGeneratedOperationNotFoundMessage,
  capabilitySchemaDraftUnresolvedReasonMessage,
} from "./capability-schema-messages";

export type CapabilitySchemaDraftUnresolvedItemDisclosure = {
  readonly name: string;
  readonly reason: string;
  readonly reasonLabel: string;
};

export type CapabilitySchemaDraftDisclosure = {
  readonly inputSchema: string;
  readonly outputSchema: string;
  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItemDisclosure[];
};

export function capabilitySchemaDraftDisclosureFrom(
  draft: CapabilitySchemaDraft,
): CapabilitySchemaDraftDisclosure {
  return {
    inputSchema: draft.input_schema,
    outputSchema: draft.output_schema,
    unresolved: draft.unresolved.map((item) => ({
      name: item.name,
      reason: item.reason,
      reasonLabel: capabilitySchemaDraftUnresolvedReasonMessage(item.reason),
    })),
  };
}

export type CapabilitySchemaDraftRefusalDisclosure = {
  readonly message: string;
};

export function capabilitySchemaDraftRefusalDisclosureFrom(
  outcome: DraftCapabilitySchemaRequestOutcome,
): CapabilitySchemaDraftRefusalDisclosure | undefined {
  switch (outcome.kind) {
    case "openapi-document-not-fetched":
      return { message: CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE };
    case "openapi-document-not-readable":
      return { message: CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE };
    case "openapi-operation-not-found":
      return {
        message: capabilitySchemaDraftNotGeneratedOperationNotFoundMessage(
          outcome.method,
          outcome.path,
        ),
      };
    case "unrecognized-failure":
      return { message: CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE };
    case "idle":
    case "pending":
    case "drafted":
      return undefined;
  }
}

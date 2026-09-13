import type {
  ConnectorConfigurationDraft,
  DraftConnectorConfigurationRequestOutcome,
} from "../hooks/use-draft-connector-configuration-from-openapi";
import {
  draftNotGeneratedFetchFailureMessage,
  DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE,
  draftNotGeneratedOperationNotFoundMessage,
  DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE,
  openApiFetchFailureText,
  readingNoteKindMessage,
  unresolvedReasonMessage,
} from "./connector-configuration-messages";

export type UnresolvedItemDisclosure = {
  readonly name: string;
  readonly reason: string;
  readonly reasonLabel: string;
};

export type GeneratedCredentialDisclosure = {
  readonly name: string;
  readonly securityScheme: string;
};

export type MethodMismatchDisclosure = {
  readonly registered: string;
  readonly operation: string;
};

export type StatusReadingDisclosure = {
  readonly status: string;
  readonly ending: string;
  readonly declaredAs: string | undefined;
};

export type ResponseFieldDisclosure = {
  readonly name: string;
  readonly path: string;
  readonly status: string;
  readonly declaredType: string | undefined;
  readonly declaredRequired: boolean | undefined;
  readonly envelope: string | undefined;
};

export type ReadingNoteDisclosure = {
  readonly kind: string;
  readonly kindLabel: string;
  readonly subject: string;
  readonly detail: string | undefined;
};

export type DraftDisclosure = {
  readonly configuration: string;
  readonly unresolved: readonly UnresolvedItemDisclosure[];
  readonly generatedCredentials: readonly GeneratedCredentialDisclosure[];
  readonly methodMismatch: MethodMismatchDisclosure | undefined;
  readonly statusReadings: readonly StatusReadingDisclosure[];
  readonly responseFields: readonly ResponseFieldDisclosure[];
  readonly readingNotes: readonly ReadingNoteDisclosure[];
};

export type ConnectorConfigurationHelperDisclosureState =
  | { readonly kind: "none" }
  | { readonly kind: "pending" }
  | { readonly kind: "drafted"; readonly draft: DraftDisclosure }
  | { readonly kind: "refused"; readonly message: string };

function unresolvedReasonLabel(reason: string): string {
  return unresolvedReasonMessage(reason);
}

function readingNoteKindLabel(kind: string): string {
  return readingNoteKindMessage(kind);
}

function draftDisclosureFrom(draft: ConnectorConfigurationDraft): DraftDisclosure {
  return {
    configuration: draft.configuration,
    unresolved: draft.unresolved.map((item) => ({
      name: item.name,
      reason: item.reason,
      reasonLabel: unresolvedReasonLabel(item.reason),
    })),
    generatedCredentials: draft.generated_credentials.map((credential) => ({
      name: credential.name,
      securityScheme: credential.security_scheme,
    })),
    methodMismatch: draft.method_mismatch,
    statusReadings: (draft.status_readings ?? []).map((reading) => ({
      status: reading.status,
      ending: reading.ending,
      declaredAs: reading.declared_as,
    })),
    responseFields: (draft.response_fields ?? []).map((field) => ({
      name: field.name,
      path: field.path,
      status: field.status,
      declaredType: field.declared_type,
      declaredRequired: field.declared_required,
      envelope: field.envelope,
    })),
    readingNotes: (draft.reading_notes ?? []).map((note) => ({
      kind: note.kind,
      kindLabel: readingNoteKindLabel(note.kind),
      subject: note.subject,
      detail: note.detail,
    })),
  };
}

export function disclosureStateForOutcome(
  outcome: DraftConnectorConfigurationRequestOutcome,
): ConnectorConfigurationHelperDisclosureState {
  switch (outcome.kind) {
    case "idle":
      return { kind: "none" };
    case "pending":
      return { kind: "pending" };
    case "drafted":
      return { kind: "drafted", draft: draftDisclosureFrom(outcome.draft) };
    case "openapi-document-not-fetched":
      return {
        kind: "refused",
        message: draftNotGeneratedFetchFailureMessage(openApiFetchFailureText(outcome.failure)),
      };
    case "openapi-document-not-readable":
      return {
        kind: "refused",
        message: DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE,
      };
    case "openapi-operation-not-found":
      return {
        kind: "refused",
        message: draftNotGeneratedOperationNotFoundMessage(outcome.method, outcome.path),
      };
    case "unrecognized-failure":
      return {
        kind: "refused",
        message: DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE,
      };
  }
}

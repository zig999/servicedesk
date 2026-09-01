import type { ApiError } from "./api-client";

export type UiErrorStateKind =
  | "case-not-found"
  | "concept-not-answered"
  | "concept-not-held"
  | "vocabulary-term-not-held"
  | "case-already-has-draft"
  | "manifest-position-occupied"
  | "case-version-not-draft"
  | "case-version-not-draft-at-release"
  | "concept-already-answered"
  | "case-version-not-releasable"
  | "manifest-would-hold-no-hypothesis"
  | "incomplete-capability-contract"
  | "capability-not-read-only"
  | "capability-schema-not-well-formed"
  | "case-not-valid"
  | "connector-configuration-not-well-formed"
  | "concept-description-required"
  | "generic-error";

export type UiErrorState = {
  readonly kind: UiErrorStateKind;
};

const GENERIC_ERROR_STATE: UiErrorState = { kind: "generic-error" };

const UI_STATE_BY_ERROR_CODE: Readonly<Record<string, UiErrorState>> = {

  CaseNotFoundError: { kind: "case-not-found" },
  ConceptNotAnsweredError: { kind: "concept-not-answered" },
  ConceptNotHeldError: { kind: "concept-not-held" },
  VocabularyTermNotHeldError: { kind: "vocabulary-term-not-held" },

  CaseAlreadyHasDraftError: { kind: "case-already-has-draft" },
  ManifestPositionOccupiedError: { kind: "manifest-position-occupied" },
  CaseVersionNotDraftError: { kind: "case-version-not-draft" },
  CaseVersionNotDraftAtReleaseError: { kind: "case-version-not-draft-at-release" },

  ConceptAlreadyAnsweredError: { kind: "concept-already-answered" },

  CaseVersionNotReleasableError: { kind: "case-version-not-releasable" },
  ManifestWouldHoldNoHypothesisError: { kind: "manifest-would-hold-no-hypothesis" },

  IncompleteCapabilityContractError: { kind: "incomplete-capability-contract" },
  CapabilityNotReadOnlyError: { kind: "capability-not-read-only" },
  CapabilitySchemaNotWellFormedError: { kind: "capability-schema-not-well-formed" },

  ConnectorConfigurationNotWellFormedError: { kind: "connector-configuration-not-well-formed" },

  ConceptDescriptionRequiredError: { kind: "concept-description-required" },

  CaseHoldsNoDraftError: GENERIC_ERROR_STATE,
  ConceptNotInGlossaryError: GENERIC_ERROR_STATE,
  ConceptRefusesSubjectTypeError: GENERIC_ERROR_STATE,

  CaseNotValidError: { kind: "case-not-valid" },
};

export function uiStateForApiError(error: ApiError): UiErrorState {
  const state = UI_STATE_BY_ERROR_CODE[error.code];
  return state ?? GENERIC_ERROR_STATE;
}

/**
 * The API-02 mapping table (task/frontend-console-foundation/error-to-ui-state-table):
 * "every distinct failure response the UI can receive maps to a user-facing state through
 * one named mapping" -- resolved here, once, so no call site chooses a UI state inline.
 *
 * Keyed by `ApiError.code` (./api-client.ts), which carries the backend's thrown domain
 * error's own class name verbatim (src/src/http/error-handler.middleware.ts's
 * domainEnvelope()). The twenty keys below are the original ten class names
 * src/src/errors/status-map.ts mapped to a transport status when this table was first
 * written, plus the four it does not map (CaseHoldsNoDraftError, ConceptNotInGlossaryError,
 * ConceptRefusesSubjectTypeError, CaseNotValidError), plus four more status-map.ts has
 * since begun mapping for the capability registry's own register-capability surface
 * (IncompleteCapabilityContractError, CapabilityNotReadOnlyError,
 * CapabilitySchemaNotWellFormedError, ConceptAlreadyAnsweredError,
 * task/capability-authoring/capability-create-edit-form's own criterion 5), plus one more
 * status-map.ts now also maps for the connector configuration registry's own
 * register-connector surface (ConnectorConfigurationNotWellFormedError,
 * task/connector-configuration-authoring/connector-configuration-create-edit-form's own
 * criterion set), plus one more status-map.ts now also maps for the glossary registry's
 * own register-concept surface (ConceptDescriptionRequiredError,
 * task/glossary-concept-description/concept-description-error-kind, its own distinct
 * state so the operator console can tell the operator specifically that the description
 * is missing rather than only a generic failure notice --
 * scenarios/glossary/a-concept-with-no-description-is-refused, whose exact wording stays
 * the console's own) -- each read from that file and confirmed against it directly, never
 * re-derived or renamed, so a reader can hold the two tables side by side. Three further
 * classes status-map.ts now also maps (ConnectorConfigurationNotFoundError,
 * CapabilityNotRegisteredForTestError, CapabilityConnectorMismatchError) are not yet named
 * here -- outside this task's own surface, deferred to whichever task next needs one of
 * them told apart from the generic fallback below.
 *
 * This table states no UI wording -- what each state displays is left to the screen
 * tasks that consume it (the task's own rationale: "states no UI wording... only that a
 * distinct state exists per error class"). What it states is only that a distinct `kind`
 * exists for each of the mapped classes named below, mirroring statusForError()'s own
 * one-table, keyed-by-identity shape; three of the four originally-unmapped classes, and
 * any code this table does not name at all, collapse onto one shared "generic-error"
 * kind, since the backend
 * already returns them as the one indistinguishable INTERNAL_ERROR and there is no signal
 * in the response that would let two of them be told apart here. The fourth,
 * CaseNotValidError, resolves to its own distinct "case-not-valid" kind instead
 * (task/cases-list-and-detail/case-attributes-at-a-glance, criterion 5): that task's own
 * view needs read-case's own coherence refusal told apart from an unrelated 5xx, which
 * this shared fallback could not do while both collapsed onto the same kind.
 */

import type { ApiError } from "./api-client";

/**
 * The closed set of UI states an ApiError can resolve to. A discriminated union
 * (TYP-04) rather than a bag of optional fields, because a caller matching on `kind`
 * gets a compiler-checked switch instead of a shape it has to infer.
 */
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

/**
 * The UI state itself. A single-field object rather than the bare string union, so a
 * later task can grow a state with data (e.g. which field a 422 named) without widening
 * this module's own return type into something a caller has to re-narrow.
 */
export type UiErrorState = {
  readonly kind: UiErrorStateKind;
};

const GENERIC_ERROR_STATE: UiErrorState = { kind: "generic-error" };

/**
 * The table itself: every one of the twenty named error classes, keyed by its own
 * class name exactly as src/src/errors/status-map.ts (the sixteen mapped classes named
 * here) and the inventory's confirmed list (the four originally-unmapped classes) spell
 * it. Iteration order carries no meaning here -- unlike statusForError()'s Map, this is a
 * plain lookup by exact key, never by instanceof/subclass matching, so no entry can
 * shadow another. CaseNotValidError is listed among the mapped, distinctly-stated classes
 * below rather than the three still-unmapped ones -- see this module's own header comment.
 */
const UI_STATE_BY_ERROR_CODE: Readonly<Record<string, UiErrorState>> = {
  // 404-appropriate: a resource that plainly does not exist -- each its own state.
  CaseNotFoundError: { kind: "case-not-found" },
  ConceptNotAnsweredError: { kind: "concept-not-answered" },
  ConceptNotHeldError: { kind: "concept-not-held" },
  VocabularyTermNotHeldError: { kind: "vocabulary-term-not-held" },

  // 409-appropriate: an operation the named resource's own current state forbids --
  // each its own state.
  CaseAlreadyHasDraftError: { kind: "case-already-has-draft" },
  ManifestPositionOccupiedError: { kind: "manifest-position-occupied" },
  CaseVersionNotDraftError: { kind: "case-version-not-draft" },
  CaseVersionNotDraftAtReleaseError: { kind: "case-version-not-draft-at-release" },
  // A concept a different capability already answers
  // (rules/integration/one-capability-answers-one-concept) --
  // task/capability-authoring/capability-create-edit-form's own criterion 5.
  ConceptAlreadyAnsweredError: { kind: "concept-already-answered" },

  // 422-appropriate: well-formed but would violate a business invariant if applied --
  // each its own state.
  CaseVersionNotReleasableError: { kind: "case-version-not-releasable" },
  ManifestWouldHoldNoHypothesisError: { kind: "manifest-would-hold-no-hypothesis" },
  // A capability registration that does not declare its contract completely
  // (rules/integration/a-capability-declares-its-contract), whose nature is not
  // read-only (rules/integration/a-capability-is-read-only), or whose schema is not
  // syntactically valid JSON (rules/integration/a-capability-declares-well-formed-schemas)
  // -- task/capability-authoring/capability-create-edit-form's own criterion 5, each its
  // own state so the operator can tell the three refusals apart.
  IncompleteCapabilityContractError: { kind: "incomplete-capability-contract" },
  CapabilityNotReadOnlyError: { kind: "capability-not-read-only" },
  CapabilitySchemaNotWellFormedError: { kind: "capability-schema-not-well-formed" },
  // A connector configuration whose configuration is not syntactically valid JSON
  // (rules/integration/a-connector-configuration-holds-a-well-formed-object) --
  // task/connector-configuration-authoring/connector-configuration-create-edit-form's own
  // criterion set, its own distinct state so the operator can tell it apart from an
  // unrelated failure.
  ConnectorConfigurationNotWellFormedError: { kind: "connector-configuration-not-well-formed" },
  // A concept registration or update naming no description
  // (rules/glossary/a-concept-declares-its-description) --
  // task/glossary-concept-description/concept-description-error-kind, its own distinct
  // state so the operator console can tell the operator specifically that the
  // description is missing rather than only a generic failure notice
  // (scenarios/glossary/a-concept-with-no-description-is-refused); the exact wording
  // stays the console's own, not this table's.
  ConceptDescriptionRequiredError: { kind: "concept-description-required" },

  // Unmapped in status-map.ts -- the backend answers all three with the same
  // indistinguishable INTERNAL_ERROR, so they share the one fallback state rather than
  // each claiming a distinctness the response never carries.
  CaseHoldsNoDraftError: GENERIC_ERROR_STATE,
  ConceptNotInGlossaryError: GENERIC_ERROR_STATE,
  ConceptRefusesSubjectTypeError: GENERIC_ERROR_STATE,
  // Also unmapped in status-map.ts (the backend answers it as the same
  // indistinguishable INTERNAL_ERROR too), but given its own distinct kind rather than
  // folded into the fallback above: task/cases-list-and-detail/case-attributes-at-a-glance's
  // own criterion 5 needs read-case's own coherence refusal (e.g. a draft whose manifest
  // currently holds no hypothesis) told apart from an unrelated 5xx, which
  // GENERIC_ERROR_STATE cannot do once two distinct classes share it (this module's own
  // header comment).
  CaseNotValidError: { kind: "case-not-valid" },
};

/**
 * Resolves an ApiError to the UI state its `code` names in the table above, or the
 * shared fallback state for a code the table does not name -- never throws, so a
 * caller can always render something for whatever the backend sent, including a code
 * this table was written before the backend ever raised.
 */
export function uiStateForApiError(error: ApiError): UiErrorState {
  const state = UI_STATE_BY_ERROR_CODE[error.code];
  return state ?? GENERIC_ERROR_STATE;
}

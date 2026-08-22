/**
 * The API-02 mapping table (task/frontend-console-foundation/error-to-ui-state-table):
 * "every distinct failure response the UI can receive maps to a user-facing state through
 * one named mapping" -- resolved here, once, so no call site chooses a UI state inline.
 *
 * Keyed by `ApiError.code` (./api-client.ts), which carries the backend's thrown domain
 * error's own class name verbatim (src/src/http/error-handler.middleware.ts's
 * domainEnvelope()). The fourteen keys below are exactly the ten class names
 * src/src/errors/status-map.ts maps to a transport status, plus the four it does not
 * (CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError,
 * CaseNotValidError) -- read from that file and confirmed against it directly, never
 * re-derived or renamed, so a reader can hold the two tables side by side.
 *
 * This table states no UI wording -- what each state displays is left to the screen
 * tasks that consume it (the task's own rationale: "states no UI wording... only that a
 * distinct state exists per error class"). What it states is only that a distinct `kind`
 * exists for each of the ten mapped classes, mirroring statusForError()'s own one-table,
 * keyed-by-identity shape; the four unmapped classes and any code this table does not
 * name at all collapse onto one shared "generic-error" kind, since the backend already
 * returns all four as the one indistinguishable INTERNAL_ERROR and there is no signal in
 * the response that would let two of them be told apart here.
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
  | "case-version-not-releasable"
  | "manifest-would-hold-no-hypothesis"
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
 * The table itself: every one of the fourteen named error classes, keyed by its own
 * class name exactly as src/src/errors/status-map.ts (the ten mapped classes) and the
 * inventory's confirmed list (the four unmapped classes) spell it. Iteration order
 * carries no meaning here -- unlike statusForError()'s Map, this is a plain lookup by
 * exact key, never by instanceof/subclass matching, so no entry can shadow another.
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

  // 422-appropriate: well-formed but would violate a business invariant if applied --
  // each its own state.
  CaseVersionNotReleasableError: { kind: "case-version-not-releasable" },
  ManifestWouldHoldNoHypothesisError: { kind: "manifest-would-hold-no-hypothesis" },

  // Unmapped in status-map.ts -- the backend answers all four with the same
  // indistinguishable INTERNAL_ERROR, so they share the one fallback state rather than
  // each claiming a distinctness the response never carries.
  CaseHoldsNoDraftError: GENERIC_ERROR_STATE,
  ConceptNotInGlossaryError: GENERIC_ERROR_STATE,
  ConceptRefusesSubjectTypeError: GENERIC_ERROR_STATE,
  CaseNotValidError: GENERIC_ERROR_STATE,
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

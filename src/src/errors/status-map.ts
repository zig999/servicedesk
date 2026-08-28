// The one table COR-04 requires ("every domain error maps to a transport
// status in one place, and no handler chooses a status inline") — this
// project's own standard states that COR-04 requires the table to exist
// without stating what it contains (backend-node-service.yaml's own
// `elsewhere` note). That silence no longer covers every entry below: eleven
// specification nodes now fix a status as a decided fact —
// CapabilityIdentityNotFoundError's HTTP 404
// (constraints/the-capability-identity-read-refuses-an-unregistered-identity),
// ConnectorConfigurationNotFoundError's HTTP 404
// (rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused),
// ConnectorConfigurationNotWellFormedError's HTTP 422
// (rules/integration/a-connector-configuration-holds-a-well-formed-object,
// whose own statement refuses a not-well-formed configuration "with an HTTP
// 422 response reporting a ConnectorConfigurationNotWellFormedError"),
// HypothesisNotInManifestError's HTTP 404
// (rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused,
// whose own statement refuses a simulate-hypothesis request naming an absent
// hypothesis "with an HTTP 404 response reporting a
// HypothesisNotInManifestError"), MalformedCapabilityInputSchemaError's
// HTTP 422
// (rules/integration/a-capability-input-schema-holds-a-well-formed-object,
// whose own statement refuses a registration whose input schema departs
// from the declared shape "with an HTTP 422 response reporting a
// MalformedCapabilityInputSchemaError naming every departure"), and
// SubjectDoesNotCoverCaseInputsError's HTTP 422
// (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes,
// whose own statement refuses a diagnose whose subject leaves a required
// case input missing or empty "with an HTTP 422 response reporting a
// SubjectDoesNotCoverCaseInputsError naming every missing attribute
// together and, for each, the capabilities that require it"),
// ConnectorPlaceholderOutsideInputSchemaError's HTTP 422
// (rules/integration/a-connector-placeholder-is-declared-by-its-capability,
// whose own statement refuses a connector-configuration registration or
// edit whose call text embeds a placeholder naming a Subject attribute
// absent from the properties a currently registered capability's own input
// schema declares "with an HTTP 422 response reporting a
// ConnectorPlaceholderOutsideInputSchemaError naming every orphaned
// placeholder together with the capability that fails to declare it"),
// CaseHoldsNoDraftError's HTTP 409
// (rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft,
// whose own statement refuses a revision requested while the case holds no
// draft version "with an HTTP 409 response reporting a
// CaseHoldsNoDraftError"), ConceptNotInGlossaryError's HTTP 404
// (rules/knowledge/case-terms-exist-in-the-glossary, whose own statement
// refuses a hypothesis-revision naming a concept the glossary does not hold
// "with HTTP 404 reporting ConceptNotInGlossaryError"),
// HypothesisRevisionCollectsNoConceptError's HTTP 422
// (rules/knowledge/a-hypothesis-collects-at-least-one-concept, whose own
// statement refuses a revision that would collect none "with an HTTP 422
// response reporting a HypothesisRevisionCollectsNoConceptError"), and
// ConceptRefusesSubjectTypeError's HTTP 422
// (rules/knowledge/a-concept-accepts-the-declared-subject-type, whose own
// statement refuses a hypothesis-revision request "with an HTTP 422
// response reporting a ConceptRefusesSubjectTypeError" when a concept it
// collects does not accept the case version's declared subject type)
// — while every other entry's status stays this project's own engineering
// decision, not a fact the specification holds or should hold, so it is
// written here rather than left for a handler to pick inline.
//
// Grouped by what the refusal means for the caller: a resource that plainly
// does not exist answers 404 (CaseNotFoundError, ConceptNotAnsweredError,
// ConceptNotHeldError, VocabularyTermNotHeldError,
// ConnectorConfigurationNotFoundError — the fifth, once
// read-connector-configuration is exposed as a route,
// task/connector-configuration-authoring/read-connector-configuration-route;
// CapabilityNotRegisteredForTestError — the sixth, once test-connector is
// exposed as a route, task/connector-diagnostics/test-connector-route,
// criterion 3; CapabilityIdentityNotFoundError — the seventh, once
// read-capability-by-identity is exposed as its own route,
// task/registry-reads/read-capability-by-identity-route, a fourth typed
// class for the same structural absence rather than a reuse of
// ConceptNotAnsweredError, ConnectorConfigurationNotFoundError or
// CapabilityNotRegisteredForTestError; HypothesisNotInManifestError — the
// eighth, once simulate-hypothesis is exposed as a route,
// task/case-simulation-pipeline/simulate-hypothesis-operation, a fifth typed
// class for the same structural absence — a manifest entry rather than a
// case, a capability or a connector configuration; ConceptNotInGlossaryError
// — the ninth, raised by the same POST /v1/cases/:slug/hypotheses route
// already handling every other revise-hypothesis refusal, left unmapped
// until this hotfix closed the gap
// (rules/knowledge/case-terms-exist-in-the-glossary)); an operation the named resource's own current state forbids
// — a second open draft, an already occupied manifest position, a mutation
// against anything but a draft version, a concept a different capability
// already answers (ConceptAlreadyAnsweredError,
// rules/integration/one-capability-answers-one-concept), or a
// test-connector request naming a connector the capability's own connector
// does not match (CapabilityConnectorMismatchError,
// task/connector-diagnostics/test-connector-route, criterion 4), or a
// diagnose request pinned to a draft-state case version
// (CaseVersionNotReleasedError,
// rules/investigation/only-a-released-case-version-is-diagnosed) — this
// project's own engineering choice, the same way every other entry in this
// group already is, since this refusal's status is not something any
// specification node fixes, or a hypothesis-revision requested while the
// case holds no draft version (CaseHoldsNoDraftError,
// rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft) — a
// status that rule fixes rather than this project's own choice
// — answers 409 Conflict; a request that is well-formed but would violate a
// business invariant were it applied — a release whose validator rules did
// not all pass, a removal that would leave a manifest holding no hypothesis,
// a capability registration that does not declare its contract completely
// (IncompleteCapabilityContractError), whose nature is not read-only
// (CapabilityNotReadOnlyError), whose schema is not syntactically valid
// JSON (CapabilitySchemaNotWellFormedError), or whose input schema parses
// but does not hold a well-formed shape (MalformedCapabilityInputSchemaError,
// rules/integration/a-capability-input-schema-holds-a-well-formed-object),
// or a connector-configuration registration whose configuration text is not
// syntactically valid JSON object text (ConnectorConfigurationNotWellFormedError,
// rules/integration/a-connector-configuration-holds-a-well-formed-object,
// task/connector-configuration-authoring/register-connector-route), or one
// whose connector name is absent or an empty string
// (IncompleteConnectorConfigurationError,
// rules/integration/a-connector-configuration-names-its-connector), or a
// diagnose request whose subject leaves a required case input missing or
// empty (SubjectDoesNotCoverCaseInputsError,
// rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes,
// task/case-input-requirements-and-diagnose-gate/refuse-diagnose-missing-required-attribute),
// or a connector-configuration registration or edit whose own call text
// embeds a placeholder naming a Subject attribute no capability currently
// registered against that connector's name declares in its input schema
// properties (ConnectorPlaceholderOutsideInputSchemaError,
// rules/integration/a-connector-placeholder-is-declared-by-its-capability,
// task/connector-configuration-and-placeholder-contract/refuse-connector-registration-with-orphaned-placeholder),
// or a hypothesis-revision that would collect no concept
// (HypothesisRevisionCollectsNoConceptError,
// rules/knowledge/a-hypothesis-collects-at-least-one-concept), or a
// hypothesis-revision collecting a concept that does not accept the case
// version's declared subject type (ConceptRefusesSubjectTypeError,
// rules/knowledge/a-concept-accepts-the-declared-subject-type)
// — answers 422 Unprocessable Entity: each of the first four reached this
// table only once register-capability was exposed as a route
// (task/capability-authoring/register-capability-route), since nothing
// before that task ever called registerCapability from HTTP; the fifth and
// sixth reach it the same way, now that register-connector is exposed as a
// route; the seventh reaches it the same way, now that this gate stands
// inside handleDiagnoseRequest; the eighth reaches it the same way, now that
// registerConnector itself runs this reconciliation before any write; the
// ninth and tenth reach it not because a new route was exposed but because
// this hotfix closes a gap left when revise-hypothesis was first delivered
// — POST /v1/cases/:slug/hypotheses already raised both, unmapped, before
// this task.
// An error class this table does not name is left unmapped, and
// error-handler.middleware.ts keeps answering it with 500, exactly as it
// does today (COR-04's own note that none of this codebase's errors is
// mapped to a status yet).

import { CapabilityConnectorMismatchError } from './capability-connector-mismatch.error.js';
import { CapabilityIdentityNotFoundError } from './capability-identity-not-found.error.js';
import { CapabilityNotReadOnlyError } from './capability-not-read-only.error.js';
import { CapabilityNotRegisteredForTestError } from './capability-not-registered-for-test.error.js';
import { CapabilitySchemaNotWellFormedError } from './capability-schema-not-well-formed.error.js';
import { CaseAlreadyHasDraftError } from './case-already-has-draft.error.js';
import { CaseHoldsNoDraftError } from './case-holds-no-draft.error.js';
import { CaseNotFoundError } from './case-not-found.error.js';
import { CaseVersionNotDraftAtReleaseError } from './case-version-not-draft-at-release.error.js';
import { CaseVersionNotDraftError } from './case-version-not-draft.error.js';
import { CaseVersionNotReleasableError } from './case-version-not-releasable.error.js';
import { CaseVersionNotReleasedError } from './case-version-not-released.error.js';
import { ConceptAlreadyAnsweredError } from './concept-already-answered.error.js';
import { ConceptNotAnsweredError } from './concept-not-answered.error.js';
import { ConceptNotHeldError } from './concept-not-held.error.js';
import { ConceptNotInGlossaryError } from './concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from './concept-refuses-subject-type.error.js';
import { ConnectorConfigurationNotFoundError } from './connector-configuration-not-found.error.js';
import { ConnectorConfigurationNotWellFormedError } from './connector-configuration-not-well-formed.error.js';
import { ConnectorPlaceholderOutsideInputSchemaError } from './connector-placeholder-outside-input-schema.error.js';
import { HypothesisNotInManifestError } from './hypothesis-not-in-manifest.error.js';
import { HypothesisRevisionCollectsNoConceptError } from './hypothesis-revision-collects-no-concept.error.js';
import { IncompleteCapabilityContractError } from './incomplete-capability-contract.error.js';
import { IncompleteConnectorConfigurationError } from './incomplete-connector-configuration.error.js';
import { MalformedCapabilityInputSchemaError } from './malformed-capability-input-schema.error.js';
import { ManifestPositionOccupiedError } from './manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from './manifest-would-hold-no-hypothesis.error.js';
import { SubjectDoesNotCoverCaseInputsError } from './subject-does-not-cover-case-inputs.error.js';
import { VocabularyTermNotHeldError } from './vocabulary-term-not-held.error.js';

/** A constructor of a typed domain error — usable both as a Map key and with `instanceof`, so the table below keys by class rather than by a string a caller could misspell. */
type DomainErrorClass = new (...args: never[]) => Error;

/**
 * The status map itself: every typed domain error this HTTP surface's
 * routes raise, keyed to the transport status it resolves to. Iteration
 * order is insertion order, so a subclass placed after its own base class
 * here would be found by the base class's entry first — none of these
 * twenty-nine extends another, so that never arises today.
 */
const STATUS_BY_ERROR_CLASS: ReadonlyMap<DomainErrorClass, number> = new Map<DomainErrorClass, number>([
  [CaseNotFoundError, 404],
  [ConceptNotAnsweredError, 404],
  [ConceptNotHeldError, 404],
  [VocabularyTermNotHeldError, 404],
  [ConnectorConfigurationNotFoundError, 404],
  [CapabilityNotRegisteredForTestError, 404],
  [CapabilityIdentityNotFoundError, 404],
  [HypothesisNotInManifestError, 404],
  [ConceptNotInGlossaryError, 404],
  [CaseAlreadyHasDraftError, 409],
  [ManifestPositionOccupiedError, 409],
  [CaseVersionNotDraftError, 409],
  [CaseVersionNotDraftAtReleaseError, 409],
  [ConceptAlreadyAnsweredError, 409],
  [CapabilityConnectorMismatchError, 409],
  [CaseVersionNotReleasedError, 409],
  [CaseHoldsNoDraftError, 409],
  [CaseVersionNotReleasableError, 422],
  [ManifestWouldHoldNoHypothesisError, 422],
  [IncompleteCapabilityContractError, 422],
  [CapabilityNotReadOnlyError, 422],
  [CapabilitySchemaNotWellFormedError, 422],
  [MalformedCapabilityInputSchemaError, 422],
  [ConnectorConfigurationNotWellFormedError, 422],
  [IncompleteConnectorConfigurationError, 422],
  [SubjectDoesNotCoverCaseInputsError, 422],
  [ConnectorPlaceholderOutsideInputSchemaError, 422],
  [HypothesisRevisionCollectsNoConceptError, 422],
  [ConceptRefusesSubjectTypeError, 422],
]);

/**
 * Resolves a thrown value to the transport status this table assigns its
 * class, or undefined where the table names none — the caller's own signal
 * to fall back to its existing generic answer, unchanged.
 */
export function statusForError(error: unknown): number | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }
  for (const [errorClass, status] of STATUS_BY_ERROR_CLASS) {
    if (error instanceof errorClass) {
      return status;
    }
  }
  return undefined;
}

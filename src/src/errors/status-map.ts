// The one table COR-04 requires ("every domain error maps to a transport
// status in one place, and no handler chooses a status inline") — this
// project's own standard states that COR-04 requires the table to exist
// without stating what it contains (backend-node-service.yaml's own
// `elsewhere` note): which status each domain error resolves to is this
// project's own engineering decision, not a fact the specification holds or
// should hold, so it is written here rather than left for a handler to pick
// inline.
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
// CapabilityNotRegisteredForTestError); an operation the named resource's own current state forbids
// — a second open draft, an already occupied manifest position, a mutation
// against anything but a draft version, a concept a different capability
// already answers (ConceptAlreadyAnsweredError,
// rules/integration/one-capability-answers-one-concept), or a
// test-connector request naming a connector the capability's own connector
// does not match (CapabilityConnectorMismatchError,
// task/connector-diagnostics/test-connector-route, criterion 4)
// — answers 409 Conflict; a request that is well-formed but would violate a
// business invariant were it applied — a release whose validator rules did
// not all pass, a removal that would leave a manifest holding no hypothesis,
// a capability registration that does not declare its contract completely
// (IncompleteCapabilityContractError), whose nature is not read-only
// (CapabilityNotReadOnlyError), or whose schema is not syntactically valid
// JSON (CapabilitySchemaNotWellFormedError), or a connector-configuration
// registration whose configuration text is not syntactically valid JSON
// object text (ConnectorConfigurationNotWellFormedError,
// rules/integration/a-connector-configuration-holds-a-well-formed-object,
// task/connector-configuration-authoring/register-connector-route) — answers
// 422 Unprocessable Entity: each of the first three reached this table only
// once register-capability was exposed as a route
// (task/capability-authoring/register-capability-route), since nothing
// before that task ever called registerCapability from HTTP; the fourth
// reaches it the same way, now that register-connector is exposed as a
// route.
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
import { CaseNotFoundError } from './case-not-found.error.js';
import { CaseVersionNotDraftAtReleaseError } from './case-version-not-draft-at-release.error.js';
import { CaseVersionNotDraftError } from './case-version-not-draft.error.js';
import { CaseVersionNotReleasableError } from './case-version-not-releasable.error.js';
import { ConceptAlreadyAnsweredError } from './concept-already-answered.error.js';
import { ConceptNotAnsweredError } from './concept-not-answered.error.js';
import { ConceptNotHeldError } from './concept-not-held.error.js';
import { ConnectorConfigurationNotFoundError } from './connector-configuration-not-found.error.js';
import { ConnectorConfigurationNotWellFormedError } from './connector-configuration-not-well-formed.error.js';
import { IncompleteCapabilityContractError } from './incomplete-capability-contract.error.js';
import { ManifestPositionOccupiedError } from './manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from './manifest-would-hold-no-hypothesis.error.js';
import { VocabularyTermNotHeldError } from './vocabulary-term-not-held.error.js';

/** A constructor of a typed domain error — usable both as a Map key and with `instanceof`, so the table below keys by class rather than by a string a caller could misspell. */
type DomainErrorClass = new (...args: never[]) => Error;

/**
 * The status map itself: every typed domain error this HTTP surface's
 * routes raise, keyed to the transport status it resolves to. Iteration
 * order is insertion order, so a subclass placed after its own base class
 * here would be found by the base class's entry first — none of these
 * nineteen extends another, so that never arises today.
 */
const STATUS_BY_ERROR_CLASS: ReadonlyMap<DomainErrorClass, number> = new Map<DomainErrorClass, number>([
  [CaseNotFoundError, 404],
  [ConceptNotAnsweredError, 404],
  [ConceptNotHeldError, 404],
  [VocabularyTermNotHeldError, 404],
  [ConnectorConfigurationNotFoundError, 404],
  [CapabilityNotRegisteredForTestError, 404],
  [CapabilityIdentityNotFoundError, 404],
  [CaseAlreadyHasDraftError, 409],
  [ManifestPositionOccupiedError, 409],
  [CaseVersionNotDraftError, 409],
  [CaseVersionNotDraftAtReleaseError, 409],
  [ConceptAlreadyAnsweredError, 409],
  [CapabilityConnectorMismatchError, 409],
  [CaseVersionNotReleasableError, 422],
  [ManifestWouldHoldNoHypothesisError, 422],
  [IncompleteCapabilityContractError, 422],
  [CapabilityNotReadOnlyError, 422],
  [CapabilitySchemaNotWellFormedError, 422],
  [ConnectorConfigurationNotWellFormedError, 422],
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

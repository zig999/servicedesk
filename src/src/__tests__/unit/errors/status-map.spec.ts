// Proof for task/case-lifecycle-http/status-map: statusForError() resolves
// each of the seven typed domain error classes this HTTP surface raises to
// the transport status the table assigns it (COR-04), and returns undefined
// for anything the table does not name — the caller's own signal to keep
// answering 500 unchanged. error-handler.middleware.ts's own consultation of
// this function is proved separately, in
// __tests__/unit/http/error-handler.middleware.spec.ts.
import { expect, it } from 'vitest';
import { CapabilityIdentityNotFoundError } from '../../../errors/capability-identity-not-found.error.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftAtReleaseError } from '../../../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';
import { ConceptNotAnsweredError } from '../../../errors/concept-not-answered.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import { IncompleteConnectorConfigurationError } from '../../../errors/incomplete-connector-configuration.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from '../../../errors/manifest-would-hold-no-hypothesis.error.js';
import { statusForError } from '../../../errors/status-map.js';

// ------------------------------------------------------------------ criterion 2

it('resolves CaseNotFoundError to 404', () => {
  const error = new CaseNotFoundError('a-slug', 1);

  const status = statusForError(error);

  expect(status).toBe(404);
});

// Added for task/capability-registry-http/read-capability-route, whose own criterion 2 depends
// on this exact entry: "a request naming a concept no capability currently answers is refused
// with the status status-map assigns".
it('resolves ConceptNotAnsweredError to 404', () => {
  const error = new ConceptNotAnsweredError('a-concept');

  const status = statusForError(error);

  expect(status).toBe(404);
});

// Added for task/registry-reads/read-capability-by-identity-route, whose own criterion 2 depends
// on this exact entry: "a request naming a (name, version) pair that is not currently registered
// is refused ... mapped through status-map.ts".
it('resolves CapabilityIdentityNotFoundError to 404', () => {
  const error = new CapabilityIdentityNotFoundError('a-name', '1.0.0');

  const status = statusForError(error);

  expect(status).toBe(404);
});

it('resolves CaseAlreadyHasDraftError to 409', () => {
  const error = new CaseAlreadyHasDraftError('a-slug');

  const status = statusForError(error);

  expect(status).toBe(409);
});

it('resolves ManifestPositionOccupiedError to 409', () => {
  const error = new ManifestPositionOccupiedError('a-slug', 1, 1);

  const status = statusForError(error);

  expect(status).toBe(409);
});

it('resolves CaseVersionNotDraftError to 409', () => {
  const error = new CaseVersionNotDraftError('a-slug', 1, 'released');

  const status = statusForError(error);

  expect(status).toBe(409);
});

it('resolves CaseVersionNotDraftAtReleaseError to 409', () => {
  const error = new CaseVersionNotDraftAtReleaseError('a-slug', 1, 'released');

  const status = statusForError(error);

  expect(status).toBe(409);
});

it('resolves CaseVersionNotReleasableError to 422', () => {
  const error = new CaseVersionNotReleasableError('a-slug', 1, ['a violation']);

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('resolves ManifestWouldHoldNoHypothesisError to 422', () => {
  const error = new ManifestWouldHoldNoHypothesisError('a-slug', 1);

  const status = statusForError(error);

  expect(status).toBe(422);
});

// Added for task/connector-configuration-registration-conformance/incomplete-name-refusal-status,
// whose own criteria 1-3 depend on this exact entry: registerConnector's own isUndeclared check
// (connector-configuration-registry.service.ts) throws this one class identically for an absent
// connector attribute and for one declared as the empty string — connector-configuration-registry.service.spec.ts's
// own "refuses a registration that declares no connector identity" and "treats a connector identity
// declared as the empty string as undeclared" already prove that throw side — so this single entry
// answers both: whichever of the two conditions raised the error, it must resolve to 422 rather than
// falling through to the table's unmapped default (criterion 3).
it('resolves IncompleteConnectorConfigurationError to 422', () => {
  const error = new IncompleteConnectorConfigurationError(['connector is undeclared']);

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('maps CaseAlreadyHasDraftError and ManifestPositionOccupiedError to the same non-500 status, pinning "distinct" as specific rather than mutually exclusive across all seven', () => {
  const draftError = new CaseAlreadyHasDraftError('a-slug');
  const positionError = new ManifestPositionOccupiedError('a-slug', 1, 1);

  const draftStatus = statusForError(draftError);
  const positionStatus = statusForError(positionError);

  expect(draftStatus).toBe(positionStatus);
});

// ------------------------------------------------------------------ criterion 3

it('returns undefined for a typed domain error the table does not name', () => {
  const error = new IncoherentCaseError('a-slug', ['a violation']);

  const status = statusForError(error);

  expect(status).toBeUndefined();
});

it('returns undefined for a thrown value that is not an Error at all', () => {
  const status = statusForError('a plain string');

  expect(status).toBeUndefined();
});

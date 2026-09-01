import { expect, it } from 'vitest';
import { CapabilityIdentityNotFoundError } from '../../../errors/capability-identity-not-found.error.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
import { CaseHoldsNoDraftError } from '../../../errors/case-holds-no-draft.error.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotDraftAtReleaseError } from '../../../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';
import { CaseVersionNotReleasedError } from '../../../errors/case-version-not-released.error.js';
import { ConceptDescriptionRequiredError } from '../../../errors/concept-description-required.error.js';
import { ConceptNotAnsweredError } from '../../../errors/concept-not-answered.error.js';
import { ConceptNotInGlossaryError } from '../../../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../../../errors/concept-refuses-subject-type.error.js';
import { ConnectorPlaceholderOutsideInputSchemaError } from '../../../errors/connector-placeholder-outside-input-schema.error.js';
import { HypothesisNotInManifestError } from '../../../errors/hypothesis-not-in-manifest.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../../../errors/hypothesis-revision-collects-no-concept.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import { IncompleteConnectorConfigurationError } from '../../../errors/incomplete-connector-configuration.error.js';
import { InvestigationWriteDeadlineExceededError } from '../../../errors/investigation-write-deadline-exceeded.error.js';
import { MalformedCapabilityInputSchemaError } from '../../../errors/malformed-capability-input-schema.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from '../../../errors/manifest-would-hold-no-hypothesis.error.js';
import { statusForError } from '../../../errors/status-map.js';
import { SubjectDoesNotCoverCaseInputsError } from '../../../errors/subject-does-not-cover-case-inputs.error.js';

it('resolves CaseNotFoundError to 404', () => {
  const error = new CaseNotFoundError('a-slug', 1);

  const status = statusForError(error);

  expect(status).toBe(404);
});

it('resolves ConceptNotAnsweredError to 404', () => {
  const error = new ConceptNotAnsweredError('a-concept');

  const status = statusForError(error);

  expect(status).toBe(404);
});

it('resolves CapabilityIdentityNotFoundError to 404', () => {
  const error = new CapabilityIdentityNotFoundError('a-name', '1.0.0');

  const status = statusForError(error);

  expect(status).toBe(404);
});

it('resolves HypothesisNotInManifestError to 404', () => {
  const error = new HypothesisNotInManifestError('a-slug', 1, 'an-absent-hypothesis');

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

it('resolves CaseVersionNotReleasedError to 409', () => {
  const error = new CaseVersionNotReleasedError('a-slug', 1, 'draft');

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

it('resolves IncompleteConnectorConfigurationError to 422', () => {
  const error = new IncompleteConnectorConfigurationError(['connector is undeclared']);

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('resolves MalformedCapabilityInputSchemaError to 422', () => {
  const error = new MalformedCapabilityInputSchemaError(['a problem']);

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('resolves SubjectDoesNotCoverCaseInputsError to 422', () => {
  const error = new SubjectDoesNotCoverCaseInputsError([
    { attribute: 'contract-number', capabilities: [{ name: 'equipment-status-lookup', version: '1.0.0' }] },
  ]);

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('resolves ConnectorPlaceholderOutsideInputSchemaError to 422', () => {
  const error = new ConnectorPlaceholderOutsideInputSchemaError([
    { placeholder: 'customer_document', capabilities: [{ connector: 'erp-http', input_schema: '{"properties":{}}' }] },
  ]);

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

it('resolves CaseHoldsNoDraftError to 409', () => {
  const error = new CaseHoldsNoDraftError('a-slug');

  const status = statusForError(error);

  expect(status).toBe(409);
});

it('resolves ConceptNotInGlossaryError to 404', () => {
  const error = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['an-unknown-concept']);

  const status = statusForError(error);

  expect(status).toBe(404);
});

it('resolves HypothesisRevisionCollectsNoConceptError to 422', () => {
  const error = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('resolves ConceptRefusesSubjectTypeError to 422', () => {
  const error = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'a-subject-type',
    concepts: ['a-concept'],
  });

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('resolves ConceptDescriptionRequiredError to 422', () => {
  const error = new ConceptDescriptionRequiredError('a-concept', undefined);

  const status = statusForError(error);

  expect(status).toBe(422);
});

it('resolves InvestigationWriteDeadlineExceededError to 500', () => {
  const error = new InvestigationWriteDeadlineExceededError('an-investigation-id', 300);

  const status = statusForError(error);

  expect(status).toBe(500);
});

it('returns undefined for a typed domain error the table does not name', () => {
  const error = new IncoherentCaseError('a-slug', ['a violation']);

  const status = statusForError(error);

  expect(status).toBeUndefined();
});

it('returns undefined for a thrown value that is not an Error at all', () => {
  const status = statusForError('a plain string');

  expect(status).toBeUndefined();
});


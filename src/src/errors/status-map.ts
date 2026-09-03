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
import { ConceptDescriptionRequiredError } from './concept-description-required.error.js';
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
import { InvestigationWriteDeadlineExceededError } from './investigation-write-deadline-exceeded.error.js';
import { MalformedCapabilityInputSchemaError } from './malformed-capability-input-schema.error.js';
import { ManifestPositionOccupiedError } from './manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from './manifest-would-hold-no-hypothesis.error.js';
import { ReleasedHypothesisRevisionNotAlterableError } from './released-hypothesis-revision-not-alterable.error.js';
import { SubjectDoesNotCoverCaseInputsError } from './subject-does-not-cover-case-inputs.error.js';
import { VocabularyTermNotHeldError } from './vocabulary-term-not-held.error.js';

type DomainErrorClass = new (...args: never[]) => Error;

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
  [ReleasedHypothesisRevisionNotAlterableError, 409],
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
  [ConceptDescriptionRequiredError, 422],
  [InvestigationWriteDeadlineExceededError, 500],
]);

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

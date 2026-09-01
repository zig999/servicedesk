import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
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

function proseOf(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

it("the header comment names the two specification nodes that now fix a status as a decided fact, rather than claiming no node does", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).not.toMatch(/no specification node/i);
  expect(header).toContain('constraints/the-capability-identity-read-refuses-an-unregistered-identity');
  expect(header).toContain('rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused');
  expect(header).toContain("every other entry's status stays this project's own engineering decision");
});

it("the header comment names eleven specification nodes that now fix a status as a decided fact, and states ConnectorConfigurationNotWellFormedError's 422 and SubjectDoesNotCoverCaseInputsError's 422 and ConnectorPlaceholderOutsideInputSchemaError's 422 as facts their own rules decide rather than as this project's own engineering decision", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).toContain('thirteen specification nodes now fix a status as a decided fact');
  expect(header).toContain("ConnectorConfigurationNotWellFormedError's HTTP 422");
  expect(header).toContain('rules/integration/a-connector-configuration-holds-a-well-formed-object');
  expect(header).toContain('with an HTTP 422 response reporting a ConnectorConfigurationNotWellFormedError');
  expect(header).toContain("SubjectDoesNotCoverCaseInputsError's HTTP 422");
  expect(header).toContain('rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes');
  expect(header).toContain('with an HTTP 422 response reporting a SubjectDoesNotCoverCaseInputsError naming every missing attribute');
  expect(header).toContain("ConnectorPlaceholderOutsideInputSchemaError's HTTP 422");
  expect(header).toContain('rules/integration/a-connector-placeholder-is-declared-by-its-capability');
  expect(header).toContain('with an HTTP 422 response reporting a ConnectorPlaceholderOutsideInputSchemaError naming every orphaned placeholder together with the capability that fails to declare it');
  expect(header).toContain("every other entry's status stays this project's own engineering decision");
});

it("the header's top paragraph cites each of the four hotfix classes' own governing rule alongside the HTTP status it fixes", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).toContain("CaseHoldsNoDraftError's HTTP 409");
  expect(header).toContain('rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft');
  expect(header).toContain('with an HTTP 409 response reporting a CaseHoldsNoDraftError');
  expect(header).toContain("ConceptNotInGlossaryError's HTTP 404");
  expect(header).toContain('rules/knowledge/case-terms-exist-in-the-glossary');
  expect(header).toContain('with HTTP 404 reporting ConceptNotInGlossaryError');
  expect(header).toContain("HypothesisRevisionCollectsNoConceptError's HTTP 422");
  expect(header).toContain('rules/knowledge/a-hypothesis-collects-at-least-one-concept');
  expect(header).toContain('with an HTTP 422 response reporting a HypothesisRevisionCollectsNoConceptError');
  expect(header).toContain("ConceptRefusesSubjectTypeError's HTTP 422");
  expect(header).toContain('rules/knowledge/a-concept-accepts-the-declared-subject-type');
  expect(header).toContain('with an HTTP 422 response reporting a ConceptRefusesSubjectTypeError');
});

it("the header's own 404/409/422 group enumeration names each of the four hotfix classes under its correct group, alongside the rule that governs it", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).toContain(
    'ConceptNotInGlossaryError — the ninth, raised by the same POST /v1/cases/:slug/hypotheses route ' +
      'already handling every other revise-hypothesis refusal, left unmapped until this hotfix closed the gap ' +
      '(rules/knowledge/case-terms-exist-in-the-glossary)',
  );
  expect(header).toContain(
    "a hypothesis-revision requested while the case holds no draft version (CaseHoldsNoDraftError, " +
      "rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft) — a status that rule fixes rather " +
      "than this project's own choice",
  );
  expect(header).toContain(
    'a hypothesis-revision that would collect no concept (HypothesisRevisionCollectsNoConceptError, ' +
      'rules/knowledge/a-hypothesis-collects-at-least-one-concept), or a hypothesis-revision collecting a concept ' +
      "that does not accept the case version's declared subject type (ConceptRefusesSubjectTypeError, " +
      'rules/knowledge/a-concept-accepts-the-declared-subject-type)',
  );
});

it('the header\'s own "reached this table" narrative explains the ninth and tenth entries arrived through this hotfix rather than a newly-exposed route', async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).toContain(
    'the ninth and tenth reach it not because a new route was exposed but because this hotfix closes ' +
      'a gap left when revise-hypothesis was first delivered — POST /v1/cases/:slug/hypotheses already ' +
      'raised both, unmapped, before this task.',
  );
});

it("the header names InvestigationWriteDeadlineExceededError's HTTP 500 as a fact rules/investigation/no-stage-aborts-on-its-deadline decides, quoting its own closing clause", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).toContain("InvestigationWriteDeadlineExceededError's HTTP 500");
  expect(header).toContain('rules/investigation/no-stage-aborts-on-its-deadline');
  expect(header).toContain(
    'a persistence that settles no write, in either case, is answered with an HTTP 500 response reporting an InvestigationWriteDeadlineExceededError',
  );
});

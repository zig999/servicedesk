// Proof for task/case-lifecycle-http/status-map: statusForError() resolves
// each of the seven typed domain error classes this HTTP surface raises to
// the transport status the table assigns it (COR-04), and returns undefined
// for anything the table does not name — the caller's own signal to keep
// answering 500 unchanged. error-handler.middleware.ts's own consultation of
// this function is proved separately, in
// __tests__/unit/http/error-handler.middleware.spec.ts.
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

// Added for task/case-simulation-pipeline/simulate-hypothesis-operation, whose own criterion 4
// depends on this exact entry: "A hypothesis name absent from the version's manifest is refused
// with an HTTP 404 response reporting a HypothesisNotInManifestError."
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

// Added for task/diagnose-release-gate/refuse-diagnosis-of-a-draft-case-version, whose own
// criterion 2 depends on this exact entry: the new error is registered in status-map.ts's
// STATUS_BY_ERROR_CLASS table, mapped to a status this project decides as its own engineering
// choice — 409, grouped with this table's other "an operation the named resource's own current
// state forbids" entries.
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

// Added for task/capability-input-schema-contract/refuse-malformed-capability-input-schema,
// whose own criterion 6 depends on this exact entry: "MalformedCapabilityInputSchemaError
// resolves to 422 through the shared status map."
it('resolves MalformedCapabilityInputSchemaError to 422', () => {
  const error = new MalformedCapabilityInputSchemaError(['a problem']);

  const status = statusForError(error);

  expect(status).toBe(422);
});

// Added for task/case-input-requirements-and-diagnose-gate/refuse-diagnose-missing-required-attribute,
// whose own criterion 1 depends on this exact entry: "... refused with an HTTP 422 response
// reporting SubjectDoesNotCoverCaseInputsError ...".
it('resolves SubjectDoesNotCoverCaseInputsError to 422', () => {
  const error = new SubjectDoesNotCoverCaseInputsError([
    { attribute: 'contract-number', capabilities: [{ name: 'equipment-status-lookup', version: '1.0.0' }] },
  ]);

  const status = statusForError(error);

  expect(status).toBe(422);
});

// Added for task/connector-configuration-and-placeholder-contract/refuse-connector-registration-with-orphaned-placeholder,
// whose own criterion 1 depends on this exact entry: "... refused with an HTTP 422 response
// reporting ConnectorPlaceholderOutsideInputSchemaError."
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

// ------------------------------------------------------------------ task/revise-hypothesis-status-map-hotfix/map-status-for-typed-refusals,
// criteria 1-4: the four revise-hypothesis refusals this hotfix maps, each
// previously unmapped and falling through to the generic 500.

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

// ------------------------------------------------------------------ task/concept-description/concept-registration-requires-a-description,
// criterion 1: "A concept registration naming no description is refused with an HTTP 422 response
// reporting ConceptDescriptionRequiredError." GlossaryService.registerConcept's own throw of this
// class is proved separately, in glossary.service.spec.ts; this is the mapping half.

it('resolves ConceptDescriptionRequiredError to 422', () => {
  const error = new ConceptDescriptionRequiredError('a-concept', undefined);

  const status = statusForError(error);

  expect(status).toBe(422);
});

// ------------------------------------------------------------------ task/run-diagnosis-persistence-deadline-hotfix/persistence-deadline-uses-remaining-time-and-retries,
// criterion 9: "Every path that raises InvestigationWriteDeadlineExceededError is answered to the
// requester as an HTTP 500 response naming InvestigationWriteDeadlineExceededError as the reported
// condition." Before this hotfix, this class fell through this table unmapped, answering the
// handler's own generic, unnamed 500 fallback instead — the full request/response wiring for that
// distinction is proved in error-handler.middleware.spec.ts; this is the mapping half.

it('resolves InvestigationWriteDeadlineExceededError to 500', () => {
  const error = new InvestigationWriteDeadlineExceededError('an-investigation-id', 300);

  const status = statusForError(error);

  expect(status).toBe(500);
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

// ------------------------------------------------------------------ task/stale-specification-citations/citations-corrected, criterion 1

// Strips every line's own leading comment marker (a line-comment slash pair, or a block-comment
// opener, closer or continuation star) and collapses what remains to one line of prose, so a
// comment wrapped across several source lines compares the same as its own single-line paraphrase.
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

// ------------------------------------------------------------------ task/stale-specification-citations-round-two/citations-corrected-again, criterion 1

// The round-one test above named "two specification nodes" and did not require
// ConnectorConfigurationNotWellFormedError's own citation; round two adds a third
// specification-fixed status to the same header paragraph, so the count in prose changed
// from two to three and the count itself is asserted only here rather than duplicated above.
// task/case-simulation-pipeline/simulate-hypothesis-operation then added a fourth
// specification-fixed status (HypothesisNotInManifestError) to the same header paragraph, so the
// count in prose changed again from three to four.
// task/capability-input-schema-contract/refuse-malformed-capability-input-schema then added a
// fifth specification-fixed status (MalformedCapabilityInputSchemaError) to the same header
// paragraph, so the count in prose changed again from four to five.
// task/case-input-requirements-and-diagnose-gate/refuse-diagnose-missing-required-attribute then
// added a sixth specification-fixed status (SubjectDoesNotCoverCaseInputsError) to the same
// header paragraph, so the count in prose changed again from five to six.
// task/connector-configuration-and-placeholder-contract/refuse-connector-registration-with-orphaned-placeholder
// then added a seventh specification-fixed status (ConnectorPlaceholderOutsideInputSchemaError) to
// the same header paragraph, so the count in prose changed again from six to seven.
// task/revise-hypothesis-status-map-hotfix/map-status-for-typed-refusals then added an eighth
// through an eleventh specification-fixed status (CaseHoldsNoDraftError, ConceptNotInGlossaryError,
// HypothesisRevisionCollectsNoConceptError, ConceptRefusesSubjectTypeError) to the same header
// paragraph, so the count in prose changed again from seven to eleven — asserted here only as the
// running count; the four new citations themselves are asserted in this hotfix's own tests below.
it("the header comment names eleven specification nodes that now fix a status as a decided fact, and states ConnectorConfigurationNotWellFormedError's 422 and SubjectDoesNotCoverCaseInputsError's 422 and ConnectorPlaceholderOutsideInputSchemaError's 422 as facts their own rules decide rather than as this project's own engineering decision", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  // task/run-diagnosis-persistence-deadline-hotfix/persistence-deadline-uses-remaining-time-and-retries
  // added a thirteenth specification-fixed status (InvestigationWriteDeadlineExceededError) to the
  // same header paragraph, so the count in prose changed again from twelve to thirteen — asserted
  // here only as the running count; that citation itself is asserted in this hotfix's own test below.
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

// ------------------------------------------------------------------ task/revise-hypothesis-status-map-hotfix/map-status-for-typed-refusals, criterion 6

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

// Proves the record's own disclosed inference: the ninth and tenth entries' own "reached this
// table" ordinal narrative was extended to explain they arrived via this hotfix rather than a
// newly-exposed route — the alternative the record considered and rejected was leaving that
// narrative unextended, silently treating a hotfix addition the same as every prior route-exposure
// addition.
it('the header\'s own "reached this table" narrative explains the ninth and tenth entries arrived through this hotfix rather than a newly-exposed route', async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).toContain(
    'the ninth and tenth reach it not because a new route was exposed but because this hotfix closes ' +
      'a gap left when revise-hypothesis was first delivered — POST /v1/cases/:slug/hypotheses already ' +
      'raised both, unmapped, before this task.',
  );
});

// ------------------------------------------------------------------ task/run-diagnosis-persistence-deadline-hotfix/persistence-deadline-uses-remaining-time-and-retries,
// criterion 9: the header names InvestigationWriteDeadlineExceededError's own governing rule
// alongside the HTTP 500 it fixes, quoting the rule's own closing clause — the same
// citation-alongside-status pattern every other specification-fixed entry above already keeps.

it("the header names InvestigationWriteDeadlineExceededError's HTTP 500 as a fact rules/investigation/no-stage-aborts-on-its-deadline decides, quoting its own closing clause", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../errors/status-map.ts', import.meta.url)), 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import {')));

  expect(header).toContain("InvestigationWriteDeadlineExceededError's HTTP 500");
  expect(header).toContain('rules/investigation/no-stage-aborts-on-its-deadline');
  expect(header).toContain(
    'a persistence that settles no write, in either case, is answered with an HTTP 500 response reporting an InvestigationWriteDeadlineExceededError',
  );
});

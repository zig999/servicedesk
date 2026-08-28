// Proof for task/case-simulation-pipeline/simulate-case-operation: handleSimulateCaseRequest reads
// the pinned case through ICaseQuery regardless of its declared state, refuses before the pipeline
// ever runs where the subject carries no attribute-value at all or names an attribute the glossary
// does not hold, reuses case-query's own errors unchanged for an unknown slug or version, and
// otherwise calls runSimulate and answers its whole record — evidence, evaluations, resolved,
// assessment, cost and durations — unchanged, carrying no narrative or ticket-reference field.
// ICaseQuery.readCase, IGlossaryQuery.readVocabularyTerm and runSimulate are stand-ins here
// (TST-03 — each is a boundary this controller calls, never business logic of its own): the same
// shape diagnose.controller.spec.ts already establishes for its own sibling controller. The wired
// production composition itself (production-simulate.factory.ts, simulate.factory.ts) is proven
// separately, at the unit level in simulate.factory.spec.ts and at the real-composition level
// against diagnose-server.factory.ts.
import { expect, expectTypeOf, it, vi } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { SubjectAttributeNotInGlossaryError } from '../../../errors/subject-attribute-not-in-glossary.error.js';
import { SubjectCarriesNoAttributeError } from '../../../errors/subject-carries-no-attribute.error.js';
import type { ProductionSimulationCall } from '../../../factories/production-simulate.factory.js';
import type { IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import { handleSimulateCaseRequest, type SimulateCaseControllerDependencies } from '../../../http/simulate-case.controller.js';
import type { SimulateCaseRequestDto } from '../../../http/dto/simulate-case.dto.js';
import type { InvestigationPipelineResult } from '../../../investigation/investigation-pipeline.js';

/** domain/knowledge/resolution, whole: an outcome paired with its referral. */
function heldResolution(outcome = 'an-outcome'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

/** domain/knowledge/manifest-entry: one precedence position pinning one whole hypothesis-revision. */
function heldManifestEntry(position: number, hypothesisName: string): ManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: hypothesisName },
      revision: 1,
      criterion: 'a-criterion',
      collects: ['a-concept'],
      resolution: heldResolution(),
    },
  };
}

/** A case version as case-query would already hold it, overridable per test so state/slug/version vary without a second builder — mirrors diagnose.controller.spec.ts's own heldCase exactly. */
function heldCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs it',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    state: 'released',
    manifest: [heldManifestEntry(1, 'hypothesis-a')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: heldResolution() }],
    ...overrides,
  };
}

const REQUEST_BODY: SimulateCaseRequestDto = {
  case: { slug: 'a-slug', version: 1 },
  subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
  requester: 'a-requester',
};

/** InvestigationPipelineResult's own complete record, exactly the six fields simulate-case's own response forwards unchanged, plus the one field it deliberately never forwards (prompts) — so a test asserting the controller's own answer strips prompts proves it rather than merely restating what runSimulate happened to return. */
function completeRecord(): InvestigationPipelineResult {
  return {
    evidence: [
      {
        concept: 'a-concept',
        inputs: '{}',
        observation: 'an-observation',
        observed_at: '2024-01-01T00:00:00.000Z',
        ttl: 60,
        origin: 'a-connector',
        result: 'ok',
        capability_name: 'a-capability',
        capability_version: '1.0.0',
        elapsed_ms: 10,
      },
    ],
    evaluations: [
      { hypothesis: 'hypothesis-a', verdict: 'confirmed', citations: [{ concept: 'a-concept', field: 'a-field' }] },
    ],
    resolved: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, determining: 'hypothesis-a' },
    assessment: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, determining_hypothesis: 'hypothesis-a', text: 'a drafted text' },
    cost: { calls: 3, input_tokens: 300, output_tokens: 100 },
    durations: { collection: 10, judgment: 20, writing: 30, total: 60 },
    prompts: { writing: 'the consolidation prompt this task never publishes' },
  };
}

type ReadCaseMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>>;
type ReadVocabularyTermMock = ReturnType<typeof vi.fn<IGlossaryQuery['readVocabularyTerm']>>;
type RunSimulateMock = ReturnType<typeof vi.fn<(call: ProductionSimulationCall) => Promise<InvestigationPipelineResult>>>;

/** Wires SimulateCaseControllerDependencies with a readCase stand-in that always answers the given case, a glossary stand-in that holds every attribute by default, and a runSimulate stand-in the test configures per case (TST-03). */
function buildDependencies(
  readCaseResult: ReadCaseResult,
): { dependencies: SimulateCaseControllerDependencies; readCase: ReadCaseMock; readVocabularyTerm: ReadVocabularyTermMock; runSimulate: RunSimulateMock } {
  const readCase: ReadCaseMock = vi.fn().mockResolvedValue(readCaseResult);
  const caseQuery: ICaseQuery = {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const readVocabularyTerm: ReadVocabularyTermMock = vi.fn().mockImplementation(
    async (_vocabulary, name: string): Promise<TermResolution> => ({ held: true, term: { name } }),
  );
  const glossary: IGlossaryQuery = {
    readVocabularyTerm,
    readConcept: vi.fn(),
    listVocabularyTerms: vi.fn(),
    listConcepts: vi.fn(),
  };
  const runSimulate: RunSimulateMock = vi.fn();
  const dependencies: SimulateCaseControllerDependencies = { caseQuery, glossary, runSimulate };
  return { dependencies, readCase, readVocabularyTerm, runSimulate };
}

// ------------------------------------------------------------------ criteria 1 and 2

it('returns the complete record — evidence, evaluations, resolved, assessment, cost and durations — for a draft-state pinned case version, unchanged', async () => {
  const { dependencies, runSimulate } = buildDependencies({ case: heldCase({ state: 'draft' }) });
  const record = completeRecord();
  runSimulate.mockResolvedValueOnce(record);

  const result = await handleSimulateCaseRequest(dependencies, REQUEST_BODY);

  expect(result).toEqual({
    evidence: record.evidence,
    evaluations: record.evaluations,
    resolved: record.resolved,
    assessment: record.assessment,
    cost: record.cost,
    durations: record.durations,
  });
});

it('returns the complete record likewise for a released-state pinned case version', async () => {
  const { dependencies, runSimulate } = buildDependencies({ case: heldCase({ state: 'released' }) });
  const record = completeRecord();
  runSimulate.mockResolvedValueOnce(record);

  const result = await handleSimulateCaseRequest(dependencies, REQUEST_BODY);

  expect(result).toEqual({
    evidence: record.evidence,
    evaluations: record.evaluations,
    resolved: record.resolved,
    assessment: record.assessment,
    cost: record.cost,
    durations: record.durations,
  });
});

it('reads the pinned case through readCase with no branch on its declared state, calling runSimulate for a draft version exactly as it would for a released one', async () => {
  const draftDependencies = buildDependencies({ case: heldCase({ state: 'draft' }) });
  draftDependencies.runSimulate.mockResolvedValueOnce(completeRecord());
  const releasedDependencies = buildDependencies({ case: heldCase({ state: 'released' }) });
  releasedDependencies.runSimulate.mockResolvedValueOnce(completeRecord());

  await handleSimulateCaseRequest(draftDependencies.dependencies, REQUEST_BODY);
  await handleSimulateCaseRequest(releasedDependencies.dependencies, REQUEST_BODY);

  expect(draftDependencies.runSimulate).toHaveBeenCalledTimes(1);
  expect(releasedDependencies.runSimulate).toHaveBeenCalledTimes(1);
});

// ------------------------------------------------------------------ criterion 3

it('SimulateCaseControllerDependencies declares exactly caseQuery, glossary and runSimulate — no store, event bus or other write-capable dependency the controller could call', () => {
  // A structural guarantee over the real production type (simulate-case.controller.ts), not over
  // any fixture this file built: no investigation-writing or event-emitting call is even reachable
  // from handleSimulateCaseRequest, because nothing it could call is ever handed to it.
  expectTypeOf<SimulateCaseControllerDependencies>().toEqualTypeOf<{
    readonly caseQuery: ICaseQuery;
    readonly glossary: IGlossaryQuery;
    readonly runSimulate: (call: ProductionSimulationCall) => Promise<InvestigationPipelineResult>;
  }>();
});

it('answers exactly what runSimulate resolved, calling neither a store nor any other dependency beyond caseQuery.readCase and glossary.readVocabularyTerm', async () => {
  const { dependencies, readCase, readVocabularyTerm, runSimulate } = buildDependencies({ case: heldCase() });
  runSimulate.mockResolvedValueOnce(completeRecord());

  await handleSimulateCaseRequest(dependencies, REQUEST_BODY);

  expect(readCase).toHaveBeenCalledTimes(1);
  expect(readVocabularyTerm).toHaveBeenCalledTimes(1);
  expect(runSimulate).toHaveBeenCalledTimes(1);
});

// ------------------------------------------------------------------ criterion 4

it('refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError, before runSimulate is ever called', async () => {
  const { dependencies, runSimulate } = buildDependencies({ case: heldCase() });
  const bodyWithNoAttributes: SimulateCaseRequestDto = { ...REQUEST_BODY, subject: { type: 'a-subject-type', attributes: [] } };

  const rejection = handleSimulateCaseRequest(dependencies, bodyWithNoAttributes);

  await expect(rejection).rejects.toBeInstanceOf(SubjectCarriesNoAttributeError);
  expect(runSimulate).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ criterion 5

it('refuses a request naming a subject attribute the glossary does not hold, throwing exactly a SubjectAttributeNotInGlossaryError, before runSimulate is ever called', async () => {
  const { dependencies, readVocabularyTerm, runSimulate } = buildDependencies({ case: heldCase() });
  readVocabularyTerm.mockImplementation(async (_vocabulary, name: string): Promise<TermResolution> => ({
    held: false,
    vocabulary: 'subject-attribute',
    name,
  }));

  const rejection = handleSimulateCaseRequest(dependencies, REQUEST_BODY);

  await expect(rejection).rejects.toBeInstanceOf(SubjectAttributeNotInGlossaryError);
  expect(runSimulate).not.toHaveBeenCalled();
});

it("names the offending attribute on the thrown refusal, applying the same rule diagnose applies rather than a fixed message", async () => {
  const { dependencies, readVocabularyTerm } = buildDependencies({ case: heldCase() });
  readVocabularyTerm.mockImplementation(async (_vocabulary, name: string): Promise<TermResolution> => ({
    held: false,
    vocabulary: 'subject-attribute',
    name,
  }));

  const rejection = handleSimulateCaseRequest(dependencies, {
    ...REQUEST_BODY,
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-ungoverned-attribute', value: 'a-value' }] },
  });

  await expect(rejection).rejects.toMatchObject({ context: { attributes: ['an-ungoverned-attribute'] } });
});

// ------------------------------------------------------------------ criterion 6

it('reuses case-query\'s own CaseNotFoundError unchanged for an unknown case slug or version, before runSimulate is ever called', async () => {
  const { dependencies, readCase, runSimulate } = buildDependencies({ case: heldCase() });
  const notFound = new CaseNotFoundError('an-unknown-slug', 9);
  readCase.mockRejectedValueOnce(notFound);

  const rejection = handleSimulateCaseRequest(dependencies, { ...REQUEST_BODY, case: { slug: 'an-unknown-slug', version: 9 } });

  await expect(rejection).rejects.toBe(notFound);
  expect(runSimulate).not.toHaveBeenCalled();
});

it("reuses case-query's own CaseNotValidError unchanged for an incoherent case version, before runSimulate is ever called", async () => {
  const { dependencies, readCase, runSimulate } = buildDependencies({ case: heldCase() });
  const notValid = new CaseNotValidError('a-slug', 1, ['a violated rule']);
  readCase.mockRejectedValueOnce(notValid);

  const rejection = handleSimulateCaseRequest(dependencies, REQUEST_BODY);

  await expect(rejection).rejects.toBe(notValid);
  expect(runSimulate).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ criterion 7

it('answers exactly evidence, evaluations, resolved, assessment, cost and durations — no narrative and no ticket_ref field, and no prompts field either', async () => {
  const { dependencies, runSimulate } = buildDependencies({ case: heldCase() });
  runSimulate.mockResolvedValueOnce(completeRecord());

  const result = await handleSimulateCaseRequest(dependencies, REQUEST_BODY);

  expect(Object.keys(result).sort()).toEqual(['assessment', 'cost', 'durations', 'evaluations', 'evidence', 'resolved']);
  expect(result).not.toHaveProperty('narrative');
  expect(result).not.toHaveProperty('ticket_ref');
  expect(result).not.toHaveProperty('prompts');
});

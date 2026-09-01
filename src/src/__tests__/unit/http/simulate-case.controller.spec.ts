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

function heldResolution(outcome = 'an-outcome'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

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
        fields: [],
        concept_description: '',
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

it('SimulateCaseControllerDependencies declares exactly caseQuery, glossary and runSimulate — no store, event bus or other write-capable dependency the controller could call', () => {

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

it('refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError, before runSimulate is ever called', async () => {
  const { dependencies, runSimulate } = buildDependencies({ case: heldCase() });
  const bodyWithNoAttributes: SimulateCaseRequestDto = { ...REQUEST_BODY, subject: { type: 'a-subject-type', attributes: [] } };

  const rejection = handleSimulateCaseRequest(dependencies, bodyWithNoAttributes);

  await expect(rejection).rejects.toBeInstanceOf(SubjectCarriesNoAttributeError);
  expect(runSimulate).not.toHaveBeenCalled();
});

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

it('answers exactly evidence, evaluations, resolved, assessment, cost and durations — no narrative and no ticket_ref field, and no prompts field either', async () => {
  const { dependencies, runSimulate } = buildDependencies({ case: heldCase() });
  runSimulate.mockResolvedValueOnce(completeRecord());

  const result = await handleSimulateCaseRequest(dependencies, REQUEST_BODY);

  expect(Object.keys(result).sort()).toEqual(['assessment', 'cost', 'durations', 'evaluations', 'evidence', 'resolved']);
  expect(result).not.toHaveProperty('narrative');
  expect(result).not.toHaveProperty('ticket_ref');
  expect(result).not.toHaveProperty('prompts');
});

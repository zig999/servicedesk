import { expect, expectTypeOf, it, vi } from 'vitest';
import type { Case, ManifestEntry } from '../../../case/case.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { HypothesisNotInManifestError } from '../../../errors/hypothesis-not-in-manifest.error.js';
import { SubjectAttributeNotInGlossaryError } from '../../../errors/subject-attribute-not-in-glossary.error.js';
import { SubjectCarriesNoAttributeError } from '../../../errors/subject-carries-no-attribute.error.js';
import type { ProductionHypothesisSimulationCall } from '../../../factories/production-simulate-hypothesis.factory.js';
import type { IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import { handleSimulateHypothesisRequest, type SimulateHypothesisControllerDependencies } from '../../../http/simulate-hypothesis.controller.js';
import type { SimulateHypothesisRequestDto } from '../../../http/dto/simulate-hypothesis.dto.js';
import type { SimulateHypothesisPipelineResult } from '../../../investigation/simulate-hypothesis-pipeline.js';

function heldManifestEntry(position: number, hypothesisName: string): ManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: hypothesisName },
      revision: 1,
      criterion: 'a-criterion',
      collects: ['a-concept'],
      resolution: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
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
    fallback: { outcome: 'no-hypothesis-confirmed', referral: { action: 'an-action', recipient: 'a-recipient' } },
    state: 'released',
    manifest: [heldManifestEntry(1, 'hypothesis-a')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } } }],
    ...overrides,
  };
}

const REQUEST_BODY: SimulateHypothesisRequestDto = {
  case: { slug: 'a-slug', version: 1 },
  subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
  requester: 'a-requester',
  hypothesis: 'hypothesis-a',
};

function completeRecord(): SimulateHypothesisPipelineResult {
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
    evaluation: { hypothesis: 'hypothesis-a', verdict: 'confirmed', citations: [{ concept: 'a-concept', field: 'a-field' }] },
    durations: { collection: 10, judgment: 20, total: 30 },
  };
}

type ReadCaseMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>>;
type ReadVocabularyTermMock = ReturnType<typeof vi.fn<IGlossaryQuery['readVocabularyTerm']>>;
type RunSimulateHypothesisMock = ReturnType<typeof vi.fn<(call: ProductionHypothesisSimulationCall) => Promise<SimulateHypothesisPipelineResult>>>;

function buildDependencies(
  readCaseResult: ReadCaseResult,
): { dependencies: SimulateHypothesisControllerDependencies; readCase: ReadCaseMock; readVocabularyTerm: ReadVocabularyTermMock; runSimulateHypothesis: RunSimulateHypothesisMock } {
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
  const runSimulateHypothesis: RunSimulateHypothesisMock = vi.fn();
  const dependencies: SimulateHypothesisControllerDependencies = { caseQuery, glossary, runSimulateHypothesis };
  return { dependencies, readCase, readVocabularyTerm, runSimulateHypothesis };
}

it('returns exactly evidence, evaluation and durations, unchanged from what runSimulateHypothesis resolved', async () => {
  const { dependencies, runSimulateHypothesis } = buildDependencies({ case: heldCase() });
  const record = completeRecord();
  runSimulateHypothesis.mockResolvedValueOnce(record);

  const result = await handleSimulateHypothesisRequest(dependencies, REQUEST_BODY);

  expect(result).toEqual({ evidence: record.evidence, evaluation: record.evaluation, durations: record.durations });
});

it('answers exactly evidence, evaluation and durations — no resolved, no assessment, no cost, no narrative and no ticket_ref field', async () => {
  const { dependencies, runSimulateHypothesis } = buildDependencies({ case: heldCase() });
  runSimulateHypothesis.mockResolvedValueOnce(completeRecord());

  const result = await handleSimulateHypothesisRequest(dependencies, REQUEST_BODY);

  expect(Object.keys(result).sort()).toEqual(['durations', 'evaluation', 'evidence']);
  expect(result).not.toHaveProperty('resolved');
  expect(result).not.toHaveProperty('assessment');
  expect(result).not.toHaveProperty('cost');
  expect(result).not.toHaveProperty('narrative');
  expect(result).not.toHaveProperty('ticket_ref');
});

it('SimulateHypothesisControllerDependencies declares exactly caseQuery, glossary and runSimulateHypothesis — no store, event bus or other write-capable dependency the controller could call', () => {
  expectTypeOf<SimulateHypothesisControllerDependencies>().toEqualTypeOf<{
    readonly caseQuery: ICaseQuery;
    readonly glossary: IGlossaryQuery;
    readonly runSimulateHypothesis: (call: ProductionHypothesisSimulationCall) => Promise<SimulateHypothesisPipelineResult>;
  }>();
});

it('answers exactly what runSimulateHypothesis resolved, calling neither a store nor any other dependency beyond caseQuery.readCase and glossary.readVocabularyTerm', async () => {
  const { dependencies, readCase, readVocabularyTerm, runSimulateHypothesis } = buildDependencies({ case: heldCase() });
  runSimulateHypothesis.mockResolvedValueOnce(completeRecord());

  await handleSimulateHypothesisRequest(dependencies, REQUEST_BODY);

  expect(readCase).toHaveBeenCalledTimes(1);
  expect(readVocabularyTerm).toHaveBeenCalledTimes(1);
  expect(runSimulateHypothesis).toHaveBeenCalledTimes(1);
});

it('propagates a HypothesisNotInManifestError raised by runSimulateHypothesis unchanged, never re-decided or swallowed by the controller', async () => {
  const { dependencies, runSimulateHypothesis } = buildDependencies({ case: heldCase() });
  const notInManifest = new HypothesisNotInManifestError('a-slug', 1, 'an-absent-hypothesis');
  runSimulateHypothesis.mockRejectedValueOnce(notInManifest);

  const rejection = handleSimulateHypothesisRequest(dependencies, { ...REQUEST_BODY, hypothesis: 'an-absent-hypothesis' });

  await expect(rejection).rejects.toBe(notInManifest);
});

it('refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError, before runSimulateHypothesis is ever called', async () => {
  const { dependencies, runSimulateHypothesis } = buildDependencies({ case: heldCase() });
  const bodyWithNoAttributes: SimulateHypothesisRequestDto = { ...REQUEST_BODY, subject: { type: 'a-subject-type', attributes: [] } };

  const rejection = handleSimulateHypothesisRequest(dependencies, bodyWithNoAttributes);

  await expect(rejection).rejects.toBeInstanceOf(SubjectCarriesNoAttributeError);
  expect(runSimulateHypothesis).not.toHaveBeenCalled();
});

it('refuses a request naming a subject attribute the glossary does not hold, throwing exactly a SubjectAttributeNotInGlossaryError, before runSimulateHypothesis is ever called', async () => {
  const { dependencies, readVocabularyTerm, runSimulateHypothesis } = buildDependencies({ case: heldCase() });
  readVocabularyTerm.mockImplementation(async (_vocabulary, name: string): Promise<TermResolution> => ({
    held: false,
    vocabulary: 'subject-attribute',
    name,
  }));

  const rejection = handleSimulateHypothesisRequest(dependencies, REQUEST_BODY);

  await expect(rejection).rejects.toBeInstanceOf(SubjectAttributeNotInGlossaryError);
  expect(runSimulateHypothesis).not.toHaveBeenCalled();
});

it('names the offending attribute on the thrown refusal, applying the same rule diagnose applies rather than a fixed message', async () => {
  const { dependencies, readVocabularyTerm } = buildDependencies({ case: heldCase() });
  readVocabularyTerm.mockImplementation(async (_vocabulary, name: string): Promise<TermResolution> => ({
    held: false,
    vocabulary: 'subject-attribute',
    name,
  }));

  const rejection = handleSimulateHypothesisRequest(dependencies, {
    ...REQUEST_BODY,
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-ungoverned-attribute', value: 'a-value' }] },
  });

  await expect(rejection).rejects.toMatchObject({ context: { attributes: ['an-ungoverned-attribute'] } });
});

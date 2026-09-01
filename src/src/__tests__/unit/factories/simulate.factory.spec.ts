// expectTypeOf, and a `@ts-expect-error` literal shows the compiler refuses a dependency object

import { beforeEach, expect, expectTypeOf, it, vi } from 'vitest';

const { runInvestigationPipelineMock, capturedPipelineCalls, producedPipelineResults } = vi.hoisted(() => {
  const capturedPipelineCalls: unknown[] = [];
  const producedPipelineResults: unknown[] = [];
  const runInvestigationPipelineMock = vi.fn().mockImplementation((options: unknown) => {
    capturedPipelineCalls.push(options);
    const result = {
      evidence: [],
      evaluations: [],
      resolved: { outcome: 'unused-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
      assessment: { outcome: 'unused-outcome', referral: { action: 'refer', recipient: 'a-queue' }, text: 'unused-text' },
      cost: { calls: 1, input_tokens: 10, output_tokens: 20 },
      durations: { collection: 1, judgment: 2, writing: 3, total: 6 },
      prompts: { writing: 'unused-writing-prompt' },
    };
    producedPipelineResults.push(result);
    return Promise.resolve(result);
  });
  return { runInvestigationPipelineMock, capturedPipelineCalls, producedPipelineResults };
});
vi.mock('../../../investigation/investigation-pipeline.js', () => ({ runInvestigationPipeline: runInvestigationPipelineMock }));

const { createCapabilityQueryMock } = vi.hoisted(() => ({
  createCapabilityQueryMock: vi.fn().mockImplementation(() => ({})),
}));
vi.mock('../../../factories/capability-registry.factory.js', () => ({ createCapabilityQuery: createCapabilityQueryMock }));

const { createConnectorConfigurationRegistryMock } = vi.hoisted(() => ({
  createConnectorConfigurationRegistryMock: vi.fn().mockImplementation(() => ({})),
}));
vi.mock('../../../factories/connector-configuration-registry.factory.js', () => ({
  createConnectorConfigurationRegistry: createConnectorConfigurationRegistryMock,
}));

const { httpDeclarativeObservationSourceMock } = vi.hoisted(() => ({ httpDeclarativeObservationSourceMock: vi.fn() }));
vi.mock('../../../investigation/http-declarative-observation-source.adapter.js', () => ({
  HttpDeclarativeObservationSource: httpDeclarativeObservationSourceMock,
}));

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Case } from '../../../case/case.js';
import {
  createSimulationRunner,
  type SimulationCall,
  type SimulationDependencies,
} from '../../../factories/simulate.factory.js';
import type { ConsolidationOutcome, IAssessmentConsolidator } from '../../../investigation/assessment-consolidator.port.js';
import type { ConsolidationRegister } from '../../../investigation/consolidation-register.js';
import type { EvaluationOutcome, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import type { IObservationSource, ObservationOutcome } from '../../../investigation/observation-source.port.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';

class FakeHypothesisEvaluator implements IHypothesisEvaluator {
  public async evaluate(): Promise<EvaluationOutcome> {
    return { verdict: 'inconclusive', reason: 'no-data', citations: [] };
  }
}

class FakeAssessmentConsolidator implements IAssessmentConsolidator {
  public async consolidate(): Promise<ConsolidationOutcome> {
    return { text: 'unused-text', register: 'plain', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0, prompt: 'unused-prompt' };
  }
}

class UnusedObservationSource implements IObservationSource {
  public async observeConcept(): Promise<ObservationOutcome> {
    return { result: 'ok', observation: 'unused' };
  }
}

function aCase(): Case {
  return {
    slug: 'a-case',
    title: 'a title',
    when_to_use: 'a when-to-use',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject-type',
    fallback: { outcome: 'a-fallback-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
    state: 'released',
    manifest: [],
    hypotheses: [{ name: 'h1', criterion: 'h1 criterion', collects: ['a-concept'], resolution: { outcome: 'h1-outcome', referral: { action: 'refer', recipient: 'a-queue' } } }],
  };
}

const FAKE_CONNECTION = {} as unknown as DatabaseConnection;

function baseDependencies(overrides: Partial<SimulationDependencies> = {}): SimulationDependencies {
  return {
    connection: FAKE_CONNECTION,
    evaluator: new FakeHypothesisEvaluator(),
    consolidator: new FakeAssessmentConsolidator(),
    poolSize: 3,
    defaultConsolidationRegister: 'plain',
    ...overrides,
  };
}

function baseCall(overrides: Partial<SimulationCall> = {}): SimulationCall {
  return {
    subjectType: 'a-subject-type',
    subjectAttributes: [{ attribute: 'an-attribute', value: 'a-value' } satisfies SubjectAttributeValue],
    case: aCase(),
    requester: 'a-requester',
    now: 1_000,
    deadline: 21_000,
    ...overrides,
  };
}

type WiredPipelineCall = {
  readonly capabilities: unknown;
  readonly observationSource: unknown;
  readonly evaluator: unknown;
  readonly consolidator: unknown;
  readonly poolSize: unknown;
  readonly defaultConsolidationRegister: unknown;
  readonly subjectType: unknown;
  readonly subjectAttributes: unknown;
  readonly case: unknown;
  readonly requester: unknown;
  readonly now: unknown;
  readonly deadline: unknown;
};

beforeEach(() => {
  runInvestigationPipelineMock.mockClear();
  createCapabilityQueryMock.mockClear();
  createConnectorConfigurationRegistryMock.mockClear();
  httpDeclarativeObservationSourceMock.mockClear();
  capturedPipelineCalls.length = 0;
  producedPipelineResults.length = 0;
});

it('builds capabilities and the connector-configuration registry from the given connection, and constructs its own observation source from exactly those two', () => {
  const dependencies = baseDependencies();

  createSimulationRunner(dependencies);

  expect(createCapabilityQueryMock).toHaveBeenCalledWith(dependencies.connection);
  expect(createConnectorConfigurationRegistryMock).toHaveBeenCalledWith(dependencies.connection);
  expect(httpDeclarativeObservationSourceMock).toHaveBeenCalledWith({
    capabilities: createCapabilityQueryMock.mock.results[0]?.value,
    connectorConfigurations: createConnectorConfigurationRegistryMock.mock.results[0]?.value,
  });
});

it('wires runInvestigationPipeline with the freshly constructed capabilities and observation source, and the caller-given evaluator, consolidator, poolSize and defaultConsolidationRegister, unchanged', async () => {
  const dependencies = baseDependencies();
  const runner = createSimulationRunner(dependencies);

  await runner(baseCall());

  expect(capturedPipelineCalls).toHaveLength(1);
  const wired = capturedPipelineCalls[0] as WiredPipelineCall;
  expect(wired.capabilities).toBe(createCapabilityQueryMock.mock.results[0]?.value);
  expect(wired.observationSource).toBe(httpDeclarativeObservationSourceMock.mock.instances[0]);
  expect(wired.evaluator).toBe(dependencies.evaluator);
  expect(wired.consolidator).toBe(dependencies.consolidator);
  expect(wired.poolSize).toBe(dependencies.poolSize);
  expect(wired.defaultConsolidationRegister).toBe(dependencies.defaultConsolidationRegister);
});

it("passes the call's own subjectType, subjectAttributes, case, requester, now and deadline through to runInvestigationPipeline unchanged", async () => {
  const call = baseCall();
  const runner = createSimulationRunner(baseDependencies());

  await runner(call);

  expect(capturedPipelineCalls).toHaveLength(1);
  const wired = capturedPipelineCalls[0] as WiredPipelineCall;
  expect(wired.subjectType).toBe(call.subjectType);
  expect(wired.subjectAttributes).toBe(call.subjectAttributes);
  expect(wired.case).toBe(call.case);
  expect(wired.requester).toBe(call.requester);
  expect(wired.now).toBe(call.now);
  expect(wired.deadline).toBe(call.deadline);
});

it('answers exactly what runInvestigationPipeline resolved with, the whole record unchanged', async () => {
  const runner = createSimulationRunner(baseDependencies());

  const result = await runner(baseCall());

  expect(producedPipelineResults).toHaveLength(1);
  expect(result).toBe(producedPipelineResults[0]);
});

const MODULE_PATH = fileURLToPath(new URL('../../../factories/simulate.factory.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

const FORBIDDEN_PRODUCTION_BASENAMES = ['diagnose.factory.js', 'production-diagnose.factory.js', 'run-diagnosis.js'];

async function simulateFactoryImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

function basenameOf(specifier: string): string {
  return specifier.split('/').pop() ?? specifier;
}

it('imports nothing from diagnose.factory.ts, production-diagnose.factory.ts or run-diagnosis.ts, so no branch inside the production composition or its own write step is reachable from here', async () => {
  const specifiers = await simulateFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_PRODUCTION_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});

it('constructs capabilities, the connector-configuration registry and its own observation source exactly once when the runner is created, before the returned runner is ever invoked', () => {
  createSimulationRunner(baseDependencies());

  expect(createCapabilityQueryMock).toHaveBeenCalledTimes(1);
  expect(createConnectorConfigurationRegistryMock).toHaveBeenCalledTimes(1);
  expect(httpDeclarativeObservationSourceMock).toHaveBeenCalledTimes(1);
});

it('never reconstructs capabilities, the connector-configuration registry or its own observation source on either of two calls to the returned runner', async () => {
  const runner = createSimulationRunner(baseDependencies());

  await runner(baseCall());
  await runner(baseCall());

  expect(createCapabilityQueryMock).toHaveBeenCalledTimes(1);
  expect(createConnectorConfigurationRegistryMock).toHaveBeenCalledTimes(1);
  expect(httpDeclarativeObservationSourceMock).toHaveBeenCalledTimes(1);
});

it('passes the very same capabilities and observation-source instances into both of two calls to runInvestigationPipeline', async () => {
  const runner = createSimulationRunner(baseDependencies());

  await runner(baseCall());
  await runner(baseCall());

  expect(capturedPipelineCalls).toHaveLength(2);
  const [first, second] = capturedPipelineCalls as [WiredPipelineCall, WiredPipelineCall];
  expect(second.capabilities).toBe(first.capabilities);
  expect(second.observationSource).toBe(first.observationSource);
});

it("constructs a fresh capabilities instance for a second call to the outer factory, never reusing the first call's own instance", () => {
  createSimulationRunner(baseDependencies());
  createSimulationRunner(baseDependencies());

  expect(createCapabilityQueryMock).toHaveBeenCalledTimes(2);
  const [firstCapabilities, secondCapabilities] = createCapabilityQueryMock.mock.results.map((entry) => entry.value);
  expect(secondCapabilities).not.toBe(firstCapabilities);
});

it('SimulationDependencies carries exactly connection, evaluator, consolidator, poolSize and defaultConsolidationRegister — no observation-source parameter of its own', () => {
  expectTypeOf<SimulationDependencies>().toEqualTypeOf<{
    readonly connection: DatabaseConnection;
    readonly evaluator: IHypothesisEvaluator;
    readonly consolidator: IAssessmentConsolidator;
    readonly poolSize: number;
    readonly defaultConsolidationRegister: ConsolidationRegister;
  }>();
});

it('refuses a SimulationDependencies literal that also supplies an externally-built observation source', () => {
  const invalid: SimulationDependencies = {
    connection: FAKE_CONNECTION,
    evaluator: new FakeHypothesisEvaluator(),
    consolidator: new FakeAssessmentConsolidator(),
    poolSize: 3,
    defaultConsolidationRegister: 'plain',
    // @ts-expect-error — SimulationDependencies exposes no observationSource field; createSimulationRunner

    observationSource: new UnusedObservationSource(),
  };
  void invalid;
});

it('SimulationCall carries exactly subjectType, subjectAttributes, case, requester, now and deadline — no narrative, ticket_ref, id, prompt_version, model, glossary or store field', () => {
  expectTypeOf<SimulationCall>().toEqualTypeOf<{
    readonly subjectType: string;
    readonly subjectAttributes: readonly SubjectAttributeValue[];
    readonly case: Case;
    readonly requester: string;
    readonly now: number;
    readonly deadline: number;
  }>();
});

it('refuses a SimulationCall literal that also supplies a narrative', () => {
  const invalid: SimulationCall = {
    subjectType: 'a-subject-type',
    subjectAttributes: [{ attribute: 'an-attribute', value: 'a-value' } satisfies SubjectAttributeValue],
    case: aCase(),
    requester: 'a-requester',
    now: 1_000,
    deadline: 21_000,
    // @ts-expect-error — SimulationCall carries no narrative field: contracts/investigation/case-simulation's

    narrative: 'a narrative',
  };
  void invalid;
});

it("propagates a rejection from runInvestigationPipeline to the runner's own caller, unchanged", async () => {
  const failure = new Error('a pipeline failure');
  runInvestigationPipelineMock.mockImplementationOnce(() => Promise.reject(failure));
  const runner = createSimulationRunner(baseDependencies());

  await expect(runner(baseCall())).rejects.toBe(failure);
});

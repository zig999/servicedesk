// Proof for task/case-simulation-pipeline/no-cache-simulation-composition.
//
// diagnose.factory.ts, the sibling this factory is written to mirror, carries no spec file of its
// own to read a convention from. The closest established analog for a composition-root wiring
// factory in this tree is production-diagnose.factory.spec.ts (unit): it isolates its own
// composition logic from "the already-delivered pipeline it wires" by mocking that pipeline's own
// entry point as "the boundary this factory composes against" (TST-03 — a stand-in replaces a
// boundary, never business logic; the pipeline this factory hands off to is a separately delivered,
// separately tested unit, not this factory's own logic). This file follows the identical shape:
// runInvestigationPipeline (investigation-pipeline.ts) is mocked as the boundary
// createSimulationRunner composes against, and capability-registry.factory.ts,
// connector-configuration-registry.factory.ts and the HttpDeclarativeObservationSource adapter are
// each mocked as the store/network boundaries this factory wires without owning.
//
// Criterion 4 — "nothing the composition collects is capable of entering a cache, whether or not a
// cache layer exists elsewhere in the tree" — is a structural guarantee this factory achieves by
// accepting no externally-supplied IObservationSource at all, so there is nothing to inject and
// nothing a runtime test could substitute a cache into. It is proven at the type level instead
// (src/__tests__/unit/types/pagination.spec.ts's own established convention for a fact only
// TypeScript's own checker can falsify): SimulationDependencies is pinned to its exact shape with
// expectTypeOf, and a `@ts-expect-error` literal shows the compiler refuses a dependency object
// that also carries an observationSource field.
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

/** Answers no-data unconditionally — never exercised at runtime, since runInvestigationPipeline is mocked, but a well-typed collaborator so SimulationDependencies compiles. */
class FakeHypothesisEvaluator implements IHypothesisEvaluator {
  public async evaluate(): Promise<EvaluationOutcome> {
    return { verdict: 'inconclusive', reason: 'no-data', citations: [] };
  }
}

/** Answers a fixed write-up unconditionally — never exercised at runtime, for the same reason as FakeHypothesisEvaluator above. */
class FakeAssessmentConsolidator implements IAssessmentConsolidator {
  public async consolidate(): Promise<ConsolidationOutcome> {
    return { text: 'unused-text', usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0, prompt: 'unused-prompt' };
  }
}

/** Answers ok unconditionally — used only in the type-level tests below, to show the compiler refuses it on SimulationDependencies; never constructed by the factory under test. */
class UnusedObservationSource implements IObservationSource {
  public async observeConcept(): Promise<ObservationOutcome> {
    return { result: 'ok', observation: 'unused' };
  }
}

/** A minimally valid, single-hypothesis Case — never read for its content in this file, only carried through as an opaque value. */
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

/** A bare stand-in for DatabaseConnection, never queried in this file since createCapabilityQuery and createConnectorConfigurationRegistry are both mocked — only its own identity matters, to the pass-through test below. */
const FAKE_CONNECTION = {} as unknown as DatabaseConnection;

/** Every field SimulationDependencies declares, all arbitrary except where a test reads one back. */
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

/** Every field SimulationCall declares, all arbitrary — nothing in this file's tests reads their content beyond identity. */
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

/** The fields this suite reads back off whatever was actually passed to the mocked runInvestigationPipeline. */
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

// ------------------------------------------- criterion 1: wires the shared pipeline and its adapters

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

// --------------- criterion 2: a distinct assembly, never a conditional inside the production composition

const MODULE_PATH = fileURLToPath(new URL('../../../factories/simulate.factory.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
/** Exact compiled basenames of the production composition's own modules — matched by the whole final path segment, never a substring. */
const FORBIDDEN_PRODUCTION_BASENAMES = ['diagnose.factory.js', 'production-diagnose.factory.js', 'run-diagnosis.js'];

async function simulateFactoryImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

/** The final path segment of a module specifier, the unit a basename check must compare against, never the whole specifier. */
function basenameOf(specifier: string): string {
  return specifier.split('/').pop() ?? specifier;
}

it('imports nothing from diagnose.factory.ts, production-diagnose.factory.ts or run-diagnosis.ts, so no branch inside the production composition or its own write step is reachable from here', async () => {
  const specifiers = await simulateFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_PRODUCTION_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});

// -------------------------------------------- criterion 3: constructs each adapter once per call

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

// ------------- criterion 4: structurally incapable of entering a cache, since none can be injected

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
    // constructs its own HttpDeclarativeObservationSource internally, so nothing here could ever
    // substitute a caching decorator implementing the same published IObservationSource port.
    observationSource: new UnusedObservationSource(),
  };
  void invalid;
});

// -------------------- inference: SimulationCall carries no persistence-only field of its own

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
    // own "neither operation carries a narrative or a ticket reference."
    narrative: 'a narrative',
  };
  void invalid;
});

// ---------------------------------------------- edge case: the wired pipeline call rejects

it("propagates a rejection from runInvestigationPipeline to the runner's own caller, unchanged", async () => {
  const failure = new Error('a pipeline failure');
  runInvestigationPipelineMock.mockImplementationOnce(() => Promise.reject(failure));
  const runner = createSimulationRunner(baseDependencies());

  await expect(runner(baseCall())).rejects.toBe(failure);
});

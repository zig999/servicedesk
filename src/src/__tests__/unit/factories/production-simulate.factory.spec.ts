// Proof for task/case-simulation-pipeline/simulate-case-operation: the composition logic of
// createProductionSimulationRunner itself, isolated from the already-delivered, already-proven
// no-cache composition it wires by mocking createSimulationRunner (../../../factories/simulate.factory.js)
// — the boundary this factory composes against — the identical shape
// production-diagnose.factory.spec.ts already establishes for its own sibling factory.
// @anthropic-ai/sdk is mocked too, since both Anthropic-backed adapters this factory always
// constructs would otherwise call the real SDK's own constructor, which throws synchronously with
// no credential in this environment.
//
// This task's own Notes carry an UNDERDETERMINED entry: a simulate-case implementation whose
// collection stage reused diagnose's own cache would satisfy every other criterion. The import-scan
// test below is this factory's own share of excluding it — production-simulate.factory.ts imports
// nothing resembling a cache, an observation source, or diagnose's own write path — alongside
// simulate.factory.spec.ts's own already-delivered, already-proven structural guarantee (criterion 4
// there) that createSimulationRunner itself accepts no externally-supplied observation source at
// all, so nothing this factory could pass into it could ever be a cache.
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';

const { anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'unused' }] });
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { anthropicConstructorMock, createMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

const { createSimulationRunnerMock, capturedRunnerCalls } = vi.hoisted(() => {
  const capturedRunnerCalls: unknown[] = [];
  const createSimulationRunnerMock = vi.fn().mockImplementation(() => (call: unknown) => {
    capturedRunnerCalls.push(call);
    return Promise.resolve({
      evidence: [],
      evaluations: [],
      resolved: { outcome: 'unused-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
      assessment: { outcome: 'unused-outcome', referral: { action: 'refer', recipient: 'a-queue' }, text: 'unused-text' },
      cost: { calls: 1, input_tokens: 10, output_tokens: 20 },
      durations: { collection: 1, judgment: 2, writing: 3, total: 6 },
      prompts: { writing: 'unused-writing-prompt' },
    });
  });
  return { createSimulationRunnerMock, capturedRunnerCalls };
});
vi.mock('../../../factories/simulate.factory.js', () => ({ createSimulationRunner: createSimulationRunnerMock }));

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Case } from '../../../case/case.js';
import {
  createProductionSimulationRunner,
  type ProductionSimulationCall,
  type ProductionSimulationDependencies,
} from '../../../factories/production-simulate.factory.js';
import type { ConsolidationRegister } from '../../../investigation/consolidation-register.js';
import { AnthropicAssessmentConsolidator } from '../../../investigation/anthropic-assessment-consolidator.adapter.js';
import { AnthropicHypothesisEvaluator } from '../../../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';

/** The specification's own declared total deadline budget, restated here as the value this suite expects the factory to compute — never read from the factory's own source, so a change to the constant there is exactly what would fail this suite. */
const EXPECTED_DEADLINE_BUDGET_MS = 20_000;

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

/** A bare stand-in for DatabaseConnection, never queried in this file since createSimulationRunner is mocked — only its own identity matters, to the pass-through test below. */
const FAKE_CONNECTION = {} as unknown as DatabaseConnection;

/** Every field ProductionSimulationDependencies declares, all arbitrary except where a test reads one back. */
function baseDependencies(overrides: Partial<ProductionSimulationDependencies> = {}): ProductionSimulationDependencies {
  return {
    connection: FAKE_CONNECTION,
    poolSize: 3,
    defaultConsolidationRegister: 'plain',
    evaluatorModel: 'an-evaluator-model',
    consolidatorModel: 'a-consolidator-model',
    consolidatorMaxTokens: 256,
    ...overrides,
  };
}

/** Every field ProductionSimulationCall declares, all arbitrary — nothing in this file's tests reads their content. */
function baseCall(): ProductionSimulationCall {
  return {
    subjectType: 'a-subject-type',
    subjectAttributes: [{ attribute: 'an-attribute', value: 'a-value' } satisfies SubjectAttributeValue],
    case: aCase(),
    requester: 'a-requester',
  };
}

const ORIGINAL_ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

beforeEach(() => {
  anthropicConstructorMock.mockClear();
  createSimulationRunnerMock.mockClear();
  capturedRunnerCalls.length = 0;
});

afterEach(() => {
  vi.useRealTimers();
  if (ORIGINAL_ANTHROPIC_API_KEY === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = ORIGINAL_ANTHROPIC_API_KEY;
  }
});

type WiredPassThroughFields = {
  readonly poolSize: number;
  readonly defaultConsolidationRegister: string;
  readonly connection: DatabaseConnection;
};

// ------------------------------------------------------- pass-through wiring

it('passes the caller-given connection, pool size and default consolidation register through to createSimulationRunner, unchanged', () => {
  const dependencies = baseDependencies();

  createProductionSimulationRunner(dependencies);

  expect(createSimulationRunnerMock).toHaveBeenCalledTimes(1);
  const wired = createSimulationRunnerMock.mock.calls[0]?.[0] as WiredPassThroughFields;
  expect(wired.connection).toBe(dependencies.connection);
  expect(wired.poolSize).toBe(dependencies.poolSize);
  expect(wired.defaultConsolidationRegister).toBe(dependencies.defaultConsolidationRegister);
});

it('always wires a real AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator, never a caller-substituted implementation', () => {
  createProductionSimulationRunner(baseDependencies());

  const wired = createSimulationRunnerMock.mock.calls[0]?.[0] as { evaluator: unknown; consolidator: unknown };
  expect(wired.evaluator).toBeInstanceOf(AnthropicHypothesisEvaluator);
  expect(wired.consolidator).toBeInstanceOf(AnthropicAssessmentConsolidator);
});

// --------------------------- the (now, deadline) pair reaching the wired runner

it('computes the deadline as its own start instant plus the specification-declared twenty-second budget, and propagates that exact pair to the wired runner', async () => {
  const runner = createProductionSimulationRunner(baseDependencies());
  const before = Date.now();

  await runner(baseCall());
  const after = Date.now();

  expect(capturedRunnerCalls).toHaveLength(1);
  const { now, deadline } = capturedRunnerCalls[0] as { now: number; deadline: number };
  expect(now).toBeGreaterThanOrEqual(before);
  expect(now).toBeLessThanOrEqual(after);
  expect(deadline).toBe(now + EXPECTED_DEADLINE_BUDGET_MS);
});

it("stamps a fresh (now, deadline) pair on a second call, never the first call's own pair", async () => {
  const runner = createProductionSimulationRunner(baseDependencies());

  await runner(baseCall());
  const before = Date.now();
  await runner(baseCall());
  const after = Date.now();

  expect(capturedRunnerCalls).toHaveLength(2);
  const { now: secondNow, deadline: secondDeadline } = capturedRunnerCalls[1] as { now: number; deadline: number };
  expect(secondNow).toBeGreaterThanOrEqual(before);
  expect(secondNow).toBeLessThanOrEqual(after);
  expect(secondDeadline).toBe(secondNow + EXPECTED_DEADLINE_BUDGET_MS);
});

// --------------------------------------- adapters built once, not once per call

it('constructs the Anthropic client once when the runner is created, never again on either of two later calls', async () => {
  const runner = createProductionSimulationRunner(baseDependencies());
  const countAfterCreation = anthropicConstructorMock.mock.calls.length;

  await runner(baseCall());
  await runner(baseCall());

  expect(countAfterCreation).toBeGreaterThanOrEqual(2); // one evaluator, one consolidator
  expect(anthropicConstructorMock.mock.calls.length).toBe(countAfterCreation);
});

// --------------------------------- no apiKey parameter, credential from environment

it('constructs both Anthropic-backed adapters with the credential resolved from the environment alone, since ProductionSimulationDependencies exposes no apiKey field of its own', () => {
  process.env.ANTHROPIC_API_KEY = 'an-env-test-key';

  createProductionSimulationRunner(baseDependencies());

  expect(anthropicConstructorMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  for (const call of anthropicConstructorMock.mock.calls) {
    expect(call[0]).toEqual({ apiKey: 'an-env-test-key' });
  }
});

// ---------- rules/investigation/a-simulation-writes-no-investigation, scenarios/investigation/a-simulation-never-enters-the-cache

const MODULE_PATH = fileURLToPath(new URL('../../../factories/production-simulate.factory.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
/** Exact compiled basenames of the write-capable production composition's own modules — matched by the whole final path segment, never a substring, so this never flags the legitimate simulate.factory.js this file imports for real. */
const FORBIDDEN_WRITE_PATH_BASENAMES = ['diagnose.factory.js', 'production-diagnose.factory.js', 'run-diagnosis.js', 'investigation-factory.js'];
/** Nothing resembling a caching layer or an externally-supplied observation source exists anywhere in this tree today (simulate.factory.ts's own header comment); this scan is this factory's own share of the same structural guarantee — a future cache module would have to be imported by name to reach this file, and this asserts none is. */
const FORBIDDEN_CACHE_LIKE_BASENAMES = ['cache.js', 'caching-observation-source.adapter.js', 'observation-cache.js'];

async function productionSimulateFactoryImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

/** The final path segment of a module specifier — the unit a basename check must compare against, never the whole specifier. */
function basenameOf(specifier: string): string {
  return specifier.split('/').pop() ?? specifier;
}

it('imports nothing from diagnose.factory.ts, production-diagnose.factory.ts, run-diagnosis.ts or investigation-factory.ts, so no branch of diagnose\'s own write path is reachable from here', async () => {
  const specifiers = await productionSimulateFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_WRITE_PATH_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});

it('imports no module resembling a cache or a caching observation-source decorator', async () => {
  const specifiers = await productionSimulateFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_CACHE_LIKE_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});

it('imports HttpDeclarativeObservationSource nowhere: the observation source this run collects through is exactly simulate.factory.ts\'s own freshly constructed, cache-free instance, never one this factory builds or supplies itself', async () => {
  const specifiers = await productionSimulateFactoryImports();

  const observationSourceImports = specifiers.filter((specifier) => basenameOf(specifier).includes('observation-source'));
  expect(observationSourceImports).toEqual([]);
});

// ----------------------- type-level: no observation-source or write-capable field could ever be passed

it('ProductionSimulationDependencies carries exactly connection, poolSize, defaultConsolidationRegister, evaluatorModel, evaluatorMaxTokens, consolidatorModel and consolidatorMaxTokens — no observation-source field of its own', () => {
  expectTypeOf<ProductionSimulationDependencies>().toEqualTypeOf<{
    readonly connection: DatabaseConnection;
    readonly poolSize: number;
    readonly defaultConsolidationRegister: ConsolidationRegister;
    readonly evaluatorModel: string;
    readonly evaluatorMaxTokens?: number;
    readonly consolidatorModel: string;
    readonly consolidatorMaxTokens: number;
  }>();
});

it('ProductionSimulationCall carries exactly subjectType, subjectAttributes, case and requester — no now, deadline, narrative, ticket_ref, id, prompt_version, model, glossary or store field', () => {
  expectTypeOf<ProductionSimulationCall>().toEqualTypeOf<{
    readonly subjectType: string;
    readonly subjectAttributes: readonly SubjectAttributeValue[];
    readonly case: Case;
    readonly requester: string;
  }>();
});

// ---------------------------------------------- edge case: the wired runner rejects

it("propagates a rejection from the wired runner to this factory's own caller, unchanged", async () => {
  const failure = new Error('a pipeline failure');
  createSimulationRunnerMock.mockImplementationOnce(() => () => Promise.reject(failure));
  const runner = createProductionSimulationRunner(baseDependencies());

  await expect(runner(baseCall())).rejects.toBe(failure);
});

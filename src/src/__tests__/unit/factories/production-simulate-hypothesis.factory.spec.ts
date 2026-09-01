import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from 'vitest';

const { anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'unused' }] });
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { anthropicConstructorMock, createMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

const { runSimulateHypothesisPipelineMock, capturedPipelineCalls } = vi.hoisted(() => {
  const capturedPipelineCalls: unknown[] = [];
  const runSimulateHypothesisPipelineMock = vi.fn().mockImplementation((call: unknown) => {
    capturedPipelineCalls.push(call);
    return Promise.resolve({
      evidence: [],
      evaluation: { hypothesis: 'unused-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [] },
      durations: { collection: 0, judgment: 0, total: 0 },
    });
  });
  return { runSimulateHypothesisPipelineMock, capturedPipelineCalls };
});
vi.mock('../../../investigation/simulate-hypothesis-pipeline.js', () => ({ runSimulateHypothesisPipeline: runSimulateHypothesisPipelineMock }));

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Case } from '../../../case/case.js';
import {
  createProductionHypothesisSimulationRunner,
  type ProductionHypothesisSimulationCall,
  type ProductionHypothesisSimulationDependencies,
} from '../../../factories/production-simulate-hypothesis.factory.js';
import { AnthropicHypothesisEvaluator } from '../../../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';

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

function baseDependencies(overrides: Partial<ProductionHypothesisSimulationDependencies> = {}): ProductionHypothesisSimulationDependencies {
  return {
    connection: FAKE_CONNECTION,
    poolSize: 3,
    evaluatorModel: 'an-evaluator-model',
    ...overrides,
  };
}

function baseCall(overrides: Partial<ProductionHypothesisSimulationCall> = {}): ProductionHypothesisSimulationCall {
  return {
    subjectType: 'a-subject-type',
    subjectAttributes: [{ attribute: 'an-attribute', value: 'a-value' } satisfies SubjectAttributeValue],
    case: aCase(),
    requester: 'a-requester',
    hypothesis: 'h1',
    now: 1_000,
    deadline: 21_000,
    ...overrides,
  };
}

const ORIGINAL_ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

beforeEach(() => {
  anthropicConstructorMock.mockClear();
  runSimulateHypothesisPipelineMock.mockClear();
  capturedPipelineCalls.length = 0;
});

afterEach(() => {
  if (ORIGINAL_ANTHROPIC_API_KEY === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = ORIGINAL_ANTHROPIC_API_KEY;
  }
});

it('passes the caller-given poolSize through to runSimulateHypothesisPipeline, unchanged', async () => {
  const dependencies = baseDependencies({ poolSize: 7 });
  const runner = createProductionHypothesisSimulationRunner(dependencies);

  await runner(baseCall());

  expect(runSimulateHypothesisPipelineMock).toHaveBeenCalledTimes(1);
  const wired = capturedPipelineCalls[0] as { poolSize: number };
  expect(wired.poolSize).toBe(7);
});

it('always wires a real AnthropicHypothesisEvaluator, never a caller-substituted implementation', async () => {
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());

  await runner(baseCall());

  const wired = capturedPipelineCalls[0] as { evaluator: unknown };
  expect(wired.evaluator).toBeInstanceOf(AnthropicHypothesisEvaluator);
});

it('passes the caller-given now and deadline through to runSimulateHypothesisPipeline unchanged, never computing either itself', async () => {
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());

  await runner(baseCall({ now: 5_000, deadline: 45_000 }));

  expect(capturedPipelineCalls).toHaveLength(1);
  const wired = capturedPipelineCalls[0] as { now: number; deadline: number };
  expect(wired.now).toBe(5_000);
  expect(wired.deadline).toBe(45_000);
});

it("propagates whatever (now, deadline) pair each call supplies, never reusing the first call's own pair for a second call carrying different values", async () => {
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());

  await runner(baseCall({ now: 1_000, deadline: 21_000 }));
  await runner(baseCall({ now: 9_000, deadline: 12_000 }));

  expect(capturedPipelineCalls).toHaveLength(2);
  const [first, second] = capturedPipelineCalls as [{ now: number; deadline: number }, { now: number; deadline: number }];
  expect(first).toMatchObject({ now: 1_000, deadline: 21_000 });
  expect(second).toMatchObject({ now: 9_000, deadline: 12_000 });
});

it('constructs the Anthropic client once when the runner is created, never again on either of two later calls', async () => {
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());
  const countAfterCreation = anthropicConstructorMock.mock.calls.length;

  await runner(baseCall());
  await runner(baseCall());

  expect(countAfterCreation).toBeGreaterThanOrEqual(1);
  expect(anthropicConstructorMock.mock.calls.length).toBe(countAfterCreation);
});

it('constructs the Anthropic-backed evaluator with the credential resolved from the environment alone, since ProductionHypothesisSimulationDependencies exposes no apiKey field of its own', () => {
  process.env.ANTHROPIC_API_KEY = 'an-env-test-key';

  createProductionHypothesisSimulationRunner(baseDependencies());

  expect(anthropicConstructorMock.mock.calls.length).toBeGreaterThanOrEqual(1);
  expect(anthropicConstructorMock.mock.calls[0]?.[0]).toEqual({ apiKey: 'an-env-test-key' });
});

const MODULE_PATH = fileURLToPath(new URL('../../../factories/production-simulate-hypothesis.factory.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

const FORBIDDEN_WRITE_PATH_BASENAMES = ['diagnose.factory.js', 'production-diagnose.factory.js', 'run-diagnosis.js', 'investigation-factory.js', 'production-simulate.factory.js', 'simulate.factory.js'];

const FORBIDDEN_CACHE_LIKE_BASENAMES = ['cache.js', 'caching-observation-source.adapter.js', 'observation-cache.js'];

async function productionSimulateHypothesisFactoryImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1] ?? '');
}

function basenameOf(specifier: string): string {
  return specifier.split('/').pop() ?? specifier;
}

it("imports nothing from diagnose.factory.ts, production-diagnose.factory.ts, run-diagnosis.ts, investigation-factory.ts, production-simulate.factory.ts or simulate.factory.ts, so no branch of diagnose's or simulate-case's own composition is reachable from here", async () => {
  const specifiers = await productionSimulateHypothesisFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_WRITE_PATH_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});

it('imports no module resembling a cache or a caching observation-source decorator', async () => {
  const specifiers = await productionSimulateHypothesisFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_CACHE_LIKE_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});

it('declares no TOTAL_DEADLINE_BUDGET_MS constant of its own, unlike production-simulate.factory.ts and production-diagnose.factory.ts', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(source).not.toMatch(/TOTAL_DEADLINE_BUDGET_MS/);
});

it('ProductionHypothesisSimulationDependencies carries exactly connection, poolSize, evaluatorModel and evaluatorMaxTokens — no observationSource, consolidator or store field of its own', () => {
  expectTypeOf<ProductionHypothesisSimulationDependencies>().toEqualTypeOf<{
    readonly connection: DatabaseConnection;
    readonly poolSize: number;
    readonly evaluatorModel: string;
    readonly evaluatorMaxTokens?: number;
  }>();
});

it('ProductionHypothesisSimulationCall carries exactly subjectType, subjectAttributes, case, requester, hypothesis, now and deadline — no capabilities, glossary, observationSource, evaluator or poolSize field', () => {
  expectTypeOf<ProductionHypothesisSimulationCall>().toEqualTypeOf<{
    readonly subjectType: string;
    readonly subjectAttributes: readonly SubjectAttributeValue[];
    readonly case: Case;
    readonly requester: string;
    readonly hypothesis: string;
    readonly now: number;
    readonly deadline: number;
  }>();
});

it("propagates a rejection from the wired pipeline call to this factory's own caller, unchanged", async () => {
  const failure = new Error('a pipeline failure');
  runSimulateHypothesisPipelineMock.mockImplementationOnce(() => Promise.reject(failure));
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());

  await expect(runner(baseCall())).rejects.toBe(failure);
});

// Proof for task/case-simulation-pipeline/simulate-hypothesis-operation: the composition logic of
// createProductionHypothesisSimulationRunner itself, isolated from
// simulate-hypothesis-pipeline.ts's own already-proven narrower pipeline (proven separately at
// __tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts) by mocking
// runSimulateHypothesisPipeline — the boundary this factory composes against — the identical shape
// production-simulate.factory.spec.ts already establishes for its own sibling factory.
// @anthropic-ai/sdk is mocked too, since the Anthropic-backed evaluator this factory always
// constructs would otherwise call the real SDK's own constructor, which throws synchronously with
// no credential in this environment.
//
// The import-scan tests below are this factory's own share of excluding a simulate-case
// implementation whose collection stage reused diagnose's own cache or write path — the same
// structural guarantee production-simulate.factory.spec.ts's own header comment already establishes
// for its sibling, narrowed here to this file's own imports (rules/investigation/a-simulation-writes-no-investigation,
// scenarios/investigation/a-simulation-never-enters-the-cache). Unlike production-simulate.factory.ts,
// this factory does construct its own HttpDeclarativeObservationSource internally (it has no shared
// no-cache composition to delegate to) — so the guarantee that nothing a caller supplies could ever
// be a cache is proven instead by the type-level test below: ProductionHypothesisSimulationDependencies
// declares no observationSource field of its own for a caller to substitute.
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

/** A bare stand-in for DatabaseConnection, never queried in this file since createCapabilityQuery/createConnectorConfigurationRegistry construct their own store objects without touching it eagerly, and runSimulateHypothesisPipeline is mocked. */
const FAKE_CONNECTION = {} as unknown as DatabaseConnection;

/** Every field ProductionHypothesisSimulationDependencies declares, all arbitrary except where a test reads one back. */
function baseDependencies(overrides: Partial<ProductionHypothesisSimulationDependencies> = {}): ProductionHypothesisSimulationDependencies {
  return {
    connection: FAKE_CONNECTION,
    poolSize: 3,
    evaluatorModel: 'an-evaluator-model',
    ...overrides,
  };
}

/** Every field ProductionHypothesisSimulationCall declares, all arbitrary — nothing in this file's tests reads their content. */
function baseCall(): ProductionHypothesisSimulationCall {
  return {
    subjectType: 'a-subject-type',
    subjectAttributes: [{ attribute: 'an-attribute', value: 'a-value' } satisfies SubjectAttributeValue],
    case: aCase(),
    requester: 'a-requester',
    hypothesis: 'h1',
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

// ------------------------------------------------------- pass-through wiring

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

// --------------------------- the (now, deadline) pair reaching the wired call

it('computes the deadline as its own start instant plus the specification-declared twenty-second budget, and propagates that exact pair to the wired call', async () => {
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());
  const before = Date.now();

  await runner(baseCall());
  const after = Date.now();

  expect(capturedPipelineCalls).toHaveLength(1);
  const { now, deadline } = capturedPipelineCalls[0] as { now: number; deadline: number };
  expect(now).toBeGreaterThanOrEqual(before);
  expect(now).toBeLessThanOrEqual(after);
  expect(deadline).toBe(now + EXPECTED_DEADLINE_BUDGET_MS);
});

it("stamps a fresh (now, deadline) pair on a second call, never the first call's own pair", async () => {
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());

  await runner(baseCall());
  const before = Date.now();
  await runner(baseCall());
  const after = Date.now();

  expect(capturedPipelineCalls).toHaveLength(2);
  const { now: secondNow, deadline: secondDeadline } = capturedPipelineCalls[1] as { now: number; deadline: number };
  expect(secondNow).toBeGreaterThanOrEqual(before);
  expect(secondNow).toBeLessThanOrEqual(after);
  expect(secondDeadline).toBe(secondNow + EXPECTED_DEADLINE_BUDGET_MS);
});

// --------------------------------------- adapter built once, not once per call

it('constructs the Anthropic client once when the runner is created, never again on either of two later calls', async () => {
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());
  const countAfterCreation = anthropicConstructorMock.mock.calls.length;

  await runner(baseCall());
  await runner(baseCall());

  expect(countAfterCreation).toBeGreaterThanOrEqual(1);
  expect(anthropicConstructorMock.mock.calls.length).toBe(countAfterCreation);
});

// ---------------------------------- no apiKey parameter, credential from environment

it('constructs the Anthropic-backed evaluator with the credential resolved from the environment alone, since ProductionHypothesisSimulationDependencies exposes no apiKey field of its own', () => {
  process.env.ANTHROPIC_API_KEY = 'an-env-test-key';

  createProductionHypothesisSimulationRunner(baseDependencies());

  expect(anthropicConstructorMock.mock.calls.length).toBeGreaterThanOrEqual(1);
  expect(anthropicConstructorMock.mock.calls[0]?.[0]).toEqual({ apiKey: 'an-env-test-key' });
});

// ---------- rules/investigation/a-simulation-writes-no-investigation, scenarios/investigation/a-simulation-never-enters-the-cache

const MODULE_PATH = fileURLToPath(new URL('../../../factories/production-simulate-hypothesis.factory.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
/** Exact compiled basenames of the write-capable production composition's own modules — matched by the whole final path segment, never a substring. */
const FORBIDDEN_WRITE_PATH_BASENAMES = ['diagnose.factory.js', 'production-diagnose.factory.js', 'run-diagnosis.js', 'investigation-factory.js', 'production-simulate.factory.js', 'simulate.factory.js'];
/** Nothing resembling a caching layer exists anywhere in this tree today (production-simulate.factory.spec.ts's own header comment); this scan is this factory's own share of the same structural guarantee. */
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

// ----------------------- type-level: no field a caller could ever substitute a cache or a store through

it('ProductionHypothesisSimulationDependencies carries exactly connection, poolSize, evaluatorModel and evaluatorMaxTokens — no observationSource, consolidator or store field of its own', () => {
  expectTypeOf<ProductionHypothesisSimulationDependencies>().toEqualTypeOf<{
    readonly connection: DatabaseConnection;
    readonly poolSize: number;
    readonly evaluatorModel: string;
    readonly evaluatorMaxTokens?: number;
  }>();
});

it('ProductionHypothesisSimulationCall carries exactly subjectType, subjectAttributes, case, requester and hypothesis — no now, deadline, capabilities, observationSource, evaluator or poolSize field', () => {
  expectTypeOf<ProductionHypothesisSimulationCall>().toEqualTypeOf<{
    readonly subjectType: string;
    readonly subjectAttributes: readonly SubjectAttributeValue[];
    readonly case: Case;
    readonly requester: string;
    readonly hypothesis: string;
  }>();
});

// ---------------------------------------------- edge case: the wired pipeline call rejects

it("propagates a rejection from the wired pipeline call to this factory's own caller, unchanged", async () => {
  const failure = new Error('a pipeline failure');
  runSimulateHypothesisPipelineMock.mockImplementationOnce(() => Promise.reject(failure));
  const runner = createProductionHypothesisSimulationRunner(baseDependencies());

  await expect(runner(baseCall())).rejects.toBe(failure);
});

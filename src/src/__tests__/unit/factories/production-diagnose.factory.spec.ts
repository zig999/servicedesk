import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'unused' }] });
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { anthropicConstructorMock, createMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

const { createDiagnoseRunnerMock, capturedRunnerCalls } = vi.hoisted(() => {
  const capturedRunnerCalls: unknown[] = [];
  const createDiagnoseRunnerMock = vi.fn().mockImplementation(() => (call: unknown) => {
    capturedRunnerCalls.push(call);
    return Promise.resolve({ outcome: 'unused-outcome', referral: { action: 'refer', recipient: 'a-queue' }, text: 'unused-text' });
  });
  return { createDiagnoseRunnerMock, capturedRunnerCalls };
});
vi.mock('../../../factories/diagnose.factory.js', () => ({ createDiagnoseRunner: createDiagnoseRunnerMock }));

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { AnthropicAssessmentConsolidator } from '../../../investigation/anthropic-assessment-consolidator.adapter.js';
import { AnthropicHypothesisEvaluator } from '../../../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { Case } from '../../../case/case.js';
import type { IObservationSource, ObservationOutcome } from '../../../investigation/observation-source.port.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import {
  createProductionDiagnoseRunner,
  type ProductionDiagnoseCall,
  type ProductionDiagnoseDependencies,
} from '../../../factories/production-diagnose.factory.js';

const EXPECTED_DEADLINE_BUDGET_MS = 20_000;

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

function baseDependencies(overrides: Partial<ProductionDiagnoseDependencies> = {}): ProductionDiagnoseDependencies {
  return {
    connection: FAKE_CONNECTION,
    observationSource: new UnusedObservationSource(),
    poolSize: 3,
    defaultConsolidationRegister: 'plain',
    evaluatorModel: 'an-evaluator-model',
    consolidatorModel: 'a-consolidator-model',
    consolidatorMaxTokens: 256,
    ...overrides,
  };
}

function baseCall(): ProductionDiagnoseCall {
  return {
    id: 'investigation-1',
    requester: 'a-requester',
    ticket_ref: 'TICKET-1',
    narrative: 'a narrative',
    subjectType: 'a-subject-type',
    subjectAttributes: [{ attribute: 'an-attribute', value: 'a-value' } satisfies SubjectAttributeValue],
    case: aCase(),
    prompt_version: 'a-prompt-version',
    model: 'a-model',
  };
}

const ORIGINAL_ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

beforeEach(() => {
  anthropicConstructorMock.mockClear();
  createDiagnoseRunnerMock.mockClear();
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
  readonly observationSource: IObservationSource;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: string;
  readonly connection: DatabaseConnection;
};

it('passes the caller-given observation source, pool size, connection and default consolidation register through to the wired dependencies, unchanged', () => {
  const dependencies = baseDependencies();

  createProductionDiagnoseRunner(dependencies);

  expect(createDiagnoseRunnerMock).toHaveBeenCalledTimes(1);
  const wired = createDiagnoseRunnerMock.mock.calls[0]?.[0] as WiredPassThroughFields;
  expect(wired.observationSource).toBe(dependencies.observationSource);
  expect(wired.poolSize).toBe(dependencies.poolSize);
  expect(wired.defaultConsolidationRegister).toBe(dependencies.defaultConsolidationRegister);
  expect(wired.connection).toBe(dependencies.connection);
});

it('always wires a real AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator, never a caller-substituted implementation', () => {
  createProductionDiagnoseRunner(baseDependencies());

  const wired = createDiagnoseRunnerMock.mock.calls[0]?.[0] as { evaluator: unknown; consolidator: unknown };
  expect(wired.evaluator).toBeInstanceOf(AnthropicHypothesisEvaluator);
  expect(wired.consolidator).toBeInstanceOf(AnthropicAssessmentConsolidator);
});

it('computes the deadline as its own start instant plus the specification-declared twenty-second budget, and propagates that exact pair to the wired runner', async () => {
  const runner = createProductionDiagnoseRunner(baseDependencies());
  const before = Date.now();

  await runner(baseCall());
  const after = Date.now();

  expect(capturedRunnerCalls).toHaveLength(1);
  const { now, deadline } = capturedRunnerCalls[0] as { now: number; deadline: number };
  expect(now).toBeGreaterThanOrEqual(before);
  expect(now).toBeLessThanOrEqual(after);
  expect(deadline).toBe(now + EXPECTED_DEADLINE_BUDGET_MS);
});

it('stamps a fresh (now, deadline) pair on a second call, never the first call\'s own pair', async () => {
  const runner = createProductionDiagnoseRunner(baseDependencies());

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

it('constructs the Anthropic client once when the runner is created, never again on either of two later calls', async () => {
  const runner = createProductionDiagnoseRunner(baseDependencies());
  const countAfterCreation = anthropicConstructorMock.mock.calls.length;

  await runner(baseCall());
  await runner(baseCall());

  expect(countAfterCreation).toBeGreaterThanOrEqual(2);
  expect(anthropicConstructorMock.mock.calls.length).toBe(countAfterCreation);
});

it('constructs both Anthropic-backed adapters with the credential resolved from the environment alone, since ProductionDiagnoseDependencies exposes no apiKey field of its own', () => {
  process.env.ANTHROPIC_API_KEY = 'an-env-test-key';

  createProductionDiagnoseRunner(baseDependencies());

  expect(anthropicConstructorMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  for (const call of anthropicConstructorMock.mock.calls) {
    expect(call[0]).toEqual({ apiKey: 'an-env-test-key' });
  }
});

const MODULE_PATH = fileURLToPath(new URL('../../../factories/production-diagnose.factory.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

const FORBIDDEN_LEGACY_BASENAMES = [
  'diagnose.js',
  'idempotency-key.js',
  'idempotency-lease-store.js',
  'idempotency-resolution.js',
  'diagnosis-run-registry.js',
  'diagnose-entry-point.factory.js',
];
const FORBIDDEN_DATABASE_MODULES = ['pg', 'mongodb', 'mongoose', 'mysql', 'mysql2', 'sqlite3', 'typeorm', 'prisma', 'knex'];

async function productionDiagnoseFactoryImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

function basenameOf(specifier: string): string {
  return specifier.split('/').pop() ?? specifier;
}

it('imports nothing from diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts or diagnose-entry-point.factory.ts', async () => {
  const specifiers = await productionDiagnoseFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_LEGACY_BASENAMES.includes(basenameOf(specifier)));
  expect(forbidden).toEqual([]);
});

it('imports no database client or driver', async () => {
  const specifiers = await productionDiagnoseFactoryImports();

  const forbidden = specifiers.filter((specifier) => FORBIDDEN_DATABASE_MODULES.includes(specifier));
  expect(forbidden).toEqual([]);
});

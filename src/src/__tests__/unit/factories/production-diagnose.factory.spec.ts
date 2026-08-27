// Proof for task/diagnose-composition-root/wire-diagnose-runner: the
// composition logic of createProductionDiagnoseRunner itself, isolated from
// the already-delivered pipeline it wires by mocking createDiagnoseRunner
// (../../../factories/diagnose.factory.js) — the boundary this factory
// composes against — the same way anthropic-hypothesis-evaluator.adapter.spec.ts
// mocks @anthropic-ai/sdk to observe what crosses its own boundary.
// @anthropic-ai/sdk is mocked too, since both Anthropic-backed adapters this
// factory always constructs would otherwise call the real SDK's own
// constructor, which throws synchronously with no credential in this
// environment. What actually runs the pipeline end to end — the real
// adapters, the real relational store over a real database
// (task/service-on-the-database/store-wiring), the given requester reaching
// a real observation source, two calls writing two independent
// investigations — is production-diagnose.factory.spec.ts under
// __tests__/integration instead.
//
// Sibling fix, disclosed in this task's own proof record: baseDependencies()
// below used to carry three data-directory strings
// (investigationDataDirectory, glossaryDataDirectory,
// capabilityDataDirectory); ProductionDiagnoseDependencies now carries the
// one connection field this task's own cutover wires everywhere, so this
// file passes a bare stand-in DatabaseConnection instead — createDiagnoseRunner
// is mocked in this file, so nothing here ever issues a real query through it.
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

/** The specification's own declared total deadline budget, restated here as the value this suite expects the factory to compute — never read from the factory's own source, so a change to the constant there is exactly what would fail this suite. */
const EXPECTED_DEADLINE_BUDGET_MS = 20_000;

/** Answers ok unconditionally — never exercised in this file, since createDiagnoseRunner itself is mocked, but still a well-typed collaborator so ProductionDiagnoseDependencies compiles. */
class UnusedObservationSource implements IObservationSource {
  public async observeConcept(): Promise<ObservationOutcome> {
    return { result: 'ok', observation: 'unused' };
  }
}

/** A minimally valid, single-hypothesis Case — never read for its content in this file, only carried through as an opaque value; manifest stays empty since nothing here ever reaches collectionPlan/requiresEvaluationOf over it (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation). */
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

/** A bare stand-in for DatabaseConnection, never queried in this file since createDiagnoseRunner is mocked — only its own identity matters, to the pass-through test below. */
const FAKE_CONNECTION = {} as unknown as DatabaseConnection;

/** Every field ProductionDiagnoseDependencies declares, all arbitrary except where a test reads one back. */
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

/** Every field ProductionDiagnoseCall declares, all arbitrary — nothing in this file's tests reads their content. */
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

/** The pass-through fields this suite reads back off whatever was actually passed to the mocked createDiagnoseRunner — a local, narrower view rather than the real DiagnoseDependencies type, since this file never constructs a real evaluator/consolidator pair to satisfy that type fully. */
type WiredPassThroughFields = {
  readonly observationSource: IObservationSource;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: string;
  readonly connection: DatabaseConnection;
};

// ------------------------------------------------------- criterion 1: pass-through wiring

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

// --------------------------- criterion 4: the (now, deadline) pair reaching the wired runner

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

// --------------------------------------- inference: adapters built once, not once per call

it('constructs the Anthropic client once when the runner is created, never again on either of two later calls', async () => {
  const runner = createProductionDiagnoseRunner(baseDependencies());
  const countAfterCreation = anthropicConstructorMock.mock.calls.length;

  await runner(baseCall());
  await runner(baseCall());

  expect(countAfterCreation).toBeGreaterThanOrEqual(2); // one evaluator, one consolidator
  expect(anthropicConstructorMock.mock.calls.length).toBe(countAfterCreation);
});

// --------------------------------- inference: no apiKey parameter, credential from environment

it('constructs both Anthropic-backed adapters with the credential resolved from the environment alone, since ProductionDiagnoseDependencies exposes no apiKey field of its own', () => {
  process.env.ANTHROPIC_API_KEY = 'an-env-test-key';

  createProductionDiagnoseRunner(baseDependencies());

  expect(anthropicConstructorMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  for (const call of anthropicConstructorMock.mock.calls) {
    expect(call[0]).toEqual({ apiKey: 'an-env-test-key' });
  }
});

// ---------------------------------------------- criteria 2 and 6: what this module imports

const MODULE_PATH = fileURLToPath(new URL('../../../factories/production-diagnose.factory.ts', import.meta.url));
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
/** Exact compiled basenames of the six retired modules — matched by the whole final path segment, never a substring, so this never flags the legitimate diagnose.factory.js this file imports for real. */
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

/** The final path segment of a module specifier — 'diagnose.factory.js' from '../factories/diagnose.factory.js' — the unit a basename check must compare against, never the whole specifier. */
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

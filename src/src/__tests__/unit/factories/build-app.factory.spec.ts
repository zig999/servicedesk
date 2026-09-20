import { expect, it } from 'vitest';
import type { ICaseQuery } from '../../../case/case-query.port.js';
import type { Env } from '../../../config/env.js';
import { buildAppDependencies, type BuildAppDependenciesInputs } from '../../../factories/build-app.factory.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { SimulateCaseControllerDependencies } from '../../../http/simulate-case.controller.js';
import type { SimulateHypothesisControllerDependencies } from '../../../http/simulate-hypothesis.controller.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';

const FAKE_CONNECTION = {} as unknown as DatabaseConnection;
const FAKE_CASE_QUERY = {} as unknown as ICaseQuery;
const FAKE_DIAGNOSE = {} as unknown as DiagnoseControllerDependencies;
const FAKE_SIMULATE_CASE = {} as unknown as SimulateCaseControllerDependencies;
const FAKE_SIMULATE_HYPOTHESIS = {} as unknown as SimulateHypothesisControllerDependencies;

function baseEnv(overrides: Partial<Env> = {}): Env {
  return {
    PORT: 3000,
    DATABASE_URL: 'postgres://a-placeholder-connection-url',
    EVALUATOR_MODEL: 'an-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: 256,
    POOL_SIZE: 3,
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
    PAGINATION_DEFAULT_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
    DATABASE_POOL_MAX_CONNECTIONS: 10,
    DATABASE_POOL_IDLE_TIMEOUT_MS: 10_000,
    DATABASE_POOL_STATEMENT_TIMEOUT_MS: 30_000,
    MAX_REQUEST_BODY_BYTES: 1_048_576,
    ...overrides,
  };
}

function baseInputs(overrides: Partial<BuildAppDependenciesInputs> = {}): BuildAppDependenciesInputs {
  return {
    env: baseEnv(),
    connection: FAKE_CONNECTION,
    caseQuery: FAKE_CASE_QUERY,
    diagnose: FAKE_DIAGNOSE,
    simulateCase: FAKE_SIMULATE_CASE,
    simulateHypothesis: FAKE_SIMULATE_HYPOTHESIS,
    ...overrides,
  };
}

it("carries env.MAX_REQUEST_BODY_BYTES through onto the returned dependencies' own bodyLimit field, unchanged", () => {
  const dependencies = buildAppDependencies(baseInputs({ env: baseEnv({ MAX_REQUEST_BODY_BYTES: 2_000_000 }) }));

  expect(dependencies.bodyLimit).toBe(2_000_000);
});

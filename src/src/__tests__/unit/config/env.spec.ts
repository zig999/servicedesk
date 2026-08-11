// Proof for task/http-surface/diagnose-http-endpoint: config/env.ts's own
// loadEnv, over a plain object standing in for process.env — a boundary
// input (STK-08), never process.env itself, so no test here depends on the
// host process's own environment or leaves it mutated for another test.
// Covers this task's own two inferences about env.ts: PORT defaults to 3000
// when unset, and every other declared variable is required, with every
// violation named together rather than only the first one loadEnv reaches.
import { expect, it } from 'vitest';
import { loadEnv } from '../../../config/env.js';
import { InvalidEnvironmentError } from '../../../errors/invalid-environment.error.js';

/** Every variable envSchema requires, none of them PORT — a complete, valid source loadEnv accepts as given, or with a test's own overrides layered on top. */
function validEnvSource(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    CASE_DATA_DIRECTORY: 'a-case-directory',
    GLOSSARY_DATA_DIRECTORY: 'a-glossary-directory',
    CAPABILITY_DATA_DIRECTORY: 'a-capability-directory',
    INVESTIGATION_DATA_DIRECTORY: 'an-investigation-directory',
    OBSERVATIONS_FIXTURE_FILE: 'an-observations-file',
    EVALUATOR_MODEL: 'an-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: '256',
    POOL_SIZE: '3',
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
    ...overrides,
  };
}

it('defaults PORT to 3000 when the given environment names none', () => {
  const env = loadEnv(validEnvSource());

  expect(env.PORT).toBe(3000);
});

it('parses the given PORT instead of the default when the environment names one', () => {
  const env = loadEnv(validEnvSource({ PORT: '4000' }));

  expect(env.PORT).toBe(4000);
});

it('throws InvalidEnvironmentError naming every missing field together, rather than only the first one it reaches', () => {
  const incomplete = validEnvSource({ CASE_DATA_DIRECTORY: undefined, EVALUATOR_MODEL: undefined });

  let caught: unknown;
  try {
    loadEnv(incomplete);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(InvalidEnvironmentError);
  const issues = (caught as InvalidEnvironmentError).context.issues;
  expect(issues.some((issue) => issue.includes('CASE_DATA_DIRECTORY'))).toBe(true);
  expect(issues.some((issue) => issue.includes('EVALUATOR_MODEL'))).toBe(true);
});

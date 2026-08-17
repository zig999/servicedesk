// Proof for task/http-surface/diagnose-http-endpoint: config/env.ts's own
// loadEnv, over a plain object standing in for process.env — a boundary
// input (STK-08), never process.env itself, so no test here depends on the
// host process's own environment or leaves it mutated for another test.
// Covers this task's own two inferences about env.ts: PORT defaults to 3000
// when unset, and every other declared variable is required, with every
// violation named together rather than only the first one loadEnv reaches.
// Also covers task/relational-substrate/database-connection's own criterion
// 1 — DATABASE_URL joins the set envSchema requires, and a load missing it
// refuses once, naming it together with every other violated field, exactly
// like every field already covered above.
//
// Sibling fix, disclosed in this task's own proof record: validEnvSource()
// below used to name CASE_DATA_DIRECTORY, GLOSSARY_DATA_DIRECTORY,
// CAPABILITY_DATA_DIRECTORY and INVESTIGATION_DATA_DIRECTORY among the
// variables envSchema requires; envSchema no longer declares any of the
// four (task/service-on-the-database/store-wiring's own criterion 2), so
// this fixture no longer names them, and one test below now asserts their
// absence directly instead of asserting a refusal over one of them.
//
// Second sibling fix, disclosed the same way for
// task/http-observation-runtime/production-wiring-swap's own criterion 4:
// validEnvSource() below used to also name OBSERVATIONS_FIXTURE_FILE among
// "a complete, valid source loadEnv accepts"; envSchema no longer declares
// it either, since its only production consumer (diagnose-server.factory.ts's
// own retired fixture-seeding call) is gone, so a fixture calling itself a
// valid environment should not still name a variable production no longer
// reads. Removed from the base object below, and named explicitly instead in
// the one new test that proves it is still accepted but silently dropped
// rather than carried onto Env.
import { expect, it } from 'vitest';
import { loadEnv } from '../../../config/env.js';
import { InvalidEnvironmentError } from '../../../errors/invalid-environment.error.js';

/** Every variable envSchema requires, none of them PORT — a complete, valid source loadEnv accepts as given, or with a test's own overrides layered on top. */
function validEnvSource(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    DATABASE_URL: 'postgres://a-placeholder-connection-url',
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
  const incomplete = validEnvSource({ CONSOLIDATOR_MODEL: undefined, EVALUATOR_MODEL: undefined });

  let caught: unknown;
  try {
    loadEnv(incomplete);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(InvalidEnvironmentError);
  const issues = (caught as InvalidEnvironmentError).context.issues;
  expect(issues.some((issue) => issue.includes('CONSOLIDATOR_MODEL'))).toBe(true);
  expect(issues.some((issue) => issue.includes('EVALUATOR_MODEL'))).toBe(true);
});

// ---------------------------------------------------- store-wiring criterion 2

it('parses a valid environment naming none of the four retired data-directory variables, carrying no trace of any of them onto Env', () => {
  const env = loadEnv(validEnvSource());

  expect(env).not.toHaveProperty('CASE_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('GLOSSARY_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('CAPABILITY_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('INVESTIGATION_DATA_DIRECTORY');
});

// ---------------------------------------------- production-wiring-swap criterion 4

it('parses an environment naming the retired OBSERVATIONS_FIXTURE_FILE variable without carrying it onto Env, now that no production path reads it', () => {
  const env = loadEnv(validEnvSource({ OBSERVATIONS_FIXTURE_FILE: 'an-observations-file' }));

  expect(env).not.toHaveProperty('OBSERVATIONS_FIXTURE_FILE');
});

// ---------------------------------------------------- database-connection criterion 1

it('parses a configured DATABASE_URL through onto Env unchanged', () => {
  const env = loadEnv(validEnvSource({ DATABASE_URL: 'postgres://configured-connection-url' }));

  expect(env.DATABASE_URL).toBe('postgres://configured-connection-url');
});

it('throws InvalidEnvironmentError naming DATABASE_URL when it alone is absent', () => {
  const missingOnlyDatabaseUrl = validEnvSource({ DATABASE_URL: undefined });

  let caught: unknown;
  try {
    loadEnv(missingOnlyDatabaseUrl);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(InvalidEnvironmentError);
  const issues = (caught as InvalidEnvironmentError).context.issues;
  expect(issues.some((issue) => issue.includes('DATABASE_URL'))).toBe(true);
});

it('throws InvalidEnvironmentError naming DATABASE_URL when it is set to an empty string', () => {
  const emptyDatabaseUrl = validEnvSource({ DATABASE_URL: '' });

  let caught: unknown;
  try {
    loadEnv(emptyDatabaseUrl);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(InvalidEnvironmentError);
  const issues = (caught as InvalidEnvironmentError).context.issues;
  expect(issues.some((issue) => issue.includes('DATABASE_URL'))).toBe(true);
});

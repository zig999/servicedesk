import { expect, it } from 'vitest';
import { loadEnv } from '../../../config/env.js';
import { InvalidEnvironmentError } from '../../../errors/invalid-environment.error.js';

function validEnvSource(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    DATABASE_URL: 'postgres://a-placeholder-connection-url',
    EVALUATOR_MODEL: 'an-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: '256',
    POOL_SIZE: '3',
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
    PAGINATION_DEFAULT_LIMIT: '20',
    PAGINATION_MAX_LIMIT: '100',
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

it('parses a valid environment naming none of the four retired data-directory variables, carrying no trace of any of them onto Env', () => {
  const env = loadEnv(validEnvSource());

  expect(env).not.toHaveProperty('CASE_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('GLOSSARY_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('CAPABILITY_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('INVESTIGATION_DATA_DIRECTORY');
});

it('parses an environment naming the retired OBSERVATIONS_FIXTURE_FILE variable without carrying it onto Env, now that no production path reads it', () => {
  const env = loadEnv(validEnvSource({ OBSERVATIONS_FIXTURE_FILE: 'an-observations-file' }));

  expect(env).not.toHaveProperty('OBSERVATIONS_FIXTURE_FILE');
});

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

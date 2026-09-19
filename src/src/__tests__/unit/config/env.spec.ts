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

it('yields a defaulted value for each of the three pool variables when the existing required-variable fixture names none of them', () => {
  const env = loadEnv(validEnvSource());

  expect(Number.isFinite(env.DATABASE_POOL_MAX_CONNECTIONS)).toBe(true);
  expect(Number.isFinite(env.DATABASE_POOL_IDLE_TIMEOUT_MS)).toBe(true);
  expect(Number.isFinite(env.DATABASE_POOL_STATEMENT_TIMEOUT_MS)).toBe(true);
});

it('parses a configured value for each of the three pool variables as a number, distinct from their defaults', () => {
  const env = loadEnv(
    validEnvSource({
      DATABASE_POOL_MAX_CONNECTIONS: '25',
      DATABASE_POOL_IDLE_TIMEOUT_MS: '5000',
      DATABASE_POOL_STATEMENT_TIMEOUT_MS: '45000',
    }),
  );

  expect(env.DATABASE_POOL_MAX_CONNECTIONS).toBe(25);
  expect(env.DATABASE_POOL_IDLE_TIMEOUT_MS).toBe(5000);
  expect(env.DATABASE_POOL_STATEMENT_TIMEOUT_MS).toBe(45000);
});

it('throws InvalidEnvironmentError naming the field when a pool variable is set to a non-numeric value', () => {
  const nonNumeric = validEnvSource({ DATABASE_POOL_MAX_CONNECTIONS: 'ten' });

  let caught: unknown;
  try {
    loadEnv(nonNumeric);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(InvalidEnvironmentError);
  const issues = (caught as InvalidEnvironmentError).context.issues;
  expect(issues.some((issue) => issue.includes('DATABASE_POOL_MAX_CONNECTIONS'))).toBe(true);
});

type PoolBoundField =
  | 'DATABASE_POOL_MAX_CONNECTIONS'
  | 'DATABASE_POOL_IDLE_TIMEOUT_MS'
  | 'DATABASE_POOL_STATEMENT_TIMEOUT_MS';

interface IPoolBoundCase {
  description: string;
  field: PoolBoundField;
  value: string;
  valid: boolean;
}

const poolBoundCases: IPoolBoundCase[] = [
  {
    description: 'refuses a non-integer value',
    field: 'DATABASE_POOL_STATEMENT_TIMEOUT_MS',
    value: '2.5',
    valid: false,
  },
  { description: 'refuses a zero value', field: 'DATABASE_POOL_IDLE_TIMEOUT_MS', value: '0', valid: false },
  { description: 'refuses a negative value', field: 'DATABASE_POOL_MAX_CONNECTIONS', value: '-5', valid: false },
  {
    description: 'admits a positive integer value',
    field: 'DATABASE_POOL_MAX_CONNECTIONS',
    value: '7',
    valid: true,
  },
];

it.each(poolBoundCases)('$description for $field', ({ field, value, valid }) => {
  const source = validEnvSource({ [field]: value });

  if (!valid) {
    let caught: unknown;
    try {
      loadEnv(source);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(InvalidEnvironmentError);
    const issues = (caught as InvalidEnvironmentError).context.issues;
    expect(issues.some((issue) => issue.includes(field))).toBe(true);
    return;
  }

  const env = loadEnv(source);
  expect(Number.isInteger(env[field])).toBe(true);
  expect(env[field]).toBeGreaterThan(0);
});

it('defaults MAX_REQUEST_BODY_BYTES to 1048576 when the given environment names none', () => {
  const env = loadEnv(validEnvSource());

  expect(env.MAX_REQUEST_BODY_BYTES).toBe(1_048_576);
});

it('parses a configured MAX_REQUEST_BODY_BYTES as a number, distinct from its default', () => {
  const env = loadEnv(validEnvSource({ MAX_REQUEST_BODY_BYTES: '2000000' }));

  expect(env.MAX_REQUEST_BODY_BYTES).toBe(2_000_000);
});

it('throws InvalidEnvironmentError naming MAX_REQUEST_BODY_BYTES when it is set to a non-numeric value', () => {
  const nonNumeric = validEnvSource({ MAX_REQUEST_BODY_BYTES: 'not-a-number' });

  let caught: unknown;
  try {
    loadEnv(nonNumeric);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(InvalidEnvironmentError);
  const issues = (caught as InvalidEnvironmentError).context.issues;
  expect(issues.some((issue) => issue.includes('MAX_REQUEST_BODY_BYTES'))).toBe(true);
});

interface IMaxRequestBodyBytesInvalidCase {
  description: string;
  value: string;
}

const maxRequestBodyBytesInvalidCases: IMaxRequestBodyBytesInvalidCase[] = [
  { description: 'a non-integer value', value: '2.5' },
  { description: 'a zero value', value: '0' },
];

it.each(maxRequestBodyBytesInvalidCases)(
  'throws InvalidEnvironmentError naming MAX_REQUEST_BODY_BYTES for $description',
  ({ value }) => {
    const source = validEnvSource({ MAX_REQUEST_BODY_BYTES: value });

    let caught: unknown;
    try {
      loadEnv(source);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(InvalidEnvironmentError);
    const issues = (caught as InvalidEnvironmentError).context.issues;
    expect(issues.some((issue) => issue.includes('MAX_REQUEST_BODY_BYTES'))).toBe(true);
  },
);

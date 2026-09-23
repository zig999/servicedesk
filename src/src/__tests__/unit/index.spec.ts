import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { createDiagnoseHttpServerMock } = vi.hoisted(() => ({
  createDiagnoseHttpServerMock: vi.fn(async () => ({ listen: vi.fn() })),
}));
vi.mock('../../factories/diagnose-server.factory.js', () => ({
  createDiagnoseHttpServer: createDiagnoseHttpServerMock,
}));

let originalEnv: NodeJS.ProcessEnv;

function setStartupEnv(overrides: Record<string, string | undefined> = {}): void {
  const base: Record<string, string> = {
    DATABASE_URL: originalEnv.DATABASE_URL ?? 'postgres://a-placeholder-connection-url',
    EVALUATOR_MODEL: 'an-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: '256',
    POOL_SIZE: '3',
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
    PAGINATION_DEFAULT_LIMIT: '20',
    PAGINATION_MAX_LIMIT: '100',
  };
  for (const [key, value] of Object.entries(base)) {
    process.env[key] = value;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

beforeEach(() => {
  originalEnv = { ...process.env };
  vi.resetModules();
  createDiagnoseHttpServerMock.mockClear();
});

afterEach(() => {
  process.env = originalEnv;
});

type PoolBoundField = 'DATABASE_POOL_MAX_CONNECTIONS' | 'DATABASE_POOL_IDLE_TIMEOUT_MS' | 'DATABASE_POOL_STATEMENT_TIMEOUT_MS';

const POOL_BOUND_FIELDS: PoolBoundField[] = [
  'DATABASE_POOL_MAX_CONNECTIONS',
  'DATABASE_POOL_IDLE_TIMEOUT_MS',
  'DATABASE_POOL_STATEMENT_TIMEOUT_MS',
];

interface IStartupPoolBoundCase {
  description: string;
  field: PoolBoundField;
  value: string;
}

const startupPoolBoundCases: IStartupPoolBoundCase[] = POOL_BOUND_FIELDS.flatMap((field) => [
  { description: 'a non-integer value', field, value: '2.5' },
  { description: 'a zero value', field, value: '0' },
  { description: 'a negative value', field, value: '-5' },
]);

it.each(startupPoolBoundCases)(
  'fails startup and binds no listener when $field names $description',
  async ({ field, value }) => {
    setStartupEnv({ [field]: value });

    await expect(import('../../index.js')).rejects.toThrow(field);

    expect(createDiagnoseHttpServerMock).not.toHaveBeenCalled();
  },
);

it('creates the server and binds a listener at the configured PORT when every pool bound is valid', async () => {
  setStartupEnv({ PORT: '4100' });

  await import('../../index.js');

  expect(createDiagnoseHttpServerMock).toHaveBeenCalledTimes(1);
  const server = (await createDiagnoseHttpServerMock.mock.results[0]!.value) as { listen: ReturnType<typeof vi.fn> };
  expect(server.listen).toHaveBeenCalledWith({ port: 4100, host: '0.0.0.0' });
});

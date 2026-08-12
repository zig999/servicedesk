// Proof for task/relational-substrate/migration-step, criterion 1's ordering clause and criterion
// 3's "applies no script twice": applyPendingMigrations, over a stand-in for the filesystem and for
// the driver connection — both boundaries TST-03 permits a stand-in for — so ordering and the
// pending-file filter are observed independently of any real database or real migration file.
import { afterEach, expect, it, vi } from 'vitest';

const { readdirMock, readFileMock } = vi.hoisted(() => ({
  readdirMock: vi.fn(),
  readFileMock: vi.fn(),
}));
vi.mock('node:fs/promises', () => ({ readdir: readdirMock, readFile: readFileMock }));

const { queryMock, poolMock } = vi.hoisted(() => {
  const queryMock = vi.fn();
  const poolMock = vi.fn(() => ({ query: queryMock, end: vi.fn() }));
  return { queryMock, poolMock };
});
vi.mock('pg', () => ({ Pool: poolMock }));

import { createDatabaseConnection } from '../../../persistence/database-connection.js';
import { applyPendingMigrations } from '../../../persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = 'a-migrations-directory';

/** The one substring the bookkeeping-existence check's own statement carries, distinguishing it from every other statement this module ever sends. */
const BOOKKEEPING_EXISTENCE_QUERY_MARKER = 'to_regclass';

/** The marker every fake migration file's own "SQL" carries, so a test can tell which statements were the migration files' own text rather than the bookkeeping check or its recording INSERT. */
const RAN_MARKER_PREFIX = "SELECT 'ran ";

afterEach(() => {
  queryMock.mockReset();
  poolMock.mockClear();
  readdirMock.mockReset();
  readFileMock.mockReset();
});

it('applies migration files in ascending filename order, regardless of the order the filesystem lists them', async () => {
  readdirMock.mockResolvedValue(['0003-c.sql', '0001-a.sql', '0002-b.sql']);
  readFileMock.mockImplementation(async (path: string) => `${RAN_MARKER_PREFIX}${path}'`);
  const executedTexts: string[] = [];
  queryMock.mockImplementation(async (text: string) => {
    executedTexts.push(text);
    if (text.includes(BOOKKEEPING_EXISTENCE_QUERY_MARKER)) {
      return { rows: [{ exists: false }] };
    }
    return { rows: [] };
  });
  const connection = createDatabaseConnection('postgres://a-placeholder-connection-url');

  await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY);

  const ranFileTexts = executedTexts.filter((text) => text.startsWith(RAN_MARKER_PREFIX));
  expect(ranFileTexts).toEqual([
    `${RAN_MARKER_PREFIX}${MIGRATIONS_DIRECTORY}/0001-a.sql'`,
    `${RAN_MARKER_PREFIX}${MIGRATIONS_DIRECTORY}/0002-b.sql'`,
    `${RAN_MARKER_PREFIX}${MIGRATIONS_DIRECTORY}/0003-c.sql'`,
  ]);
});

it('sends no further statement once every migration file is already recorded as applied', async () => {
  readdirMock.mockResolvedValue(['0001-a.sql', '0002-b.sql']);
  queryMock.mockImplementation(async (text: string) => {
    if (text.includes(BOOKKEEPING_EXISTENCE_QUERY_MARKER)) {
      return { rows: [{ exists: true }] };
    }
    if (text.includes('SELECT filename FROM public.schema_migrations')) {
      return { rows: [{ filename: '0001-a.sql' }, { filename: '0002-b.sql' }] };
    }
    throw new Error(`this test expected no other statement, but received: ${text}`);
  });
  const connection = createDatabaseConnection('postgres://a-placeholder-connection-url');

  await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY);

  expect(readFileMock).not.toHaveBeenCalled();
});

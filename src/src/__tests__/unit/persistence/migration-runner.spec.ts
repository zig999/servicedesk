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
    if (text.includes('SELECT filename FROM "public".schema_migrations')) {
      return { rows: [{ filename: '0001-a.sql' }, { filename: '0002-b.sql' }] };
    }
    throw new Error(`this test expected no other statement, but received: ${text}`);
  });
  const connection = createDatabaseConnection('postgres://a-placeholder-connection-url');

  await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY);

  expect(readFileMock).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------------------------------
// Proof for task/migration-runner-comment-hang-corrective/strip-leading-comments-before-applying:
// applyMigrationFile strips a migration file's own `--` comment lines and blank lines before its
// text ever reaches connection.query, over the same filesystem/connection stand-ins as above
// (TST-03), so what actually reaches the connection is observed without a real database.

it('executes the real statement in a file whose text is entirely comment lines and blank lines above it, never sending any comment line to the connection', async () => {
  readdirMock.mockResolvedValue(['0001-a.sql']);
  readFileMock.mockResolvedValue('-- a leading comment\n-- another comment\n\nSELECT 1;');
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

  expect(executedTexts).toContain('SELECT 1;');
  expect(executedTexts.some((text) => text.includes('a leading comment'))).toBe(false);
  expect(executedTexts.some((text) => text.includes('another comment'))).toBe(false);
});

it('sends a migration file holding no comment line and no blank line to the connection completely unchanged', async () => {
  readdirMock.mockResolvedValue(['0001-a.sql']);
  const originalSql = 'DROP TABLE t (\n  id INTEGER\n);';
  readFileMock.mockResolvedValue(originalSql);
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

  expect(executedTexts).toContain(originalSql);
});

it('drops only the whole comment line inside a multi-line statement, leaving every other line of that statement exactly as the file wrote it', async () => {
  readdirMock.mockResolvedValue(['0001-a.sql']);
  readFileMock.mockResolvedValue('SELECT\n-- a column comment\n  id,\n  name\nFROM t;');
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

  expect(executedTexts).toContain('SELECT\n  id,\n  name\nFROM t;');
});

/**
 * Pins the implementation's own recorded inference: stripping reaches a comment block sitting
 * between two statements, not only a block leading the whole file. An implementation that
 * stripped only a leading comment block would still send this migration's second statement
 * prefixed by its own untouched "-- comment for the second statement" line — this project's own
 * migration scripts place a comment block ahead of nearly every individual statement, not only at
 * the top of the file (see migration-runner.ts's own header comment on stripCommentsAndBlankLines).
 */
it('strips a comment block sitting between two statements, not only a comment block leading the whole file', async () => {
  readdirMock.mockResolvedValue(['0001-a.sql']);
  readFileMock.mockResolvedValue(
    '-- comment for the first statement\nDROP TABLE a (id INTEGER);\n\n-- comment for the second statement\nDROP TABLE b (id INTEGER);',
  );
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

  expect(executedTexts).toContain('DROP TABLE a (id INTEGER);\nDROP TABLE b (id INTEGER);');
  expect(executedTexts.some((text) => text.includes('comment for the second statement'))).toBe(false);
});

it("still records the bookkeeping row naming this file's own filename, after its comment lines are stripped from the SQL that ran", async () => {
  readdirMock.mockResolvedValue(['0007-with-comments.sql']);
  readFileMock.mockResolvedValue('-- explains the statement below\nSELECT 1;');
  let insertCall: { text: string; params?: unknown[] } | undefined;
  queryMock.mockImplementation(async (text: string, params?: unknown[]) => {
    if (text.includes(BOOKKEEPING_EXISTENCE_QUERY_MARKER)) {
      return { rows: [{ exists: false }] };
    }
    if (text.startsWith('INSERT INTO')) {
      insertCall = { text, params };
    }
    return { rows: [] };
  });
  const connection = createDatabaseConnection('postgres://a-placeholder-connection-url');

  await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY);

  expect(insertCall?.text).toBe('INSERT INTO "public".schema_migrations (filename) VALUES ($1)');
  expect(insertCall?.params).toEqual(['0007-with-comments.sql']);
});

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, it, vi } from 'vitest';

const { poolMock } = vi.hoisted(() => ({ poolMock: vi.fn() }));
vi.mock('pg', () => ({ Pool: poolMock }));

import { createDatabaseConnection, type IDatabaseConnectionPoolOptions } from '../../../persistence/database-connection.js';

const MODULE_PATH = fileURLToPath(new URL('../../../persistence/database-connection.ts', import.meta.url));
const A_CONNECTION_URL = 'postgres://a-caller-configured-connection-url';

const A_MAX_CONNECTIONS = 7;
const AN_IDLE_TIMEOUT_MS = 15_000;
const A_STATEMENT_TIMEOUT_MS = 4_000;

const SOME_POOL_OPTIONS: IDatabaseConnectionPoolOptions = {
  maxConnections: A_MAX_CONNECTIONS,
  idleTimeoutMs: AN_IDLE_TIMEOUT_MS,
  statementTimeoutMs: A_STATEMENT_TIMEOUT_MS,
};

const KNOWN_DATABASE_PORT_LITERALS = /\b(5432|3306|27017|6379|1433|1521|9042)\b/;

const IPV4_LITERAL = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

const EMBEDDED_CREDENTIAL_LITERAL = /:\/\/[^/\s'"]+:[^/\s'"]+@/;

const MAX_CONNECTIONS_NUMERIC_LITERAL = /\bmax:\s*\d/;

const IDLE_TIMEOUT_NUMERIC_LITERAL = /\bidleTimeoutMillis:\s*\d/;

const STATEMENT_TIMEOUT_NUMERIC_LITERAL = /\bstatement_timeout:\s*\d/;

afterEach(() => {
  poolMock.mockClear();
});

it('refuses, at the type level, a call naming only a connection URL: poolOptions is a required parameter', () => {
  function callWithNoPoolOptions(): void {
    // @ts-expect-error — poolOptions is required; a call naming only a connection URL must fail to typecheck
    createDatabaseConnection(A_CONNECTION_URL);
  }
  void callWithNoPoolOptions;
});

it("maps a supplied poolOptions.maxConnections onto the pg Pool's max option", () => {
  createDatabaseConnection(A_CONNECTION_URL, SOME_POOL_OPTIONS);

  expect(poolMock).toHaveBeenCalledWith(expect.objectContaining({ max: A_MAX_CONNECTIONS }));
});

it("maps a supplied poolOptions.idleTimeoutMs onto the pg Pool's idleTimeoutMillis option", () => {
  createDatabaseConnection(A_CONNECTION_URL, SOME_POOL_OPTIONS);

  expect(poolMock).toHaveBeenCalledWith(expect.objectContaining({ idleTimeoutMillis: AN_IDLE_TIMEOUT_MS }));
});

it("maps a supplied poolOptions.statementTimeoutMs onto the pg Pool's statement_timeout option", () => {
  createDatabaseConnection(A_CONNECTION_URL, SOME_POOL_OPTIONS);

  expect(poolMock).toHaveBeenCalledWith(expect.objectContaining({ statement_timeout: A_STATEMENT_TIMEOUT_MS }));
});

it('writes no numeric literal for the max, idleTimeoutMillis or statement_timeout pool option anywhere in its own source', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(MAX_CONNECTIONS_NUMERIC_LITERAL.test(source)).toBe(false);
  expect(IDLE_TIMEOUT_NUMERIC_LITERAL.test(source)).toBe(false);
  expect(STATEMENT_TIMEOUT_NUMERIC_LITERAL.test(source)).toBe(false);
});

it('writes no literal database port anywhere in its own source', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(KNOWN_DATABASE_PORT_LITERALS.test(source)).toBe(false);
});

it('writes no literal IPv4 host anywhere in its own source', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(IPV4_LITERAL.test(source)).toBe(false);
});

it('writes no literal embedded credential anywhere in its own source', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(EMBEDDED_CREDENTIAL_LITERAL.test(source)).toBe(false);
});

it("writes no literal 'localhost' endpoint anywhere in its own source", async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(source).not.toMatch(/localhost/i);
});

it('constructs exactly one connection in its own source, never a second one for a second store', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  const poolConstructions = source.match(/new Pool\(/g) ?? [];

  expect(poolConstructions).toHaveLength(1);
});

const TREE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git', 'dist']);
const SINGLE_ARGUMENT_CALL_PATTERN = /createDatabaseConnection\(\s*[^,()]*\)/g;
const EXPECTED_SINGLE_ARGUMENT_CALL_SITE_COUNT = 1;

async function* everyTreeFile(root: string): AsyncGenerator<{ path: string; source: string }> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
      yield* everyTreeFile(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      yield { path: entryPath, source: await readFile(entryPath, 'utf8') };
    }
  }
}

it('is called with only a connection URL nowhere in the tree except this file\'s own type-level refusal proof above, so every caller — production or test — supplies poolOptions', async () => {
  let singleArgumentCallSites = 0;
  for await (const { source } of everyTreeFile(TREE_ROOT)) {
    singleArgumentCallSites += (source.match(SINGLE_ARGUMENT_CALL_PATTERN) ?? []).length;
  }

  expect(singleArgumentCallSites).toBe(EXPECTED_SINGLE_ARGUMENT_CALL_SITE_COUNT);
});

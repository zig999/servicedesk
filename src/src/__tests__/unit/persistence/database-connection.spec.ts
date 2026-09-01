import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, it, vi } from 'vitest';

const { poolMock } = vi.hoisted(() => ({ poolMock: vi.fn() }));
vi.mock('pg', () => ({ Pool: poolMock }));

import { createDatabaseConnection } from '../../../persistence/database-connection.js';

const MODULE_PATH = fileURLToPath(new URL('../../../persistence/database-connection.ts', import.meta.url));
const A_CONNECTION_URL = 'postgres://a-caller-configured-connection-url';

const KNOWN_DATABASE_PORT_LITERALS = /\b(5432|3306|27017|6379|1433|1521|9042)\b/;

const IPV4_LITERAL = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

const EMBEDDED_CREDENTIAL_LITERAL = /:\/\/[^/\s'"]+:[^/\s'"]+@/;

afterEach(() => {
  poolMock.mockClear();
});

it('builds the pg Pool with exactly the given connection URL as its connectionString, and no other configuration key', () => {
  createDatabaseConnection(A_CONNECTION_URL);

  expect(poolMock).toHaveBeenCalledTimes(1);
  expect(poolMock).toHaveBeenCalledWith({ connectionString: A_CONNECTION_URL });
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

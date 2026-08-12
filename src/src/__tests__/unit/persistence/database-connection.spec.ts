// Proof for task/relational-substrate/database-connection.
//
// Criterion 2 — "The connection is constructed from that configured URL alone, and no host,
// port, endpoint or credential for a database appears in source." — has two independent halves,
// each proven separately below: a behavioral half (createDatabaseConnection passes the given URL
// straight through, and only the URL) and a source-scan half (the module's own text carries no
// literal host, port, endpoint or credential — distinct from the prose in its own comments, which
// discusses those words without ever writing a value).
//
// Also excludes the shape UNDERDETERMINED, from the specification — entry 3 of this task's own
// Notes names: "a connection module constructing a second connection for a second store passes
// every criterion above as written." The last test below fails over exactly that shape.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, it, vi } from 'vitest';

const { poolMock } = vi.hoisted(() => ({ poolMock: vi.fn() }));
vi.mock('pg', () => ({ Pool: poolMock }));

import { createDatabaseConnection } from '../../../persistence/database-connection.js';

const MODULE_PATH = fileURLToPath(new URL('../../../persistence/database-connection.ts', import.meta.url));
const A_CONNECTION_URL = 'postgres://a-caller-configured-connection-url';

/** Well-known relational/NoSQL database ports — a literal among these is a hardcoded endpoint, never a value this module should carry. */
const KNOWN_DATABASE_PORT_LITERALS = /\b(5432|3306|27017|6379|1433|1521|9042)\b/;

/** An IPv4 address literal, wherever it appears — a hardcoded host, never something a URL-only module should write. */
const IPV4_LITERAL = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

/** A connection string carrying an embedded user:password before its host — a literal credential. */
const EMBEDDED_CREDENTIAL_LITERAL = /:\/\/[^/\s'"]+:[^/\s'"]+@/;

afterEach(() => {
  poolMock.mockClear();
});

it('builds the pg Pool with exactly the given connection URL as its connectionString, and no other configuration key', () => {
  createDatabaseConnection(A_CONNECTION_URL);

  expect(poolMock).toHaveBeenCalledTimes(1);
  expect(poolMock).toHaveBeenCalledWith({ connectionString: A_CONNECTION_URL });
});

it('passes a different given URL straight through unchanged, never a value fixed in the module itself', () => {
  const aDifferentUrl = 'postgres://a-completely-different-caller-configured-url';

  createDatabaseConnection(aDifferentUrl);

  expect(poolMock).toHaveBeenCalledWith({ connectionString: aDifferentUrl });
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

// ---------------------- excludes UNDERDETERMINED entry 3: a second connection for a second store

it('constructs exactly one connection in its own source, never a second one for a second store', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  const poolConstructions = source.match(/new Pool\(/g) ?? [];

  expect(poolConstructions).toHaveLength(1);
});

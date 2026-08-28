// Proof for task/relational-stores/capability-store, over a stand-in for DatabaseConnection — the
// driver boundary TST-03 permits a stand-in for — so RelationalCapabilityStore's own mechanics are
// observed independently of any real database: which statement text and params reach the
// connection, how a read row maps onto a Capability, exactly when BEGIN/SET LOCAL/COMMIT/ROLLBACK
// happen relative to writeCapabilities' own per-identity upsert, and how a driver failure reaches
// the caller as this store's own typed error. The real-effect half — that a write actually
// persists, that the whole batch really rolls back together against a real constraint, and that
// the database itself excludes a registration with an absent schema or connector — is proven
// separately, against a real database, in this file's own integration-level sibling.
//
// The two write-mechanics tests below were rewritten for
// task/capability-registry-write-upsert-hotfix: writeCapabilities no longer issues a table-wide
// DELETE followed by one INSERT per kept-and-incoming capability (the mechanism that failed with a
// Postgres 23503 the moment any capabilities row was referenced by investigation_evidence); it now
// issues one INSERT ... ON CONFLICT (name, version) DO UPDATE per given capability, and no DELETE
// statement at all, ever. The reproduction of the original failure — a capability row already
// referenced by investigation_evidence, written again, succeeding and never being deleted — is
// proven against a real database and a real foreign key in this file's own integration-level
// sibling, since a stand-in connection cannot enforce a foreign key.
import { expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { CapabilityStoreError } from '../../../errors/capability-store.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../../../persistence/relational-capability-store.repository.js';

/** One registration as the registry holds it, for writing through the store — the same shape the sibling file-store proof already builds (file-capability-store.repository.spec.ts). */
function capabilityRecord(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

/** A bare connection whose own query() is backed by the given implementation — the shape readCapabilities calls directly, with no transaction opened. */
function fakeBareConnection(query: DatabaseConnection['query']): DatabaseConnection {
  return { query } as unknown as DatabaseConnection;
}

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

/** A fake DatabaseConnection whose connect() checks out one fake client backed by handleQuery, tracking every call to release() — the shape writeCapabilities' own transaction runs through (database-access.spec.ts's own established convention). */
function fakeTransactionConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): { connection: DatabaseConnection; client: IFakeClient } {
  const client: IFakeClient = { query: vi.fn(handleQuery), release: vi.fn() };
  const connect = vi.fn().mockResolvedValue(client);
  return { connection: { connect } as unknown as DatabaseConnection, client };
}

/** Every statement text a fake transaction connection recorded, whitespace-collapsed so a multi-line SQL template compares the same as its single-line equivalent. */
function collapsedTexts(recorded: readonly { text: string }[]): string[] {
  return recorded.map((entry) => entry.text.replace(/\s+/g, ' ').trim());
}

// ---------------------------------------------------------------- criterion 1

it('answers a read with every declared attribute — name, version, nature, both schemas, timeout, connector and concept', async () => {
  const row = {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5000,
    connector: 'a-connector',
    concept: 'a-concept',
  };
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  const store = new RelationalCapabilityStore(fakeBareConnection(query));

  const answered = await store.readCapabilities();

  expect(answered).toEqual([capabilityRecord()]);
});

// ---------------------------------------------------------------- criterion 2

it("answers the second call's own rows, never a value the first call already answered", async () => {
  const firstRow = { ...capabilityRecord({ name: 'first' }) };
  const secondRow = { ...capabilityRecord({ name: 'second' }) };
  const query = vi.fn().mockResolvedValueOnce({ rows: [firstRow] }).mockResolvedValueOnce({ rows: [secondRow] });
  const store = new RelationalCapabilityStore(fakeBareConnection(query));

  const first = await store.readCapabilities();
  const second = await store.readCapabilities();

  expect(first).toEqual([capabilityRecord({ name: 'first' })]);
  expect(second).toEqual([capabilityRecord({ name: 'second' })]);
  expect(query).toHaveBeenCalledTimes(2);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when a read is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const query = vi.fn().mockRejectedValue(driverFailure);
  const store = new RelationalCapabilityStore(fakeBareConnection(query));

  let caught: unknown;
  try {
    await store.readCapabilities();
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(CapabilityStoreError);
  expect((caught as Error).cause).toBe(driverFailure);
});

// ---------------------------------------------------------------- edge case: a row holding a nature the enumeration does not declare

it("raises this store's own typed error rather than answering a row whose nature is outside the declared enumeration", async () => {
  const row = { ...capabilityRecord(), nature: 'destructive' };
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  const store = new RelationalCapabilityStore(fakeBareConnection(query));

  await expect(store.readCapabilities()).rejects.toBeInstanceOf(CapabilityStoreError);
});

// ---------------------------------------------------------------- write mechanics: per-identity upsert inside one transaction, criterion 4

it('upserts each given capability by its own (name, version) identity, inside one transaction, and never sends a DELETE', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalCapabilityStore(connection);
  const capabilities = [capabilityRecord({ name: 'a-capability' }), capabilityRecord({ name: 'another-capability' })];

  await store.writeCapabilities(capabilities);

  const texts = collapsedTexts(recorded);
  expect(texts[0]).toBe('BEGIN');
  expect(texts[1]).toContain('INSERT INTO capabilities');
  expect(texts[1]).toContain('ON CONFLICT (name, version) DO UPDATE');
  expect(texts[2]).toContain('INSERT INTO capabilities');
  expect(texts[2]).toContain('ON CONFLICT (name, version) DO UPDATE');
  expect(texts[3]).toBe('COMMIT');
  expect(texts.some((text) => text.includes('DELETE'))).toBe(false);
  expect(recorded[1]?.params).toEqual(['a-capability', '1.0.0', 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', 'a-concept']);
  expect(recorded[2]?.params).toEqual(['another-capability', '1.0.0', 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', 'a-concept']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- edge case: writing an empty set, criterion 4

it('sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty set', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalCapabilityStore(connection);

  await store.writeCapabilities([]);

  expect(collapsedTexts(recorded)).toEqual(['BEGIN', 'COMMIT']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- write failure wrapping

it("raises this store's own typed error, carrying the driver failure as its cause, and rolls back, when the write is refused", async () => {
  const driverFailure = new Error('the driver refused this write');
  const { connection, client } = fakeTransactionConnection(async (text) => {
    if (text.includes('INSERT')) {
      throw driverFailure;
    }
    return { rows: [] };
  });
  const store = new RelationalCapabilityStore(connection);

  let caught: unknown;
  try {
    await store.writeCapabilities([capabilityRecord()]);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(CapabilityStoreError);
  expect((caught as Error).cause).toBe(driverFailure);
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  expect(client.release).toHaveBeenCalledTimes(1);
});

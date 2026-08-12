// Proof for task/relational-stores/capability-store, over a stand-in for DatabaseConnection — the
// driver boundary TST-03 permits a stand-in for — so RelationalCapabilityStore's own mechanics are
// observed independently of any real database: which statement text and params reach the
// connection, how a read row maps onto a Capability, exactly when BEGIN/SET LOCAL/COMMIT/ROLLBACK
// happen relative to writeCapabilities' own replace, and how a driver failure reaches the caller as
// this store's own typed error. The real-effect half — that a write actually persists, that the
// whole replace really rolls back together against a real constraint, and that the database itself
// excludes a registration with an absent schema or connector — is proven separately, against a real
// database, in this file's own integration-level sibling.
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

// ---------------------------------------------------------------- edge case: no row currently registered

it('answers the empty registry when the table currently holds no row', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const store = new RelationalCapabilityStore(fakeBareConnection(query));

  await expect(store.readCapabilities()).resolves.toEqual([]);
});

// ---------------------------------------------------------------- edge case: a row holding a nature the enumeration does not declare

it("raises this store's own typed error rather than answering a row whose nature is outside the declared enumeration", async () => {
  const row = { ...capabilityRecord(), nature: 'destructive' };
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  const store = new RelationalCapabilityStore(fakeBareConnection(query));

  await expect(store.readCapabilities()).rejects.toBeInstanceOf(CapabilityStoreError);
});

// ---------------------------------------------------------------- write mechanics: whole replace inside one transaction

it('deletes every existing row and inserts exactly the given capabilities, in that order, inside one transaction', async () => {
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
  expect(texts[1]).toBe('SET LOCAL search_path TO public');
  expect(texts[2]).toContain('DELETE FROM public.capabilities');
  expect(texts[3]).toContain('INSERT INTO public.capabilities');
  expect(texts[4]).toContain('INSERT INTO public.capabilities');
  expect(texts[5]).toBe('COMMIT');
  expect(recorded[3]?.params).toEqual(['a-capability', '1.0.0', 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', 'a-concept']);
  expect(recorded[4]?.params).toEqual(['another-capability', '1.0.0', 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', 'a-concept']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- edge case: replacing the whole table with an empty set

it('issues only the DELETE and still commits, when replacing the whole table with an empty set', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalCapabilityStore(connection);

  await store.writeCapabilities([]);

  expect(collapsedTexts(recorded)).toEqual(['BEGIN', 'SET LOCAL search_path TO public', 'DELETE FROM public.capabilities', 'COMMIT']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 4

it('persists a capability whose nature is read-only without refusing it on that ground', async () => {
  const { connection } = fakeTransactionConnection(async () => ({ rows: [] }));
  const store = new RelationalCapabilityStore(connection);

  await expect(store.writeCapabilities([capabilityRecord({ nature: 'read-only' })])).resolves.toBeUndefined();
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

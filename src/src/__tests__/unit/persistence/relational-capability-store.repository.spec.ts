import { expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { CapabilityStoreError } from '../../../errors/capability-store.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../../../persistence/relational-capability-store.repository.js';

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

function fakeBareConnection(query: DatabaseConnection['query']): DatabaseConnection {
  return { query } as unknown as DatabaseConnection;
}

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

function fakeTransactionConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): { connection: DatabaseConnection; client: IFakeClient } {
  const client: IFakeClient = { query: vi.fn(handleQuery), release: vi.fn() };
  const connect = vi.fn().mockResolvedValue(client);
  return { connection: { connect } as unknown as DatabaseConnection, client };
}

function collapsedTexts(recorded: readonly { text: string }[]): string[] {
  return recorded.map((entry) => entry.text.replace(/\s+/g, ' ').trim());
}

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

it("raises this store's own typed error rather than answering a row whose nature is outside the declared enumeration", async () => {
  const row = { ...capabilityRecord(), nature: 'destructive' };
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  const store = new RelationalCapabilityStore(fakeBareConnection(query));

  await expect(store.readCapabilities()).rejects.toBeInstanceOf(CapabilityStoreError);
});

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

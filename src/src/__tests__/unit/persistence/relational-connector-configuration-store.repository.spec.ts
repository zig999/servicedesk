// Proof for task/connector-registration/connector-configuration-persistence, over a stand-in for
// DatabaseConnection — the driver boundary TST-03 permits a stand-in for — so
// RelationalConnectorConfigurationStore's own mechanics are observed independently of any real
// database: which statement text and params reach the connection, how a read row maps onto a
// ConnectorConfiguration, exactly when BEGIN/SET LOCAL/COMMIT/ROLLBACK happen relative to
// writeConnectorConfigurations' own whole replace, and how a driver failure reaches the caller as
// this store's own typed error. The real-effect half — that a write actually persists and that a
// whole replace really rolls back together against a real constraint — is proven separately,
// against a real database, in this file's own integration-level sibling.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it, vi } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationStoreError } from '../../../errors/connector-configuration-store.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../../../persistence/relational-connector-configuration-store.repository.js';

/** One connector configuration as the registry holds it, for writing through the store. */
function connectorConfigurationRecord(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: { method: 'GET', address: 'https://example.test' },
    ...overrides,
  };
}

/** A bare connection whose own query() is backed by the given implementation — the shape readConnectorConfigurations calls directly, with no transaction opened. */
function fakeBareConnection(query: DatabaseConnection['query']): DatabaseConnection {
  return { query } as unknown as DatabaseConnection;
}

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

/** A fake DatabaseConnection whose connect() checks out one fake client backed by handleQuery, tracking every call to release() — the shape writeConnectorConfigurations' own transaction runs through (database-access.spec.ts's own established convention). */
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

// ---------------------------------------------------------------- criterion 1: read

it('answers a read with the connector identity and its configuration exactly as the row holds them', async () => {
  const row = { connector: 'a-connector', configuration: { method: 'GET', address: 'https://example.test' } };
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  const store = new RelationalConnectorConfigurationStore(fakeBareConnection(query));

  const answered = await store.readConnectorConfigurations();

  expect(answered).toEqual([connectorConfigurationRecord()]);
});

it("answers the second call's own rows, never a value the first call already answered", async () => {
  const firstRow = connectorConfigurationRecord({ connector: 'first' });
  const secondRow = connectorConfigurationRecord({ connector: 'second' });
  const query = vi.fn().mockResolvedValueOnce({ rows: [firstRow] }).mockResolvedValueOnce({ rows: [secondRow] });
  const store = new RelationalConnectorConfigurationStore(fakeBareConnection(query));

  const first = await store.readConnectorConfigurations();
  const second = await store.readConnectorConfigurations();

  expect(first).toEqual([connectorConfigurationRecord({ connector: 'first' })]);
  expect(second).toEqual([connectorConfigurationRecord({ connector: 'second' })]);
  expect(query).toHaveBeenCalledTimes(2);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when a read is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const query = vi.fn().mockRejectedValue(driverFailure);
  const store = new RelationalConnectorConfigurationStore(fakeBareConnection(query));

  let caught: unknown;
  try {
    await store.readConnectorConfigurations();
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(ConnectorConfigurationStoreError);
  expect((caught as Error).cause).toBe(driverFailure);
});

// ---------------------------------------------------------------- edge case: no row currently registered

it('answers the empty registry when the table currently holds no row', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const store = new RelationalConnectorConfigurationStore(fakeBareConnection(query));

  await expect(store.readConnectorConfigurations()).resolves.toEqual([]);
});

// ---------------------------------------------------------------- write mechanics: whole replace inside one transaction

it('deletes every existing row and inserts exactly the given configurations, in that order, inside one transaction', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalConnectorConfigurationStore(connection);
  const configurations = [
    connectorConfigurationRecord({ connector: 'a-connector' }),
    connectorConfigurationRecord({ connector: 'another-connector' }),
  ];

  await store.writeConnectorConfigurations(configurations);

  const texts = collapsedTexts(recorded);
  expect(texts[0]).toBe('BEGIN');
  expect(texts[1]).toBe('SET LOCAL search_path TO public');
  expect(texts[2]).toContain('DELETE FROM public.connector_configurations');
  expect(texts[3]).toContain('INSERT INTO public.connector_configurations');
  expect(texts[4]).toContain('INSERT INTO public.connector_configurations');
  expect(texts[5]).toBe('COMMIT');
  expect(recorded[3]?.params).toEqual(['a-connector', JSON.stringify({ method: 'GET', address: 'https://example.test' })]);
  expect(recorded[4]?.params).toEqual(['another-connector', JSON.stringify({ method: 'GET', address: 'https://example.test' })]);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it('issues only the DELETE and still commits, when replacing the whole table with an empty set', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalConnectorConfigurationStore(connection);

  await store.writeConnectorConfigurations([]);

  expect(collapsedTexts(recorded)).toEqual([
    'BEGIN',
    'SET LOCAL search_path TO public',
    'DELETE FROM public.connector_configurations',
    'COMMIT',
  ]);
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
  const store = new RelationalConnectorConfigurationStore(connection);

  let caught: unknown;
  try {
    await store.writeConnectorConfigurations([connectorConfigurationRecord()]);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(ConnectorConfigurationStoreError);
  expect((caught as Error).cause).toBe(driverFailure);
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 1: never a file

it('this store and the connector-registry module it implements open no file on disk', async () => {
  const paths = [
    fileURLToPath(new URL('../../../persistence/relational-connector-configuration-store.repository.ts', import.meta.url)),
    fileURLToPath(new URL('../../../connector-registry/connector-configuration.ts', import.meta.url)),
    fileURLToPath(new URL('../../../connector-registry/connector-configuration-store.port.ts', import.meta.url)),
    fileURLToPath(new URL('../../../connector-registry/connector-configuration-registry.service.ts', import.meta.url)),
  ];

  const sources = await Promise.all(paths.map((path) => readFile(path, 'utf8')));

  const filesystemReaches = sources.filter(
    (source) => /['"]node:fs/.test(source) || /require\(\s*['"]fs['"]\s*\)/.test(source),
  );

  expect(filesystemReaches).toEqual([]);
});

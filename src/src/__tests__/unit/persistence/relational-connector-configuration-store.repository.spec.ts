import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it, vi } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationStoreError } from '../../../errors/connector-configuration-store.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../../../persistence/relational-connector-configuration-store.repository.js';

function connectorConfigurationRecord(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: JSON.stringify({ method: 'GET', address: 'https://example.test' }),
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

  const query = vi.fn()
    .mockResolvedValueOnce({ rows: [{ ...firstRow, configuration: JSON.parse(firstRow.configuration) }] })
    .mockResolvedValueOnce({ rows: [{ ...secondRow, configuration: JSON.parse(secondRow.configuration) }] });
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

it('upserts each given configuration by its own connector identity, inside one transaction, and never sends a DELETE', async () => {
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
  expect(texts[1]).toContain('INSERT INTO connector_configurations');
  expect(texts[1]).toContain('ON CONFLICT (connector) DO UPDATE');
  expect(texts[2]).toContain('INSERT INTO connector_configurations');
  expect(texts[2]).toContain('ON CONFLICT (connector) DO UPDATE');
  expect(texts[3]).toBe('COMMIT');
  expect(texts.some((text) => text.includes('DELETE'))).toBe(false);
  expect(recorded[1]?.params).toEqual(['a-connector', JSON.stringify({ method: 'GET', address: 'https://example.test' })]);
  expect(recorded[2]?.params).toEqual(['another-connector', JSON.stringify({ method: 'GET', address: 'https://example.test' })]);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it('sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty set', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalConnectorConfigurationStore(connection);

  await store.writeConnectorConfigurations([]);

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

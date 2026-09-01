import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationStoreError } from '../../../errors/connector-configuration-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../../../persistence/relational-connector-configuration-store.repository.js';

const NOT_NULL_VIOLATION = '23502';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

function connectorConfigurationRecord(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: JSON.stringify({ method: 'GET', address: 'https://example.test' }),
    ...overrides,
  };
}

let pool: DatabaseConnection;

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl());
  await pool.query('DELETE FROM connector_configurations');
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  await pool.query('DELETE FROM connector_configurations');
});

it('persists and reads back a connector configuration exactly as given', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const configuration = connectorConfigurationRecord();

  await store.writeConnectorConfigurations([configuration]);
  const answered = await store.readConnectorConfigurations();

  expect(answered).toEqual([configuration]);
});

it('leaves connector-a exactly as it was when a different connector, connector-b, is written afterward', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const connectorA = connectorConfigurationRecord({ connector: 'connector-a' });
  const connectorB = connectorConfigurationRecord({ connector: 'connector-b' });
  await store.writeConnectorConfigurations([connectorA]);
  await store.readConnectorConfigurations();

  await store.writeConnectorConfigurations([connectorB]);
  const answered = await store.readConnectorConfigurations();

  expect(answered).toHaveLength(2);
  expect(answered.find((configuration) => configuration.connector === connectorA.connector)).toEqual(connectorA);
  expect(answered.find((configuration) => configuration.connector === connectorB.connector)).toEqual(connectorB);
});

it('answers a rewritten connector with its new value at the very next read, never a value an earlier read of the same identity already answered', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const original = connectorConfigurationRecord({ connector: 'a-rewritten-connector' });
  await store.writeConnectorConfigurations([original]);
  await store.readConnectorConfigurations();

  const rewritten = { ...original, configuration: JSON.stringify({ method: 'POST', address: 'https://example.test/rewritten' }) };
  await store.writeConnectorConfigurations([rewritten]);
  const answered = await store.readConnectorConfigurations();

  expect(answered).toEqual([rewritten]);
});

it('rewrites connector-a in place and leaves connector-b, a different, already-registered connector, exactly as it was', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const connectorA = connectorConfigurationRecord({ connector: 'connector-a' });
  const connectorB = connectorConfigurationRecord({
    connector: 'connector-b',
    configuration: JSON.stringify({ method: 'POST', address: 'https://example.test/b' }),
  });
  await store.writeConnectorConfigurations([connectorA]);
  await store.writeConnectorConfigurations([connectorB]);

  const rewrittenA = {
    ...connectorA,
    configuration: JSON.stringify({ method: 'PUT', address: 'https://example.test/a-rewritten' }),
  };
  await store.writeConnectorConfigurations([rewrittenA]);
  const answered = await store.readConnectorConfigurations();

  expect(answered.find((configuration) => configuration.connector === connectorB.connector)).toEqual(connectorB);
  expect(answered.find((configuration) => configuration.connector === connectorA.connector)).toEqual(rewrittenA);
});

it('keeps exactly one row for a connector name after two writes to the same identity, never appending a duplicate', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const connector = 'a-twice-written-connector';
  await store.writeConnectorConfigurations([connectorConfigurationRecord({ connector })]);

  await store.writeConnectorConfigurations([
    connectorConfigurationRecord({ connector, configuration: JSON.stringify({ method: 'POST', address: 'https://example.test/2' }) }),
  ]);

  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM connector_configurations WHERE connector = $1',
    [connector],
  );
  expect(rows[0]?.count).toBe('1');
});

it("rolls the whole write back and leaves the table's earlier content untouched, when a later upsert in the same batch violates a real constraint", async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const alreadyHeld = connectorConfigurationRecord({ connector: 'an-already-held-connector' });
  await store.writeConnectorConfigurations([alreadyHeld]);
  const incomplete = {
    ...connectorConfigurationRecord({ connector: 'an-incomplete-connector' }),
    configuration: undefined,
  } as unknown as ConnectorConfiguration;

  const rejection = store.writeConnectorConfigurations([
    connectorConfigurationRecord({ connector: 'a-valid-second-connector' }),
    incomplete,
  ]);

  await expect(rejection).rejects.toMatchObject({ cause: { code: NOT_NULL_VIOLATION } });
  await expect(store.readConnectorConfigurations()).resolves.toEqual([alreadyHeld]);
});

it('excludes a write with no connector identity: the write is refused by the real database and nothing is stored', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const incomplete = { ...connectorConfigurationRecord(), connector: undefined } as unknown as ConnectorConfiguration;

  const rejection = store.writeConnectorConfigurations([incomplete]);

  await expect(rejection).rejects.toBeInstanceOf(ConnectorConfigurationStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: NOT_NULL_VIOLATION } });
  await expect(store.readConnectorConfigurations()).resolves.toEqual([]);
});

it('excludes a write with no configuration payload: the write is refused by the real database and nothing is stored', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const incomplete = { ...connectorConfigurationRecord(), configuration: undefined } as unknown as ConnectorConfiguration;

  const rejection = store.writeConnectorConfigurations([incomplete]);

  await expect(rejection).rejects.toBeInstanceOf(ConnectorConfigurationStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: NOT_NULL_VIOLATION } });
  await expect(store.readConnectorConfigurations()).resolves.toEqual([]);
});

it('holds only the connector and configuration columns — no transport-specific column such as a method or an address', async () => {
  const { rows } = await pool.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'connector_configurations' ORDER BY column_name",
  );

  expect(rows.map((row) => row.column_name)).toEqual(['configuration', 'connector']);
});

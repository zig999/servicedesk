// Proof for task/connector-registration/connector-configuration-persistence, against a real,
// externally provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned)
// reached through DATABASE_URL — RelationalConnectorConfigurationStore is what is under test, so
// nothing here stands in for it (TST-03); the mechanics (which statement text and params are
// sent, exactly when BEGIN/SET LOCAL/COMMIT/ROLLBACK/release happen) are proven independently of a
// real database in this file's own unit-level sibling instead.
//
// Every statement below names "connector_configurations" unqualified, resolving against whatever
// schema the connecting role's own server-side default names, the same convention
// database-access.spec.ts's and isolated-connection.spec.ts's own integration proofs already
// document at length (persistence/migration-runner.ts's own header says why that default is safe
// to trust under this project's transaction-pooling DATABASE_URL).
//
// writeConnectorConfigurations() replaces the whole "connector_configurations" table on every
// call (a DELETE, then one INSERT per given configuration); no other suite in this project writes
// to connector_configurations (this table is new with this task's own migration), so this
// file is free to treat the whole table as its own, and its own afterEach wipes it completely.
//
// Divergence disclosed here for the same reason database-access.spec.ts and
// isolated-connection.spec.ts already disclose it: (STK-08) DATABASE_URL is read directly from
// process.env below rather than through config/env.ts's loadEnv, because loadEnv refuses unless
// every other application variable is configured too, which this file has no use for.
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import { ConnectorConfigurationStoreError } from '../../../errors/connector-configuration-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../../../persistence/relational-connector-configuration-store.repository.js';

/** The Postgres SQLSTATE codes this suite's refusal assertions match against (TYP-04). */
const NOT_NULL_VIOLATION = '23502';
const UNIQUE_VIOLATION = '23505';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** One connector configuration as the registry holds it. */
function connectorConfigurationRecord(overrides: Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {
  return {
    connector: 'a-connector',
    configuration: { method: 'GET', address: 'https://example.test' },
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

// ---------------------------------------------------------------- criterion 1

it('persists and reads back a connector configuration exactly as given', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const configuration = connectorConfigurationRecord();

  await store.writeConnectorConfigurations([configuration]);
  const answered = await store.readConnectorConfigurations();

  expect(answered).toEqual([configuration]);
});

it('answers a read as the database holds it right now, never a value an earlier read already answered', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  await store.writeConnectorConfigurations([connectorConfigurationRecord({ connector: 'connector-a' })]);
  await store.readConnectorConfigurations(); // answers connector-a, baiting a memory

  await store.writeConnectorConfigurations([connectorConfigurationRecord({ connector: 'connector-b' })]);
  const answered = await store.readConnectorConfigurations();

  expect(answered).toEqual([connectorConfigurationRecord({ connector: 'connector-b' })]);
});

it("leaves the table's earlier content untouched, when a later insert inside one replace violates a real constraint", async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const alreadyHeld = connectorConfigurationRecord();
  await store.writeConnectorConfigurations([alreadyHeld]);

  const rejection = store.writeConnectorConfigurations([
    connectorConfigurationRecord({ connector: 'a-colliding-connector' }),
    connectorConfigurationRecord({ connector: 'a-colliding-connector' }), // same connector as each other — collides on the primary key
  ]);

  await expect(rejection).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
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

// ---------------------------------------------------------------- inference: no transport-specific column

it('holds only the connector and configuration columns — no transport-specific column such as a method or an address', async () => {
  const { rows } = await pool.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'connector_configurations' ORDER BY column_name",
  );

  expect(rows.map((row) => row.column_name)).toEqual(['configuration', 'connector']);
});

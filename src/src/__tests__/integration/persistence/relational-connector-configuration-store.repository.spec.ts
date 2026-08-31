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
// writeConnectorConfigurations() upserts each given configuration by its own connector identity —
// an INSERT ... ON CONFLICT (connector) DO UPDATE, never a DELETE
// (task/connector-configuration-write-upsert-hotfix) — rather than replacing the whole
// "connector_configurations" table on every call the way it used to (a DELETE, then one INSERT
// per given configuration). No other suite in this project writes to connector_configurations
// (this table is new with this task's own migration), so this file is free to treat the whole
// table as its own, and its own afterEach wipes it completely.
//
// Reconciled for task/connector-configuration-write-upsert-hotfix: the two tests below that used
// to assert whole-table-replace behavior — one showing a second connector's write erasing the
// first, one forcing a same-batch primary-key collision that only the removed delete-then-insert
// mechanics could produce — are rewritten below for the corrected upsert-by-identity semantics,
// the same reconciliation relational-capability-store.repository.spec.ts's own integration
// sibling already carries for task/capability-registry-write-upsert-hotfix's identical shape.
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

/** The Postgres SQLSTATE code this suite's refusal assertions match against (TYP-04). */
const NOT_NULL_VIOLATION = '23502';

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

// ---------------------------------------------------------------- criterion 1

it('persists and reads back a connector configuration exactly as given', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const configuration = connectorConfigurationRecord();

  await store.writeConnectorConfigurations([configuration]);
  const answered = await store.readConnectorConfigurations();

  expect(answered).toEqual([configuration]);
});

// ---------------------------------------------------------------- task/connector-configuration-write-upsert-hotfix, criteria 1 and 2
//
// Reconciled: this test used to expect writing connector-b to erase connector-a, proving the
// whole-table-replace semantics this task removed. writeConnectorConfigurations now upserts each
// configuration strictly by its own connector identity and never deletes a row belonging to a
// different connector, so writing connector-b leaves connector-a exactly as it was — the test
// below proves that. The fresh-read (no-cache) guarantee this test used to bundle with it is
// proven separately, for the same identity rewritten with a new value, by the test that follows.

it('leaves connector-a exactly as it was when a different connector, connector-b, is written afterward', async () => {
  const store = new RelationalConnectorConfigurationStore(pool);
  const connectorA = connectorConfigurationRecord({ connector: 'connector-a' });
  const connectorB = connectorConfigurationRecord({ connector: 'connector-b' });
  await store.writeConnectorConfigurations([connectorA]);
  await store.readConnectorConfigurations(); // answers connector-a, baiting a memory

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
  await store.readConnectorConfigurations(); // answers the original configuration, baiting a memory

  const rewritten = { ...original, configuration: JSON.stringify({ method: 'POST', address: 'https://example.test/rewritten' }) };
  await store.writeConnectorConfigurations([rewritten]);
  const answered = await store.readConnectorConfigurations();

  expect(answered).toEqual([rewritten]);
});

// The two tests above each observe one half of criterion 2 alone: the first only ever holds the
// rewritten identity in the table (afterEach wipes it between tests), and the two-identity test
// above it writes a brand-new second identity, never rewrites an already-registered one. Neither
// observes, against the real database, a different connector's row surviving the rewrite of
// another already-registered connector. The test below does, proving both halves of criterion 2
// together: the rewritten identity reads back its new value, and the untouched one reads back
// exactly what it already held.

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

// ---------------------------------------------------------------- UNDERDETERMINED, from the specification —
// an append-only writer that never updates or deletes a row is excluded: after two writes to the
// same connector identity, the table holds exactly one row for that name (not two), which is the
// one fact an implementation that only ever appends a new row cannot produce.

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

// ---------------------------------------------------------------- constraints/the-system-persists-to-one-relational-database, EDG-05
//
// Reconciled for task/connector-configuration-write-upsert-hotfix: this test used to force a real
// constraint violation by giving writeConnectorConfigurations two rows sharing one connector
// identity in the same call, which collided on the primary key under the removed
// delete-then-insert mechanics. Under the new per-identity ON CONFLICT DO UPDATE, that no longer
// collides at all — the second row's own upsert simply updates the row the first one just
// inserted, inside the same transaction. A genuine constraint the new upsert cannot avoid (a NOT
// NULL violation on configuration, in a two-item batch alongside an already-held, unrelated
// connector) replaces it below, preserving the same guarantee this test always proved: a failure
// partway through a batch rolls the whole write back, leaving the table's earlier content
// untouched.

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

// ---------------------------------------------------------------- constraints/the-stored-schema-mirrors-the-declared-model
//
// domain/integration/connector-configuration declares exactly two attributes — connector and
// configuration — and constrains configuration's own shape no further than "a well-formed JSON
// object"; a transport-specific column such as a method or an address is excluded by the node
// itself, not inferred by this test. The test below pairs connector_configurations' own columns
// against those two declared attributes, the fitness constraints/the-stored-schema-mirrors-the-declared-model
// states: a column pairing with no declared attribute, and a declared attribute no column holds,
// are both departures.

it('holds only the connector and configuration columns — no transport-specific column such as a method or an address', async () => {
  const { rows } = await pool.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'connector_configurations' ORDER BY column_name",
  );

  expect(rows.map((row) => row.column_name)).toEqual(['configuration', 'connector']);
});

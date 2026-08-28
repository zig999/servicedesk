// Proof for task/connector-registration/connector-configuration-persistence, through the module's
// real wiring, against a real, externally provisioned PostgreSQL database
// (constraints/the-database-is-externally-provisioned) reached through DATABASE_URL and threaded
// into createConnectorConfigurationRegistry as one DatabaseConnection: a connector registered
// through the real factory lands as a row RelationalConnectorConfigurationStore reads back
// (constraints/the-system-persists-to-one-relational-database), and a re-registration under the
// same connector identity replaces that row rather than holding a second one.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { createCapabilitiesReader, createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createConnectorConfigurationRegistry } from '../../../factories/connector-configuration-registry.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalConnectorConfigurationStore } from '../../../persistence/relational-connector-configuration-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

let pool: DatabaseConnection;
let conceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  await pool.query("DELETE FROM connector_configurations WHERE connector LIKE 'connector-registry-factory-%'");
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM capabilities WHERE concept = ANY($1)', [conceptsWrittenByThisTest]);
    await pool.query('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
    conceptsWrittenByThisTest = [];
  }
});

/** A fresh concept row this test owns, tracked for this file's own afterEach cleanup — capabilities carries a foreign key to concepts. */
async function aFreshConcept(): Promise<string> {
  const name = `connector-registry-factory-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

it('persists a registered connector configuration as a row RelationalConnectorConfigurationStore reads back, through the real factory wiring', async () => {
  const registry = createConnectorConfigurationRegistry(pool);

  const registered = await registry.registerConnector({
    connector: 'connector-registry-factory-a',
    configuration: { method: 'GET', address: 'https://example.test' },
  });

  const answered = (await new RelationalConnectorConfigurationStore(pool).readConnectorConfigurations()).filter(
    (configuration) => configuration.connector === 'connector-registry-factory-a',
  );
  expect(answered).toEqual([registered]);
});

it('replaces the persisted configuration when the same connector registers again through the real wiring', async () => {
  const registry = createConnectorConfigurationRegistry(pool);
  await registry.registerConnector({ connector: 'connector-registry-factory-b', configuration: { version: 'old' } });

  const replaced = await registry.registerConnector({
    connector: 'connector-registry-factory-b',
    configuration: { version: 'new' },
  });

  const answered = (await new RelationalConnectorConfigurationStore(pool).readConnectorConfigurations()).filter(
    (configuration) => configuration.connector === 'connector-registry-factory-b',
  );
  expect(answered).toEqual([replaced]);
});

// ------------------------------------------------------------------ readRegisteredCapabilities
// Proof for task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check
// (criterion 5): the connector-configuration registry can read every currently registered
// capability through the narrow port the composition root supplies, backed by the same
// capability store the capability registry itself reads and writes through —
// createCapabilitiesReader, over the same pool.

it("reads a capability registered through the capability registry's own real wiring, through readRegisteredCapabilities backed by the same store", async () => {
  const concept = await aFreshConcept();
  const connector = 'connector-registry-factory-connector-for-capabilities-reader';
  const capabilityRegistry = createCapabilityRegistry(pool);
  await capabilityRegistry.registerCapability({
    name: 'connector-registry-factory-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{"properties":{"id":{}}}',
    output_schema: '{}',
    timeout: 5000,
    connector,
    concept,
  });
  const registry = createConnectorConfigurationRegistry(pool, createCapabilitiesReader(pool));

  const capabilities = await registry.readRegisteredCapabilities();

  expect(capabilities).toContainEqual({ connector, input_schema: '{"properties":{"id":{}}}' });
});

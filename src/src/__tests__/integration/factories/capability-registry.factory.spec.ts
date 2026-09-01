import { randomUUID } from 'node:crypto';
import { afterEach, beforeAll, afterAll, expect, it } from 'vitest';
import type { CapabilityRegistration } from '../../../capability-registry/capability.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import {
  createConnectorConfigurationRegistry,
  createConnectorConfigurationsReader,
} from '../../../factories/connector-configuration-registry.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../../../persistence/relational-capability-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

function completeRegistration(concept: string, overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5000,
    connector: 'a-connector',
    concept,
    ...overrides,
  };
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
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM capabilities WHERE concept = ANY($1)', [conceptsWrittenByThisTest]);
    await pool.query('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
    conceptsWrittenByThisTest = [];
  }
  await pool.query("DELETE FROM connector_configurations WHERE connector LIKE 'capability-registry-factory-connector-%'");
});

async function aFreshConcept(): Promise<string> {
  const name = `capability-registry-factory-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

it('persists a registered capability as a row RelationalCapabilityStore reads back, through the real factory wiring', async () => {
  const concept = await aFreshConcept();
  const registry = createCapabilityRegistry(pool);

  const registered = await registry.registerCapability(completeRegistration(concept));

  const answered = (await new RelationalCapabilityStore(pool).readCapabilities()).filter((capability) => capability.concept === concept);
  expect(answered).toEqual([registered]);
});

it('replaces the persisted record when the same name and version register again through the real wiring', async () => {
  const concept = await aFreshConcept();
  const registry = createCapabilityRegistry(pool);
  await registry.registerCapability(completeRegistration(concept, { connector: 'an-old-connector' }));

  const replaced = await registry.registerCapability(completeRegistration(concept, { connector: 'a-new-connector' }));

  const answered = (await new RelationalCapabilityStore(pool).readCapabilities()).filter((capability) => capability.concept === concept);
  expect(answered).toEqual([replaced]);
});

it("reads a connector configuration registered through the connector-configuration registry's own real wiring, through readRegisteredConnectorConfigurations backed by the same store", async () => {
  const connector = `capability-registry-factory-connector-${randomUUID()}`;
  const connectorConfigurationRegistry = createConnectorConfigurationRegistry(pool);
  await connectorConfigurationRegistry.registerConnector({
    connector,
    configuration: { address: 'https://example.test' },
  });
  const registry = createCapabilityRegistry(pool, createConnectorConfigurationsReader(pool));

  const configurations = await registry.readRegisteredConnectorConfigurations();

  expect(configurations).toContainEqual({
    connector,
    configuration: JSON.stringify({ address: 'https://example.test' }),
  });
});

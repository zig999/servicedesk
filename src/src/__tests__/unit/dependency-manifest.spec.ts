// An audit over the dependency manifest: it declares no database driver
// beyond pg, the one this project's own standard admits (STK-05 — "database
// access goes through the pg driver... no ORM or query builder is
// introduced"), in any dependency section. pg itself joins the admitted set
// with task/relational-substrate/database-connection, which is the one
// module in the tree that imports it (constraints/the-database-is-externally-
// provisioned); every other listed driver, ORM and query builder stays
// forbidden.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { z } from 'zod';

const MANIFEST_PATH = fileURLToPath(new URL('../../../package.json', import.meta.url));

/** Database drivers, ORMs and query builders — any of these declared is a database dependency this project's own standard does not admit. 'pg' itself is deliberately absent from this list: it is the one driver STK-05 admits, and its own presence is proven admitted by the tests below rather than forbidden here. */
const DATABASE_DRIVERS = [
  'pg-native',
  'postgres',
  'mysql',
  'mysql2',
  'sqlite3',
  'better-sqlite3',
  'sql.js',
  'mongodb',
  'mongoose',
  'redis',
  'ioredis',
  'memcached',
  'cassandra-driver',
  'couchbase',
  'oracledb',
  'tedious',
  'mssql',
  'typeorm',
  'sequelize',
  'knex',
  'prisma',
  '@prisma/client',
  'drizzle-orm',
  'level',
  'leveldown',
  'rethinkdb',
  'arangojs',
  'neo4j-driver',
  'nano',
];

const dependencySections = z.object({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
});

/** Reads and parses the manifest's dependency sections, shared by every test below. */
async function readDependencySections() {
  const text = await readFile(MANIFEST_PATH, 'utf8');
  const parsed: unknown = JSON.parse(text);
  return dependencySections.parse(parsed);
}

it('the dependency manifest declares no database driver beyond the one admitted pg', async () => {
  const manifest = await readDependencySections();
  const declared = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ];

  const drivers = declared.filter((name) => DATABASE_DRIVERS.includes(name));

  expect(drivers).toEqual([]);
});

// -------------------------- database-connection criterion 5: the driver is declared and admitted

it('the dependency manifest declares pg as a dependency', async () => {
  const manifest = await readDependencySections();

  expect(manifest.dependencies).toHaveProperty('pg');
});

it('the dependency manifest declares @anthropic-ai/sdk as a dependency', async () => {
  const manifest = await readDependencySections();

  expect(manifest.dependencies).toHaveProperty('@anthropic-ai/sdk');
});

it('the dependency manifest declares fastify as a dependency', async () => {
  const manifest = await readDependencySections();

  expect(manifest.dependencies).toHaveProperty('fastify');
});


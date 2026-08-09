// An audit over the dependency manifest: it declares no database driver, in
// any dependency section (constraints/the-mvp-persists-to-no-database — the
// glossary's records land as plain JSON files, proven beside the file store).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { z } from 'zod';

const MANIFEST_PATH = fileURLToPath(new URL('../../../package.json', import.meta.url));

/** Database drivers, ORMs and query builders — any of these declared is a database dependency. */
const DATABASE_DRIVERS = [
  'pg',
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

it('the dependency manifest declares no database driver', async () => {
  const text = await readFile(MANIFEST_PATH, 'utf8');
  const parsed: unknown = JSON.parse(text);
  const manifest = dependencySections.parse(parsed);
  const declared = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ];

  const drivers = declared.filter((name) => DATABASE_DRIVERS.includes(name));

  expect(drivers).toEqual([]);
});

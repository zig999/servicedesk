import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

interface IDeployedFile {
  readonly path: string;
  readonly source: string;
}

const TARGET_SOURCE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git', 'dist']);

const PROVISIONING_FILENAME_PATTERNS: readonly RegExp[] = [
  /^dockerfile$/i,
  /^docker-compose(\..+)?\.ya?ml$/i,
  /\.tf$/i,
  /^procfile$/i,
];

async function findProvisioningArtifacts(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
      found.push(...(await findProvisioningArtifacts(join(root, entry.name))));
    } else if (PROVISIONING_FILENAME_PATTERNS.some((pattern) => pattern.test(entry.name))) {
      found.push(join(root, entry.name));
    }
  }
  return found;
}

it('the tree contains no Dockerfile, docker-compose file, Terraform script or Procfile provisioning a database service for the deployment', async () => {
  const artifacts = await findProvisioningArtifacts(TARGET_SOURCE_ROOT);

  expect(artifacts).toEqual([]);
});

const CONNECTION_URL_LITERAL_PATTERN = /postgres(?:ql)?:\/\//;
const CONNECTION_CONSTRUCTION_PATTERN = /createDatabaseConnection\(\s*([^)]*?)\s*\)/g;
const POOL_CONSTRUCTION_PATTERN = /new Pool\(/g;
const SUITE_HARNESS_BASENAME = 'vitest-global-setup.ts';

const EXPECTED_CONNECTION_FACTORY_CALL_ARGUMENTS = [
  'connectionUrl: string, poolOptions: IDatabaseConnectionPoolOptions,',
  'env.DATABASE_URL, poolOptions',
].sort();

async function* everyDeployedSourceFile(root: string): AsyncGenerator<IDeployedFile> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name) || entry.name === '__tests__') continue;
      yield* everyDeployedSourceFile(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && entry.name !== SUITE_HARNESS_BASENAME) {
      yield { path: entryPath, source: await readFile(entryPath, 'utf8') };
    }
  }
}

it('holds no connection URL literal in any file the deployment ships, so nothing hardcodes the endpoint the deployment does not provision', async () => {
  const offenders: string[] = [];
  for await (const { path, source } of everyDeployedSourceFile(TARGET_SOURCE_ROOT)) {
    if (CONNECTION_URL_LITERAL_PATTERN.test(source)) {
      offenders.push(path);
    }
  }

  expect(offenders).toEqual([]);
});

it('builds every connection the deployment opens from env.DATABASE_URL, naming no other source for the URL anywhere', async () => {
  const constructionArguments: string[] = [];
  for await (const { source } of everyDeployedSourceFile(TARGET_SOURCE_ROOT)) {
    for (const match of source.matchAll(CONNECTION_CONSTRUCTION_PATTERN)) {
      constructionArguments.push((match[1] ?? '').replace(/\s+/g, ' ').trim());
    }
  }

  expect(constructionArguments.length).toBeGreaterThan(0);
  expect([...new Set(constructionArguments)].sort()).toEqual(EXPECTED_CONNECTION_FACTORY_CALL_ARGUMENTS);
});

it('constructs the pg Pool in exactly one place across the entire deployed tree', async () => {
  let poolConstructionCount = 0;
  for await (const { source } of everyDeployedSourceFile(TARGET_SOURCE_ROOT)) {
    poolConstructionCount += (source.match(POOL_CONSTRUCTION_PATTERN) ?? []).length;
  }

  expect(poolConstructionCount).toBe(1);
});

const PRODUCTION_POOL_OPTIONS_CALLER_MARKER = /createDatabaseConnection\(\s*env\.DATABASE_URL\s*,\s*poolOptions\s*\)/;
const MAX_CONNECTIONS_LITERAL_ASSIGNMENT = /\bmaxConnections:\s*\d/;
const IDLE_TIMEOUT_MS_LITERAL_ASSIGNMENT = /\bidleTimeoutMs:\s*\d/;
const STATEMENT_TIMEOUT_MS_LITERAL_ASSIGNMENT = /\bstatementTimeoutMs:\s*\d/;

it('builds every production caller\'s poolOptions from a numeric literal nowhere in that caller\'s own file', async () => {
  const offenders: string[] = [];
  for await (const { path, source } of everyDeployedSourceFile(TARGET_SOURCE_ROOT)) {
    if (!PRODUCTION_POOL_OPTIONS_CALLER_MARKER.test(source)) continue;
    if (
      MAX_CONNECTIONS_LITERAL_ASSIGNMENT.test(source) ||
      IDLE_TIMEOUT_MS_LITERAL_ASSIGNMENT.test(source) ||
      STATEMENT_TIMEOUT_MS_LITERAL_ASSIGNMENT.test(source)
    ) {
      offenders.push(path);
    }
  }

  expect(offenders).toEqual([]);
});

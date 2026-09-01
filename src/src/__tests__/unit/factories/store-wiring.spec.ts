import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { loadEnv } from '../../../config/env.js';

const SRC_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const PERSISTENCE_DIRECTORY = join(SRC_ROOT, 'persistence');
const FACTORIES_DIRECTORY = join(SRC_ROOT, 'factories');
const CONFIG_DIRECTORY = join(SRC_ROOT, 'config');

const A_VALID_ENV_SOURCE: NodeJS.ProcessEnv = {
  DATABASE_URL: 'postgres://a-placeholder-connection-url',
  OBSERVATIONS_FIXTURE_FILE: 'an-observations-file',
  EVALUATOR_MODEL: 'an-evaluator-model',
  CONSOLIDATOR_MODEL: 'a-consolidator-model',
  CONSOLIDATOR_MAX_TOKENS: '256',
  POOL_SIZE: '3',
  DEFAULT_CONSOLIDATION_REGISTER: 'plain',
  PROMPT_VERSION: 'prompt-v1',
  PAGINATION_DEFAULT_LIMIT: '20',
  PAGINATION_MAX_LIMIT: '100',
};

const REMOVED_MODULE_BASENAMES = [
  'file-case-store.repository.ts',
  'file-glossary-store.repository.ts',
  'file-capability-store.repository.ts',
  'file-investigation-store.repository.ts',
  'json-file.ts',
];

const LEAF_FACTORY_FILES: ReadonlyArray<{ file: string; functionName: string }> = [
  { file: 'case-store.factory.ts', functionName: 'createCaseStore' },
  { file: 'glossary.factory.ts', functionName: 'createGlossary' },
  { file: 'glossary.factory.ts', functionName: 'createGlossaryQuery' },
  { file: 'capability-registry.factory.ts', functionName: 'createCapabilityRegistry' },
  { file: 'capability-registry.factory.ts', functionName: 'createCapabilityQuery' },
  { file: 'investigation-store.factory.ts', functionName: 'createInvestigationStore' },
];

const STORE_WIRING_FACTORY_FILES = [
  'case-store.factory.ts',
  'glossary.factory.ts',
  'capability-registry.factory.ts',
  'investigation-store.factory.ts',
  'case-query.factory.ts',
  'diagnose.factory.ts',
  'production-diagnose.factory.ts',
];

const STORE_DOMAIN_DIRECTORIES = ['case', 'glossary', 'capability-registry', 'investigation'];

const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

function namesFilesystemModule(specifier: string): boolean {
  return specifier === 'fs' || specifier === 'node:fs' || specifier.startsWith('fs/') || specifier.startsWith('node:fs/');
}

it("env.ts's own envSchema source declares no *_DATA_DIRECTORY field for the case, glossary, capability-registry or investigation store", async () => {
  const source = await readFile(join(CONFIG_DIRECTORY, 'env.ts'), 'utf8');

  expect(source).not.toMatch(/CASE_DATA_DIRECTORY/);
  expect(source).not.toMatch(/GLOSSARY_DATA_DIRECTORY/);
  expect(source).not.toMatch(/CAPABILITY_DATA_DIRECTORY/);
  expect(source).not.toMatch(/INVESTIGATION_DATA_DIRECTORY/);
});

it('a valid environment parses to an Env value carrying none of the four retired data-directory keys', () => {
  const env = loadEnv(A_VALID_ENV_SOURCE);

  expect(env).not.toHaveProperty('CASE_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('GLOSSARY_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('CAPABILITY_DATA_DIRECTORY');
  expect(env).not.toHaveProperty('INVESTIGATION_DATA_DIRECTORY');
});

it('the four file repositories and the file helper they shared no longer exist under persistence/', async () => {
  const files = await readdir(PERSISTENCE_DIRECTORY);

  for (const removed of REMOVED_MODULE_BASENAMES) {
    expect(files).not.toContain(removed);
  }
});

it('no module anywhere under src imports the four removed file repositories or their shared file helper, by any relative path', async () => {
  const offenders: string[] = [];
  for await (const { path, source } of everyTsFileUnder(SRC_ROOT)) {
    for (const specifier of importSpecifiersOf(source)) {
      const basename = specifier.split('/').pop() ?? specifier;
      const withExtension = basename.endsWith('.js') ? `${basename.slice(0, -3)}.ts` : basename;
      if (REMOVED_MODULE_BASENAMES.includes(withExtension)) {
        offenders.push(`${path} imports ${specifier}`);
      }
    }
  }

  expect(offenders).toEqual([]);
});

it('none of the case, glossary, capability-registry or investigation domain modules names a filesystem module', async () => {
  const offenders: string[] = [];
  for (const directory of STORE_DOMAIN_DIRECTORIES) {
    const directoryPath = join(SRC_ROOT, directory);
    const files = (await readdir(directoryPath)).filter((file) => file.endsWith('.ts'));
    for (const file of files) {
      const source = await readFile(join(directoryPath, file), 'utf8');
      for (const specifier of importSpecifiersOf(source).filter(namesFilesystemModule)) {
        offenders.push(`${directory}/${file} imports ${specifier}`);
      }
    }
  }

  expect(offenders).toEqual([]);
});

it("none of this task's own store-wiring factories names a filesystem module", async () => {
  const offenders: string[] = [];
  for (const file of STORE_WIRING_FACTORY_FILES) {
    const source = await readFile(join(FACTORIES_DIRECTORY, file), 'utf8');
    for (const specifier of importSpecifiersOf(source).filter(namesFilesystemModule)) {
      offenders.push(`factories/${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it("each of the four leaf factories' own exported function declares a DatabaseConnection parameter, never a data-directory string", async () => {
  for (const { file, functionName } of LEAF_FACTORY_FILES) {
    const source = await readFile(join(FACTORIES_DIRECTORY, file), 'utf8');
    const signature = new RegExp(`export function ${functionName}\\(([^)]*)\\)`).exec(source);
    expect(signature, `${file} declares no exported function named ${functionName}`).not.toBeNull();
    const parameters = signature?.[1] ?? '';
    expect(parameters).toMatch(/:\s*DatabaseConnection\b/);
    expect(parameters).not.toMatch(/DataDirectory/i);
  }
});

it("no store-wiring factory's own source declares a data-directory parameter or field, anywhere", async () => {
  const offenders: string[] = [];
  for (const file of STORE_WIRING_FACTORY_FILES) {
    const source = await readFile(join(FACTORIES_DIRECTORY, file), 'utf8');
    if (/DataDirectory/i.test(source)) {
      offenders.push(file);
    }
  }

  expect(offenders).toEqual([]);
});

it("diagnose.factory.ts's own DiagnoseDependencies and production-diagnose.factory.ts's own ProductionDiagnoseDependencies each declare a connection field typed DatabaseConnection", async () => {
  for (const file of ['diagnose.factory.ts', 'production-diagnose.factory.ts']) {
    const source = await readFile(join(FACTORIES_DIRECTORY, file), 'utf8');
    expect(source).toMatch(/readonly connection:\s*DatabaseConnection;/);
  }
});

it('the process entry point builds the diagnose HTTP server from the environment alone, passing no second argument', async () => {
  const source = await readFile(join(SRC_ROOT, 'index.ts'), 'utf8');

  expect(source).toMatch(/createDiagnoseHttpServer\(\s*env\s*\)/);
});

it("createDiagnoseHttpServer's own exported function takes exactly one parameter, env, and builds its one connection from env.DATABASE_URL alone, naming no data-directory field of Env", async () => {
  const source = await readFile(join(FACTORIES_DIRECTORY, 'diagnose-server.factory.ts'), 'utf8');

  expect(source).toMatch(/export async function createDiagnoseHttpServer\(\s*env:\s*Env\s*\)/);
  expect(source).toMatch(/createDatabaseConnection\(\s*env\.DATABASE_URL\s*\)/);
  expect(source).not.toMatch(/DataDirectory/i);
});

interface ITsFile {
  readonly path: string;
  readonly source: string;
}

async function* everyTsFileUnder(root: string): AsyncGenerator<ITsFile> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* everyTsFileUnder(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      yield { path: entryPath, source: await readFile(entryPath, 'utf8') };
    }
  }
}

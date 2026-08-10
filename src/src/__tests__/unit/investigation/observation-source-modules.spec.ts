// An audit over the observation-source modules under src/investigation:
// evidence-result.ts, observation-source.port.ts and
// fake-observation-source.adapter.ts import no framework, no driver and no
// provider client, and nothing of the standard library either, so
// infrastructure cannot be reached from them directly
// (constraints/the-domain-depends-on-no-infrastructure) — and the fake is
// the only concrete class implementing IObservationSource
// (task/evidence-collection/observation-source-port, criterion 2). The
// implementation record names this automated sweep as deferred to this
// proof rather than silently assumed already covered by inspection alone.
// The "only concrete adapter" check reads the whole shared investigation
// directory but scopes by which interface a class implements, not by a
// raw ".adapter.ts" file count — that directory is shared with
// task/hypothesis-judgment/hypothesis-evaluator-port's own fake adapter,
// and a directory-wide file count would answer for both ports at once.
// (Retroactive correction: this check originally counted every .adapter.ts
// file in the directory, which held only by accident of there being one
// task delivered here at the time; it broke the moment a legitimate
// sibling fake landed beside it, so it is rescoped here to what criterion 2
// actually requires — a task-scoped fact, not a directory-wide one.)
import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));

/** Frameworks, database drivers and provider clients — what criterion 2 forbids the fake adapter to import. */
const FORBIDDEN_PACKAGES = [
  'fastify',
  'express',
  'koa',
  '@hapi/hapi',
  '@nestjs/common',
  '@nestjs/core',
  'pg',
  'postgres',
  'mysql',
  'mysql2',
  'sqlite3',
  'better-sqlite3',
  'mongodb',
  'mongoose',
  'redis',
  'ioredis',
  'typeorm',
  'sequelize',
  'knex',
  'prisma',
  '@prisma/client',
  'drizzle-orm',
  '@anthropic-ai/sdk',
  'openai',
  'aws-sdk',
  '@aws-sdk/client-s3',
  '@google-cloud/storage',
  '@azure/identity',
  '@modelcontextprotocol/sdk',
];

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier one source text imports. */
function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

/** Every .ts file directly under the investigation directory. */
async function investigationFiles(): Promise<readonly string[]> {
  const files = (await readdir(INVESTIGATION_DIRECTORY)).filter((file) => file.endsWith('.ts'));
  if (files.length === 0) {
    throw new Error('no investigation module found to audit — the pass would be vacuous');
  }
  return files;
}

/** Reads every observation-source module's import specifiers, keyed by file name. */
async function investigationImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of await investigationFiles()) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    imports.set(file, importSpecifiersOf(source));
  }
  return imports;
}

/** Whether a specifier names a Node standard-library module, prefixed or bare. */
function isStandardLibrary(specifier: string): boolean {
  return specifier.startsWith('node:') || builtinModules.includes(specifier);
}

/** Whether a specifier names one of the forbidden packages, or a path inside one. */
function isForbiddenPackage(specifier: string): boolean {
  return FORBIDDEN_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

/** Every offending import, named by file and specifier so a failure says where. */
function offendersAmong(
  imports: ReadonlyMap<string, readonly string[]>,
  offends: (specifier: string) => boolean,
): string[] {
  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    for (const specifier of specifiers.filter(offends)) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }
  return offenders;
}

it('the observation-source modules import no framework, no driver and no provider client', async () => {
  const imports = await investigationImports();

  const offenders = offendersAmong(imports, isForbiddenPackage);

  expect(offenders).toEqual([]);
});

it('the observation-source modules import nothing from the standard library, so infrastructure cannot be reached from them directly', async () => {
  const imports = await investigationImports();

  const offenders = offendersAmong(imports, isStandardLibrary);

  expect(offenders).toEqual([]);
});

it('ships exactly one concrete class implementing IObservationSource', async () => {
  const files = await investigationFiles();

  const implementers: string[] = [];
  for (const file of files) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    if (/implements\s+IObservationSource\b/.test(source)) {
      implementers.push(file);
    }
  }

  expect(implementers).toEqual(['fake-observation-source.adapter.ts']);
});

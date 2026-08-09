// An audit over the vocabulary modules under src/glossary: they import no
// framework, no driver and no provider client — and nothing of the standard
// library either, so file persistence cannot be reached from a vocabulary
// module directly and arrives only through the store port
// (constraints/the-domain-depends-on-no-infrastructure).
import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const VOCABULARY_DIRECTORY = fileURLToPath(new URL('../../../glossary/', import.meta.url));

/** Frameworks, database drivers and provider clients — what criterion 6 forbids a vocabulary module to import. */
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

/** Reads every vocabulary module's import specifiers, keyed by file name; refuses an empty audit. */
async function vocabularyImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const files = (await readdir(VOCABULARY_DIRECTORY)).filter((file) => file.endsWith('.ts'));
  if (files.length === 0) {
    throw new Error('no vocabulary module found to audit — the pass would be vacuous');
  }
  const imports = new Map<string, readonly string[]>();
  for (const file of files) {
    const source = await readFile(join(VOCABULARY_DIRECTORY, file), 'utf8');
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

it('the vocabulary modules import no framework, no driver and no provider client', async () => {
  const imports = await vocabularyImports();

  const offenders = offendersAmong(imports, isForbiddenPackage);

  expect(offenders).toEqual([]);
});

it('the vocabulary modules import nothing from the standard library, so persistence reaches them only through the store port', async () => {
  const imports = await vocabularyImports();

  const offenders = offendersAmong(imports, isStandardLibrary);

  expect(offenders).toEqual([]);
});

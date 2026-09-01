import { readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));
const ERRORS_DIRECTORY = fileURLToPath(new URL('../../../errors/', import.meta.url));

const INVESTIGATION_FACTORY_FILES = [
  'subject.ts',
  'cost.ts',
  'durations.ts',
  'investigation.ts',
  'investigation-factory.ts',
] as const;

const ERROR_FILE = 'investigation-not-buildable.error.ts';

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

const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

async function investigationFactoryImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of INVESTIGATION_FACTORY_FILES) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    imports.set(file, importSpecifiersOf(source));
  }
  const errorSource = await readFile(join(ERRORS_DIRECTORY, ERROR_FILE), 'utf8');
  imports.set(ERROR_FILE, importSpecifiersOf(errorSource));
  return imports;
}

function isStandardLibrary(specifier: string): boolean {
  return specifier.startsWith('node:') || builtinModules.includes(specifier);
}

function isForbiddenPackage(specifier: string): boolean {
  return FORBIDDEN_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

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

it('subject.ts, cost.ts, durations.ts, investigation.ts, investigation-factory.ts and investigation-not-buildable.error.ts import no framework, driver or provider client', async () => {
  const imports = await investigationFactoryImports();

  const offenders = offendersAmong(imports, isForbiddenPackage);

  expect(offenders).toEqual([]);
});

it('subject.ts, cost.ts, durations.ts, investigation.ts, investigation-factory.ts and investigation-not-buildable.error.ts import nothing from the standard library, so infrastructure cannot be reached from any of them directly', async () => {
  const imports = await investigationFactoryImports();

  const offenders = offendersAmong(imports, isStandardLibrary);

  expect(offenders).toEqual([]);
});

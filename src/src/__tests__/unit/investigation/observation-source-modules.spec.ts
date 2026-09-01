import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));

const KNOWN_INFRASTRUCTURE_ADAPTERS = [
  'anthropic-assessment-consolidator.adapter.ts',
  'anthropic-hypothesis-evaluator.adapter.ts',
];

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

async function investigationFiles(): Promise<readonly string[]> {
  const files = (await readdir(INVESTIGATION_DIRECTORY)).filter((file) => file.endsWith('.ts'));
  if (files.length === 0) {
    throw new Error('no investigation module found to audit — the pass would be vacuous');
  }
  return files;
}

async function investigationImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of await investigationFiles()) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    imports.set(file, importSpecifiersOf(source));
  }
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

it('the observation-source modules import no framework, no driver and no provider client', async () => {
  const imports = await investigationImports();

  const offenders = offendersAmong(imports, isForbiddenPackage).filter(
    (offender) => !KNOWN_INFRASTRUCTURE_ADAPTERS.some((file) => offender.startsWith(`${file} imports`)),
  );

  expect(offenders).toEqual([]);
});

it('the observation-source modules import nothing from the standard library, so infrastructure cannot be reached from them directly', async () => {
  const imports = await investigationImports();

  const offenders = offendersAmong(imports, isStandardLibrary);

  expect(offenders).toEqual([]);
});

it('ships exactly two concrete classes implementing IObservationSource: the fake, and this epic\'s own generic HTTP adapter', async () => {
  const files = await investigationFiles();

  const implementers: string[] = [];
  for (const file of files) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    if (/implements\s+IObservationSource\b/.test(source)) {
      implementers.push(file);
    }
  }

  expect(implementers.slice().sort()).toEqual(
    ['fake-observation-source.adapter.ts', 'http-declarative-observation-source.adapter.ts'].sort(),
  );
});

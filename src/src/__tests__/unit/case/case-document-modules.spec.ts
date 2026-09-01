import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import * as caseModule from '../../../case/case.js';

const CASE_DIRECTORY = fileURLToPath(new URL('../../../case/', import.meta.url));

const ERROR_MODULES = [
  'invalid-case-document.error.ts',
  'incoherent-case.error.ts',
].map((file) => fileURLToPath(new URL(`../../../errors/${file}`, import.meta.url)));

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

async function documentModelImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const files = (await readdir(CASE_DIRECTORY)).filter((file) => file.endsWith('.ts'));
  if (files.length === 0) {
    throw new Error('no document-model module found to audit — the pass would be vacuous');
  }
  const imports = new Map<string, readonly string[]>();
  for (const file of files) {
    const source = await readFile(join(CASE_DIRECTORY, file), 'utf8');
    imports.set(file, importSpecifiersOf(source));
  }
  for (const errorModule of ERROR_MODULES) {
    const source = await readFile(errorModule, 'utf8');
    imports.set(basename(errorModule), importSpecifiersOf(source));
  }
  return imports;
}

function isForbiddenPackage(specifier: string): boolean {
  return FORBIDDEN_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

function reachesOutsideTheModel(specifier: string): boolean {
  return !specifier.startsWith('./') && !specifier.startsWith('../');
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

it("the document model's modules import no framework, no driver and no provider client", async () => {
  const imports = await documentModelImports();

  const offenders = offendersAmong(imports, isForbiddenPackage);

  expect(offenders).toEqual([]);
});

it("the document model's modules import nothing but one another, so no second store is reachable from the aggregate", async () => {
  const imports = await documentModelImports();

  const offenders = offendersAmong(imports, reachesOutsideTheModel);

  expect(offenders).toEqual([]);
});

it('case.ts exports no CASE_DOCUMENT_ENDING or any other file-name-medium constant, CASE_VERSION_STATES the only runtime value it declares', () => {
  const runtimeExports = Object.keys(caseModule).sort();

  expect(runtimeExports).toEqual(['CASE_VERSION_STATES']);
});

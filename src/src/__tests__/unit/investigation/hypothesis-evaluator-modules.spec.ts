import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));

const HYPOTHESIS_EVALUATOR_FILES = [
  'verdict.ts',
  'evaluation-reason.ts',
  'citation.ts',
  'hypothesis-evaluator.port.ts',
  'fake-hypothesis-evaluator.adapter.ts',
] as const;

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

async function hypothesisEvaluatorImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of HYPOTHESIS_EVALUATOR_FILES) {
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

it('the hypothesis-evaluator modules import no LLM or provider client, and no framework or driver beside them', async () => {
  const imports = await hypothesisEvaluatorImports();

  const offenders = offendersAmong(imports, isForbiddenPackage);

  expect(offenders).toEqual([]);
});

it('the hypothesis-evaluator modules import nothing from the standard library, so infrastructure cannot be reached from them directly', async () => {
  const imports = await hypothesisEvaluatorImports();

  const offenders = offendersAmong(imports, isStandardLibrary);

  expect(offenders).toEqual([]);
});

it('IHypothesisEvaluator is implemented only by its own adapters — the fake and the production Anthropic adapter — and nothing else in the shared directory', async () => {
  const files = (await readdir(INVESTIGATION_DIRECTORY)).filter((file) => file.endsWith('.ts'));

  const implementers: string[] = [];
  for (const file of files) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    if (/implements\s+IHypothesisEvaluator\b/.test(source)) {
      implementers.push(file);
    }
  }

  expect(implementers.sort()).toEqual(['anthropic-hypothesis-evaluator.adapter.ts', 'fake-hypothesis-evaluator.adapter.ts']);
});

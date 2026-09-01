import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));

const ASSESSMENT_CONSOLIDATOR_FILES = [
  'consolidation-register.ts',
  'assessment-consolidator.port.ts',
  'fake-assessment-consolidator.adapter.ts',
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

async function assessmentConsolidatorImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of ASSESSMENT_CONSOLIDATOR_FILES) {
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

it('the assessment-consolidator modules import no LLM or provider client, and no framework or driver beside them', async () => {
  const imports = await assessmentConsolidatorImports();

  const offenders = offendersAmong(imports, isForbiddenPackage);

  expect(offenders).toEqual([]);
});

it('the assessment-consolidator modules import nothing from the standard library, so infrastructure cannot be reached from them directly', async () => {
  const imports = await assessmentConsolidatorImports();

  const offenders = offendersAmong(imports, isStandardLibrary);

  expect(offenders).toEqual([]);
});

it("the assessment-consolidator modules import nothing from the case document module, so no field there could carry a hypothesis's own criterion or the case's when_to_use into consolidation", async () => {
  const imports = await assessmentConsolidatorImports();

  const caseDocumentImports = [...imports.values()].flat().filter((specifier) => specifier.endsWith('/case/case.js'));

  expect(caseDocumentImports).toEqual([]);
});

it('ships exactly two concrete classes implementing IAssessmentConsolidator: the fake and the live Anthropic-backed adapter', async () => {
  const files = (await readdir(INVESTIGATION_DIRECTORY)).filter((file) => file.endsWith('.ts'));

  const implementers: string[] = [];
  for (const file of files) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    if (/implements\s+IAssessmentConsolidator\b/.test(source)) {
      implementers.push(file);
    }
  }

  expect(implementers.sort()).toEqual(['anthropic-assessment-consolidator.adapter.ts', 'fake-assessment-consolidator.adapter.ts']);
});

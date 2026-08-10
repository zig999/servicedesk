// An audit over the two files task/assessment-drafting/draft-assessment-text
// delivered under src/investigation: assessment.ts and
// draft-assessment-text.ts import no framework, driver or provider client
// and nothing of the standard library either, so infrastructure cannot be
// reached from them directly
// (constraints/the-domain-depends-on-no-infrastructure), and
// draft-assessment-text.ts imports nothing at all from the case document
// module, so no field there could carry a hypothesis's own criterion or the
// case's when_to_use into drafting — the structural half of "drafting
// receives only the narrowed input a prior step assembled, never the case's
// own hypotheses or criteria" that no call made at runtime could exercise,
// since draftAssessment's own signature never accepts a Case or a
// Hypothesis to begin with. Scoped to this task's own two named files rather
// than to the whole investigation directory, since that directory is shared
// with every other task's own modules, and a directory-wide import sweep
// would answer for all of them at once.
import { readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));

/** Exactly the two files this task's implementation record lists under `files`. */
const DRAFT_ASSESSMENT_TEXT_FILES = ['assessment.ts', 'draft-assessment-text.ts'] as const;

/** LLM and provider clients, and the frameworks and drivers beside them — what criterion 4 and the no-infrastructure constraint forbid these files to import. */
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

/** Reads this task's own two modules' import specifiers, keyed by file name. */
async function draftAssessmentTextImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of DRAFT_ASSESSMENT_TEXT_FILES) {
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

it('assessment.ts and draft-assessment-text.ts import no framework, driver or provider client', async () => {
  const imports = await draftAssessmentTextImports();

  const offenders = offendersAmong(imports, isForbiddenPackage);

  expect(offenders).toEqual([]);
});

it('assessment.ts and draft-assessment-text.ts import nothing from the standard library, so infrastructure cannot be reached from them directly', async () => {
  const imports = await draftAssessmentTextImports();

  const offenders = offendersAmong(imports, isStandardLibrary);

  expect(offenders).toEqual([]);
});

it("draft-assessment-text.ts imports nothing at all from the case document module, so no field there could carry a hypothesis's own criterion or the case's when_to_use into drafting", async () => {
  const source = await readFile(join(INVESTIGATION_DIRECTORY, 'draft-assessment-text.ts'), 'utf8');
  const specifiers = importSpecifiersOf(source);

  const caseDocumentImports = specifiers.filter((specifier) => specifier.endsWith('/case/case.js'));

  expect(caseDocumentImports).toEqual([]);
});

// An audit over exactly the three files task/assessment-consolidation/assessment-consolidator-port-and-fake
// delivered under src/investigation: consolidation-register.ts,
// assessment-consolidator.port.ts and fake-assessment-consolidator.adapter.ts
// import no LLM or provider client and nothing of the standard library
// either, so infrastructure cannot be reached from them directly
// (constraints/the-domain-depends-on-no-infrastructure, criterion 4's own
// clause) — and FakeAssessmentConsolidator is the only concrete class in the
// shared investigation directory implementing IAssessmentConsolidator
// (constraints/consolidation-runs-behind-a-port, criterion 3). Scoped to
// this task's own named files for the import-purity checks rather than to
// the whole investigation directory, since that directory is shared with
// every other task's own modules and a directory-wide sweep would answer for
// all of them at once — mirroring hypothesis-evaluator-modules.spec.ts's own
// own-file-list pattern rather than widening observation-source-modules.spec.ts's
// existing directory-wide sweep, which already covers these same three files
// for import purity but says nothing about which class implements which
// port. The "exactly one implementer" check reads the whole shared directory
// on purpose, the same way hypothesis-evaluator-modules.spec.ts's own does:
// a class implementing IAssessmentConsolidator from outside this task's own
// three files would still be a second implementer this check must catch.
import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));

/** Exactly the files this task's implementation record lists under `files`. */
const ASSESSMENT_CONSOLIDATOR_FILES = [
  'consolidation-register.ts',
  'assessment-consolidator.port.ts',
  'fake-assessment-consolidator.adapter.ts',
] as const;

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

/** Reads this task's own three modules' import specifiers, keyed by file name. */
async function assessmentConsolidatorImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of ASSESSMENT_CONSOLIDATOR_FILES) {
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

it('ships exactly one concrete class implementing IAssessmentConsolidator', async () => {
  const files = (await readdir(INVESTIGATION_DIRECTORY)).filter((file) => file.endsWith('.ts'));

  const implementers: string[] = [];
  for (const file of files) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    if (/implements\s+IAssessmentConsolidator\b/.test(source)) {
      implementers.push(file);
    }
  }

  expect(implementers).toEqual(['fake-assessment-consolidator.adapter.ts']);
});

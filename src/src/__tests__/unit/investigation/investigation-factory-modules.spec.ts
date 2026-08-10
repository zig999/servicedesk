// An audit over the six files task/investigation-lifecycle/investigation-factory
// delivered: subject.ts, cost.ts, durations.ts, investigation.ts and
// investigation-factory.ts under src/investigation, plus
// investigation-not-buildable.error.ts under src/errors. They import no
// framework, driver or provider client and nothing of the standard library
// either, so infrastructure cannot be reached from any of them directly
// (constraints/the-domain-depends-on-no-infrastructure, criterion 5: "the
// factory module imports no framework, driver or provider client"). Scoped
// to this task's own six named files rather than to the whole investigation
// directory, since that directory is shared with every other task's own
// modules and a directory-wide sweep would answer for all of them at once —
// the same scoping draft-assessment-text-modules.spec.ts already establishes
// for its own two files, and the same helpers, copied rather than imported
// from that sibling audit and from case-document-modules.spec.ts (disclosed
// as a divergence in this proof's own record: importing a spec from a spec
// registers its tests twice under vitest, and extracting a shared helper
// module would rewrite a prior task's proof, which is not this proof's to
// touch).
import { readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));
const ERRORS_DIRECTORY = fileURLToPath(new URL('../../../errors/', import.meta.url));

/** Exactly the five investigation-directory files this task's implementation record lists under `files`. */
const INVESTIGATION_FACTORY_FILES = [
  'subject.ts',
  'cost.ts',
  'durations.ts',
  'investigation.ts',
  'investigation-factory.ts',
] as const;

/** The one errors-directory file this task's implementation record lists under `files`, swept alongside the five above. */
const ERROR_FILE = 'investigation-not-buildable.error.ts';

/** LLM and provider clients, and the frameworks and drivers beside them — what criterion 5 and the no-infrastructure constraint forbid these files to import. */
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

/** Reads this task's own six modules' import specifiers, keyed by file name. */
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

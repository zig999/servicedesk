// An audit over exactly the five files task/hypothesis-judgment/hypothesis-evaluator-port
// delivered under src/investigation: verdict.ts, evaluation-reason.ts,
// citation.ts, hypothesis-evaluator.port.ts and
// fake-hypothesis-evaluator.adapter.ts import no LLM or provider client and
// nothing of the standard library either, so infrastructure cannot be
// reached from them directly (constraints/the-domain-depends-on-no-infrastructure,
// criterion 2's own clause) — and FakeHypothesisEvaluator is the only
// concrete class among them implementing IHypothesisEvaluator
// (constraints/judgment-runs-behind-a-port). Scoped to this task's own named
// files rather than to the whole investigation directory, since that
// directory is shared with task/evidence-collection/observation-source-port's
// own fake adapter, and a directory-wide "exactly one .adapter.ts" count
// would answer for both ports at once.
import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));

/** Exactly the files this task's implementation record lists under `files`. */
const HYPOTHESIS_EVALUATOR_FILES = [
  'verdict.ts',
  'evaluation-reason.ts',
  'citation.ts',
  'hypothesis-evaluator.port.ts',
  'fake-hypothesis-evaluator.adapter.ts',
] as const;

/** LLM and provider clients, and the frameworks and drivers beside them — what criterion 2 and the no-infrastructure constraint forbid these files to import. */
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

/** Reads this task's own five modules' import specifiers, keyed by file name. */
async function hypothesisEvaluatorImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const file of HYPOTHESIS_EVALUATOR_FILES) {
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

it('ships exactly one concrete class implementing IHypothesisEvaluator', async () => {
  const files = (await readdir(INVESTIGATION_DIRECTORY)).filter((file) => file.endsWith('.ts'));

  const implementers: string[] = [];
  for (const file of files) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    if (/implements\s+IHypothesisEvaluator\b/.test(source)) {
      implementers.push(file);
    }
  }

  expect(implementers).toEqual(['fake-hypothesis-evaluator.adapter.ts']);
});

// Proof for task/relational-substrate/database-connection.
//
// Criterion 4 — "The connection module sits with the persistence adapters, and an audit of the
// case, glossary, capability-registry and investigation modules' imports finds no driver and no
// framework among them." — is proven below by sweeping every module under all four directories,
// rather than relying on the several pre-existing, per-task-scoped audits beside this one (e.g.
// vocabulary-modules.spec.ts, case-document-modules.spec.ts, investigation-factory-modules.spec.ts),
// none of which is a total sweep of its own directory and none of which answers for
// capability-registry at all: this file is what actually closes criterion 4 as this task states it.
//
// It also excludes the two shapes this task's own Notes flag as UNDERDETERMINED, from the
// specification, and unreached by criterion 4's own wording:
//   1. a domain module importing the connection module directly rather than through a port — the
//      second test below fails over exactly that shape.
//   2. a domain module importing the LLM provider client directly — the third test below fails
//      over exactly that shape, for every domain module except the two adapters this codebase
//      already, legitimately, wires the provider through
//      (anthropic-hypothesis-evaluator.adapter.ts, anthropic-assessment-consolidator.adapter.ts —
//      each is the one file its own directory comment already names as the sole exception, and each
//      implements a published port precisely so the domain calling through that port never imports
//      the provider itself).
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/** The four directories criterion 4 names, each swept whole. */
const AUDITED_DIRECTORIES = ['case', 'glossary', 'capability-registry', 'investigation'] as const;

/** Files inside investigation/ that legitimately reach the LLM provider, as the sole production adapters implementing its two ports — excluded only from the provider-client half of this audit, never from the driver/framework half. */
const PROVIDER_ADAPTER_EXCEPTIONS = new Set([
  'anthropic-hypothesis-evaluator.adapter.ts',
  'anthropic-assessment-consolidator.adapter.ts',
]);

/** Database drivers and HTTP frameworks — what criterion 4 itself forbids among these modules' imports. */
const FORBIDDEN_DRIVERS_AND_FRAMEWORKS = [
  'fastify', 'express', 'koa', '@hapi/hapi', '@nestjs/common', '@nestjs/core',
  'pg', 'pg-native', 'postgres', 'mysql', 'mysql2', 'sqlite3', 'better-sqlite3',
  'mongodb', 'mongoose', 'redis', 'ioredis', 'typeorm', 'sequelize', 'knex',
  'prisma', '@prisma/client', 'drizzle-orm',
];

/** The LLM provider client — what the specification's own "no provider client" clause forbids, a gap criterion 4 leaves unreached. */
const PROVIDER_CLIENT_PACKAGE = '@anthropic-ai/sdk';

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier one source text imports. */
function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

/** Reads every .ts module's import specifiers under each of the four audited directories, keyed by "<directory>/<file>"; refuses an empty audit. */
async function domainModuleImports(): Promise<ReadonlyMap<string, readonly string[]>> {
  const imports = new Map<string, readonly string[]>();
  for (const directory of AUDITED_DIRECTORIES) {
    const directoryPath = fileURLToPath(new URL(`../../${directory}/`, import.meta.url));
    const files = (await readdir(directoryPath)).filter((file) => file.endsWith('.ts'));
    for (const file of files) {
      const source = await readFile(join(directoryPath, file), 'utf8');
      imports.set(`${directory}/${file}`, importSpecifiersOf(source));
    }
  }
  if (imports.size === 0) {
    throw new Error('no domain module found to audit — the pass would be vacuous');
  }
  return imports;
}

/** Whether a specifier names one of the given packages, or a path inside one. */
function namesOneOf(specifier: string, packages: readonly string[]): boolean {
  return packages.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

/** Whether a specifier reaches the connection module this task delivers, by any relative path ending in it. */
function reachesTheConnectionModule(specifier: string): boolean {
  return /(^|\/)database-connection(\.js)?$/.test(specifier);
}

it('the case, glossary, capability-registry and investigation modules import no driver and no framework', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    for (const specifier of specifiers.filter((s) => namesOneOf(s, FORBIDDEN_DRIVERS_AND_FRAMEWORKS))) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it('none of these modules imports the connection module directly, by any relative path', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    for (const specifier of specifiers.filter(reachesTheConnectionModule)) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it('none of these modules imports the LLM provider client directly, except the two adapters that implement a published port against it', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    if (PROVIDER_ADAPTER_EXCEPTIONS.has(file.split('/')[1] ?? '')) continue;
    for (const specifier of specifiers.filter((s) => namesOneOf(s, [PROVIDER_CLIENT_PACKAGE]))) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it('the connection module sits under persistence/, beside the file-backed repositories, rather than under any of the four audited domain directories', async () => {
  const persistenceDirectory = fileURLToPath(new URL('../../persistence/', import.meta.url));

  const persistenceFiles = await readdir(persistenceDirectory);

  expect(persistenceFiles).toContain('database-connection.ts');
  expect(persistenceFiles).toContain('file-case-store.repository.ts');
});

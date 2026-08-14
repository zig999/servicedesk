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
//
// Extended for task/connector-registration/connector-configuration-persistence's own criterion 2 —
// "No module under the domain layer ... imports the connector-configuration store, its
// persistence driver, or any HTTP client package directly" — which names the same domain layer
// this file already sweeps in full: the fifth test below fails if any of these modules imports the
// connector-configuration store or its relational adapter, by any relative path, and the sixth
// fails if any imports a common HTTP client package. This task introduced no HTTP client package
// at all, so that test currently passes over an empty intersection; it stands as the guard should
// one be added to a domain module later.
//
// Extended again for task/http-observation-runtime/descriptor-placeholder-resolver's own
// criterion 5 — "No module under the domain layer ... imports this translation module, its
// secret-reading mechanism, or any HTTP-request-building package directly." The
// HTTP-request-building-package half is already the sixth test above (HTTP_CLIENT_PACKAGES); the
// seventh test below fails if any of these modules imports the connector-request-resolver module
// or its call-descriptor vocabulary, by any relative path, and the eighth fails if any imports
// either error that resolver raises. Its own credential-reading mechanism
// (resolveCredentialPlaceholder) is never itself exported, so importing the resolver module is the
// only way to reach it — the seventh test already covers this.
// Its own Notes flag a gap those import-specifier sweeps cannot see on their own: a domain module
// could reach this task's http-connector module through a dynamic lookup, a global registry or a
// string-keyed service locator, none of which is a static "from '...'" specifier at all. The ninth
// test below scans each domain module's raw source for any mention of the resolver's own module
// name or exported functions, however it might be referenced, and the tenth confirms the one real
// port at the domain boundary, IObservationSource, is still declared as an interface — together
// they are what this task's own Notes ask a test to confirm beyond the absence of a static import.
//
// Extended again for task/http-observation-runtime/http-declarative-observation-source's own
// criterion 10 — "The adapter and any HTTP client package it uses live outside the domain layer,
// and no domain module imports either directly." A new test below the tenth fails if any of these
// modules imports that task's own production adapter by relative path, bypassing the unchanged
// IObservationSource port. That same adapter is exactly the "future HTTP adapter" the seventh and
// ninth tests' own module-under-test already anticipated as its one legitimate consumer, so both
// are rescoped to exclude it by name rather than report its own, intended composition as an offense
// (see the exclusion constant's own comment below for the retroactive-correction reasoning).
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

/** Common HTTP client packages — what task/connector-registration/connector-configuration-persistence's own criterion 2 forbids directly, beyond the driver names FORBIDDEN_DRIVERS_AND_FRAMEWORKS already lists. */
const HTTP_CLIENT_PACKAGES = ['axios', 'node-fetch', 'got', 'undici', 'ws', 'superagent', 'request'];

/** Whether a specifier reaches the connector-configuration store task/connector-registration/connector-configuration-persistence adds, or its relational adapter, by any relative path. */
function reachesTheConnectorConfigurationStore(specifier: string): boolean {
  return (
    /(^|\/)connector-configuration-store\.port(\.js)?$/.test(specifier) ||
    /(^|\/)relational-connector-configuration-store\.repository(\.js)?$/.test(specifier)
  );
}

/** Whether a specifier reaches task/http-observation-runtime/descriptor-placeholder-resolver's own translation module or its call-descriptor vocabulary, by any relative path. */
function reachesTheConnectorRequestResolver(specifier: string): boolean {
  return (
    /(^|\/)connector-request-resolver(\.js)?$/.test(specifier) ||
    /(^|\/)connector-call-descriptor(\.js)?$/.test(specifier)
  );
}

/** Whether a specifier reaches either error connector-request-resolver.ts raises, by any relative path. */
function reachesTheConnectorPlaceholderErrors(specifier: string): boolean {
  return (
    /(^|\/)incomplete-connector-call-descriptor\.error(\.js)?$/.test(specifier) ||
    /(^|\/)connector-placeholder-not-resolved\.error(\.js)?$/.test(specifier)
  );
}

/** Any bare mention of the connector-request-resolver module or its own exports a domain module's raw source could carry — a dynamic lookup, a global registry, or a string-keyed service locator, none of which is a static import specifier the sweep above would ever see. */
const CONNECTOR_REQUEST_RESOLVER_BYPASS_MENTIONS = [
  'http-connector',
  'connector-request-resolver',
  'connector-call-descriptor',
  'resolveConnectorRequest',
  'asConnectorCallDescriptor',
];

/**
 * task/http-observation-runtime/http-declarative-observation-source's own production adapter —
 * exactly the "future HTTP adapter" connector-request-resolver.ts's own header comment, and this
 * file's own header above, already anticipated as the one legitimate importer of the
 * connector-request-resolver module and its call-descriptor vocabulary. Excluded from the
 * reachesTheConnectorRequestResolver sweep and the bypass-mention scan below, the same way
 * PROVIDER_ADAPTER_EXCEPTIONS excludes the two provider adapters from the provider-client sweep
 * above: this adapter composes resolveConnectorRequest by design, so flagging its own, intended
 * import as an offense would require in code exactly what that task's own criteria state.
 * (Retroactive correction, by task/http-observation-runtime/http-declarative-observation-source's
 * own test-author: this adapter landed after the two checks below were written, and both would
 * otherwise report its own, entirely intended, imports and mentions as offenses the moment this
 * file existed — the same shape of correction observation-source-modules.spec.ts's own two
 * retroactive corrections already record for their own directory-wide sweeps.)
 */
const HTTP_DECLARATIVE_OBSERVATION_SOURCE_ADAPTER_KEY = 'investigation/http-declarative-observation-source.adapter.ts';

/** Reads every .ts module's whole raw source under each of the four audited directories, keyed by "<directory>/<file>" — unlike domainModuleImports, this keeps the full text rather than only the extracted import specifiers, since a bypass this task's own Notes flag need not appear as one. */
async function domainModuleSources(): Promise<ReadonlyMap<string, string>> {
  const sources = new Map<string, string>();
  for (const directory of AUDITED_DIRECTORIES) {
    const directoryPath = fileURLToPath(new URL(`../../${directory}/`, import.meta.url));
    const files = (await readdir(directoryPath)).filter((file) => file.endsWith('.ts'));
    for (const file of files) {
      sources.set(`${directory}/${file}`, await readFile(join(directoryPath, file), 'utf8'));
    }
  }
  return sources;
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

it('none of these modules imports the connector-configuration store or its relational adapter, by any relative path', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    for (const specifier of specifiers.filter(reachesTheConnectorConfigurationStore)) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it('none of these modules imports an HTTP client package', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    for (const specifier of specifiers.filter((s) => namesOneOf(s, HTTP_CLIENT_PACKAGES))) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it('the connection module sits under persistence/, beside the relational store repositories, rather than under any of the four audited domain directories', async () => {
  const persistenceDirectory = fileURLToPath(new URL('../../persistence/', import.meta.url));

  const persistenceFiles = await readdir(persistenceDirectory);

  expect(persistenceFiles).toContain('database-connection.ts');
  expect(persistenceFiles).toContain('relational-case-store.repository.ts');
});

it('none of these modules imports the connector-request-resolver module or its call-descriptor vocabulary, by any relative path, except this epic\'s own legitimate HTTP adapter', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    if (file === HTTP_DECLARATIVE_OBSERVATION_SOURCE_ADAPTER_KEY) continue;
    for (const specifier of specifiers.filter(reachesTheConnectorRequestResolver)) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it('none of these modules imports either error the connector-request-resolver raises, by any relative path', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    for (const specifier of specifiers.filter(reachesTheConnectorPlaceholderErrors)) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it("none of these modules holds any mention of the http-connector module or its exports outside a static import — a dynamic lookup, a global registry, or a string-keyed service locator would not show up as an import specifier at all, which is exactly the gap this task's own Notes call out — except this epic's own legitimate HTTP adapter", async () => {
  const sources = await domainModuleSources();

  const offenders: string[] = [];
  for (const [file, source] of sources) {
    if (file === HTTP_DECLARATIVE_OBSERVATION_SOURCE_ADAPTER_KEY) continue;
    for (const mention of CONNECTOR_REQUEST_RESOLVER_BYPASS_MENTIONS) {
      if (source.includes(mention)) {
        offenders.push(`${file} mentions "${mention}"`);
      }
    }
  }

  expect(offenders).toEqual([]);
});

/** Whether a specifier reaches task/http-observation-runtime/http-declarative-observation-source's own production adapter, by any relative path — criterion 10's "no domain module imports [the adapter] ... directly." */
function reachesTheHttpDeclarativeObservationSourceAdapter(specifier: string): boolean {
  return /(^|\/)http-declarative-observation-source\.adapter(\.js)?$/.test(specifier);
}

it('none of these modules imports the http-declarative-observation-source adapter directly, by any relative path — it is reached only through the unchanged IObservationSource port', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    for (const specifier of specifiers.filter(reachesTheHttpDeclarativeObservationSourceAdapter)) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it('IObservationSource is still declared as an interface in observation-source.port.ts — the one real port at the domain boundary this task must not be bypassed by', async () => {
  const portSource = await readFile(
    fileURLToPath(new URL('../../investigation/observation-source.port.ts', import.meta.url)),
    'utf8',
  );

  expect(portSource).toMatch(/export\s+interface\s+IObservationSource\b/);
});

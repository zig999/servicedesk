import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const AUDITED_DIRECTORIES = ['case', 'glossary', 'capability-registry', 'investigation'] as const;

const PROVIDER_ADAPTER_EXCEPTIONS = new Set([
  'anthropic-hypothesis-evaluator.adapter.ts',
  'anthropic-assessment-consolidator.adapter.ts',
]);

const FORBIDDEN_DRIVERS_AND_FRAMEWORKS = [
  'fastify', 'express', 'koa', '@hapi/hapi', '@nestjs/common', '@nestjs/core',
  'pg', 'pg-native', 'postgres', 'mysql', 'mysql2', 'sqlite3', 'better-sqlite3',
  'mongodb', 'mongoose', 'redis', 'ioredis', 'typeorm', 'sequelize', 'knex',
  'prisma', '@prisma/client', 'drizzle-orm',
];

const PROVIDER_CLIENT_PACKAGE = '@anthropic-ai/sdk';

const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

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

function namesOneOf(specifier: string, packages: readonly string[]): boolean {
  return packages.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

function reachesTheConnectionModule(specifier: string): boolean {
  return /(^|\/)database-connection(\.js)?$/.test(specifier);
}

const HTTP_CLIENT_PACKAGES = ['axios', 'node-fetch', 'got', 'undici', 'ws', 'superagent', 'request'];

function reachesTheConnectorConfigurationStore(specifier: string): boolean {
  return (
    /(^|\/)connector-configuration-store\.port(\.js)?$/.test(specifier) ||
    /(^|\/)relational-connector-configuration-store\.repository(\.js)?$/.test(specifier)
  );
}

function reachesTheConnectorRequestResolver(specifier: string): boolean {
  return (
    /(^|\/)connector-request-resolver(\.js)?$/.test(specifier) ||
    /(^|\/)connector-call-descriptor(\.js)?$/.test(specifier)
  );
}

function reachesTheConnectorPlaceholderErrors(specifier: string): boolean {
  return (
    /(^|\/)incomplete-connector-call-descriptor\.error(\.js)?$/.test(specifier) ||
    /(^|\/)connector-placeholder-not-resolved\.error(\.js)?$/.test(specifier)
  );
}

const HTTP_CONNECTOR_MENTION = 'http-connector';

const CONNECTOR_REQUEST_RESOLVER_BYPASS_MENTIONS = [
  HTTP_CONNECTOR_MENTION,
  'connector-request-resolver',
  'connector-call-descriptor',
  'resolveConnectorRequest',
  'asConnectorCallDescriptor',
];

const SPECIFICATION_NODE_IDENTITY_PATTERN =
  /(?:domain|rules|scenarios|contracts)\/[a-z0-9-]+\/[a-z0-9-]+|constraints\/[a-z0-9-]+/g;

function specificationNodeIdentityRanges(source: string): ReadonlyArray<readonly [number, number]> {
  return [...source.matchAll(SPECIFICATION_NODE_IDENTITY_PATTERN)].map((match) => {
    const start = match.index ?? 0;
    return [start, start + match[0].length] as const;
  });
}

function everyHttpConnectorMentionIsANodeIdentityCitation(source: string): boolean {
  const identityRanges = specificationNodeIdentityRanges(source);

  let index = source.indexOf(HTTP_CONNECTOR_MENTION);
  while (index !== -1) {
    const end = index + HTTP_CONNECTOR_MENTION.length;
    const citedInsideAnIdentity = identityRanges.some(([start, rangeEnd]) => index >= start && end <= rangeEnd);
    if (!citedInsideAnIdentity) return false;
    index = source.indexOf(HTTP_CONNECTOR_MENTION, index + 1);
  }
  return true;
}

const HTTP_DECLARATIVE_OBSERVATION_SOURCE_ADAPTER_KEY = 'investigation/http-declarative-observation-source.adapter.ts';

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

it('none of these modules imports either error the connector-request-resolver raises, by any relative path, except this epic\'s own legitimate HTTP adapter', async () => {
  const imports = await domainModuleImports();

  const offenders: string[] = [];
  for (const [file, specifiers] of imports) {
    if (file === HTTP_DECLARATIVE_OBSERVATION_SOURCE_ADAPTER_KEY) continue;
    for (const specifier of specifiers.filter(reachesTheConnectorPlaceholderErrors)) {
      offenders.push(`${file} imports ${specifier}`);
    }
  }

  expect(offenders).toEqual([]);
});

it("none of these modules holds any mention of the http-connector module or its exports outside a static import — a dynamic lookup, a global registry, or a string-keyed service locator would not show up as an import specifier at all, which is exactly the gap this task's own Notes call out — except this epic's own legitimate HTTP adapter, and except a citation of a specification-node identity that merely contains the \"http-connector\" substring in its own slug", async () => {
  const sources = await domainModuleSources();

  const offenders: string[] = [];
  for (const [file, source] of sources) {
    if (file === HTTP_DECLARATIVE_OBSERVATION_SOURCE_ADAPTER_KEY) continue;
    for (const mention of CONNECTOR_REQUEST_RESOLVER_BYPASS_MENTIONS) {
      if (!source.includes(mention)) continue;
      if (mention === HTTP_CONNECTOR_MENTION && everyHttpConnectorMentionIsANodeIdentityCitation(source)) continue;
      offenders.push(`${file} mentions "${mention}"`);
    }
  }

  expect(offenders).toEqual([]);
});

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

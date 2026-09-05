import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

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

function namesOneOf(specifier: string, packages: readonly string[]): boolean {
  return packages.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

async function portSource(): Promise<string> {
  const path = fileURLToPath(new URL('../../../case/hypothesis-revision-release.port.ts', import.meta.url));
  return readFile(path, 'utf8');
}

it('imports no database driver, HTTP server or web framework, so a caller depending on this port alone pulls in neither', async () => {
  const source = await portSource();

  const offenders = importSpecifiersOf(source).filter((specifier) => namesOneOf(specifier, FORBIDDEN_DRIVERS_AND_FRAMEWORKS));

  expect(offenders).toEqual([]);
});

it('imports no LLM provider client, so a caller depending on this port alone pulls in neither', async () => {
  const source = await portSource();

  const offenders = importSpecifiersOf(source).filter((specifier) => namesOneOf(specifier, [PROVIDER_CLIENT_PACKAGE]));

  expect(offenders).toEqual([]);
});

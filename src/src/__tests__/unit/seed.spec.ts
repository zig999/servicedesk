import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';

const SEED_SOURCE_PATH = fileURLToPath(new URL('../../seed.ts', import.meta.url));
const PACKAGE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const REAL_FIXTURES_ROOT = join(PACKAGE_ROOT, 'src', 'fixtures');
const FIXTURES_ROOT_ASSIGNMENT = /const FIXTURES_ROOT = fileURLToPath\(new URL\('([^']+)',\s*import\.meta\.url\)\)/;

async function readFixturesRootSegment(): Promise<string> {
  const source = await readFile(SEED_SOURCE_PATH, 'utf8');
  const match = FIXTURES_ROOT_ASSIGNMENT.exec(source);
  if (!match) {
    throw new Error("seed.ts no longer declares FIXTURES_ROOT the way this test expects to read it");
  }
  return match[1];
}

async function resolveFixturesRootFromBuiltLocation(): Promise<string> {
  const segment = await readFixturesRootSegment();
  const builtSeedUrl = pathToFileURL(join(PACKAGE_ROOT, 'dist', 'seed.js'));
  return fileURLToPath(new URL(segment, builtSeedUrl));
}

it(
  'FIXTURES_ROOT resolves, from the fixed path a real build places seed.js at, to the exact directory the fixtures are actually committed in',
  async () => {
    const resolved = await resolveFixturesRootFromBuiltLocation();

    expect(resolved).toBe(REAL_FIXTURES_ROOT);
  },
);

async function readSeedSource(): Promise<string> {
  return readFile(SEED_SOURCE_PATH, 'utf8');
}

it('writes no raw SQL statement that sets hypothesis_revisions.state', async () => {
  const source = await readSeedSource();

  expect(source).not.toMatch(/UPDATE\s+hypothesis_revisions\s+SET\s+state/i);
});

it("releases each manifested revision by calling lifecycle's own releaseHypothesisRevision operation", async () => {
  const source = await readSeedSource();

  expect(source).toMatch(/lifecycle\.releaseHypothesisRevision\(/);
});

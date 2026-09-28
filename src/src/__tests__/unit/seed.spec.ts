import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, it, vi } from 'vitest';
import type { IConnectableQueryable } from '../../persistence/database-access.js';
import { RelationalGlossaryStore } from '../../persistence/relational-glossary-store.repository.js';

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

const CONCEPT_FIXTURE_PATH = fileURLToPath(new URL('../../fixtures/glossary/concept.json', import.meta.url));

type ConceptFixtureEntry = { readonly description: string };

async function readConceptDescriptions(): Promise<readonly string[]> {
  const raw = await readFile(CONCEPT_FIXTURE_PATH, 'utf8');
  const concepts = JSON.parse(raw) as readonly ConceptFixtureEntry[];
  return concepts.map((concept) => concept.description);
}

function fakeUpsertConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): IConnectableQueryable {
  const client = { query: vi.fn(handleQuery), release: vi.fn() };
  return { connect: vi.fn().mockResolvedValue(client) } as unknown as IConnectableQueryable;
}

it(
  "replaces a concept's held description with the fixture's own value in the same upsert that replaces its ttl, writing through IGlossaryStore.writeConcepts -- the write path seedConcepts now delegates the whole fixture to, instead of seed.ts's own removed hand-rolled INSERT",
  async () => {
    const recorded: { text: string; params?: readonly unknown[] }[] = [];
    const connection = fakeUpsertConnection(async (text, params) => {
      recorded.push({ text, params });
      return { rows: [] };
    });
    const store = new RelationalGlossaryStore(connection);

    await store.writeConcepts([
      { name: 're-seeded-concept', accepts: [], ttl: 120, description: "the fixture's current description" },
    ]);

    const conceptUpsert = recorded.find((entry) => entry.text.includes('INSERT INTO concepts'));
    expect(conceptUpsert?.text.replace(/\s+/g, ' ').trim()).toBe(
      'INSERT INTO concepts (name, ttl, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description',
    );
    expect(conceptUpsert?.params).toEqual(['re-seeded-concept', 120, "the fixture's current description"]);
  },
);

it("embeds none of the fixture's own concept description text as a literal string in its own source", async () => {
  const source = await readSeedSource();
  const descriptions = await readConceptDescriptions();

  for (const description of descriptions) {
    expect(source).not.toContain(description);
  }
});

it('does not redeclare the concept description guard or error that already stand in glossary.service.ts', async () => {
  const source = await readSeedSource();

  expect(source).not.toMatch(/namesNoDescription/);
  expect(source).not.toMatch(/ConceptDescriptionRequiredError/);
});

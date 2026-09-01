import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CapabilityRegistration } from './capability-registry/capability.js';
import type { Resolution } from './case/case.js';
import { loadEnv } from './config/env.js';
import { createCapabilityRegistry } from './factories/capability-registry.factory.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from './factories/case-lifecycle.factory.js';
import { createCaseQuery } from './factories/case-query.factory.js';
import { createCaseStore } from './factories/case-store.factory.js';
import type { IGlossaryStore } from './glossary/glossary-store.port.js';
import { NON_CONCLUSION_OUTCOMES, type GlossaryTerm } from './glossary/terms.js';
import type { ConsolidationRegister } from './investigation/consolidation-register.js';
import { createDatabaseConnection, type DatabaseConnection } from './persistence/database-connection.js';
import { RelationalGlossaryStore } from './persistence/relational-glossary-store.repository.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../src/fixtures', import.meta.url));
const CASE_SLUG = 'intermittent-connection-outage';
const CASE_VERSION = 1;

async function fixtureTerms(file: string): Promise<readonly GlossaryTerm[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', file), 'utf8');
  return JSON.parse(raw) as readonly GlossaryTerm[];
}

async function seedOutcomes(store: IGlossaryStore): Promise<void> {
  const fixtureOutcomes = await fixtureTerms('outcome.json');
  const known = new Set(fixtureOutcomes.map((outcome) => outcome.name));
  const missing = NON_CONCLUSION_OUTCOMES.filter((outcome) => !known.has(outcome.name));
  await store.insertMissingTerms('outcome', [...fixtureOutcomes, ...missing]);
}

async function seedRemainingVocabularies(store: IGlossaryStore): Promise<void> {
  await store.insertMissingTerms('subject-type', await fixtureTerms('subject-type.json'));
  await store.insertMissingTerms('subject-attribute', await fixtureTerms('subject-attribute.json'));
  await store.insertMissingTerms('action', await fixtureTerms('action.json'));
  await store.insertMissingTerms('recipient', await fixtureTerms('recipient.json'));
}

type ConceptFixture = { readonly name: string; readonly accepts: readonly string[]; readonly ttl: number };

type CaseFixtureManifestEntry = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

type CaseFixture = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly version: number;
  readonly authored_at: string;
  readonly subject: string;
  readonly consolidation_register?: ConsolidationRegister;
  readonly fallback: Resolution;
  readonly manifest: readonly CaseFixtureManifestEntry[];
};

async function seedConcepts(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8');
  const concepts = JSON.parse(raw) as readonly ConceptFixture[];
  for (const concept of concepts) {
    await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
      concept.name,
      concept.ttl,
    ]);
    for (const subjectType of concept.accepts) {
      await connection.query(
        'INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [concept.name, subjectType],
      );
    }
  }
}

async function seedCapabilities(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8');
  const registrations = JSON.parse(raw) as readonly CapabilityRegistration[];
  const registry = createCapabilityRegistry(connection);
  for (const registration of registrations) {
    await registry.registerCapability(registration);
  }
}

async function placeFixtureHypotheses(
  lifecycle: CaseLifecycleOperations,
  fixture: CaseFixture,
  version: number,
): Promise<void> {
  for (const entry of fixture.manifest) {
    const revised = await lifecycle.reviseHypothesis({
      slug: fixture.slug,
      hypothesis_name: entry.hypothesis_name,
      criterion: entry.criterion,
      collects: entry.collects,
      resolution: entry.resolution,
      subject: fixture.subject,
    });
    await lifecycle.placeHypothesis({
      slug: fixture.slug,
      version,
      hypothesis_name: revised.hypothesis_name,
      revision: revised.revision,
      position: entry.position,
    });
  }
}

async function seedCase(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'case', CASE_SLUG, `${CASE_VERSION}.json`), 'utf8');
  const fixture = JSON.parse(raw) as CaseFixture;
  const lifecycle = createCaseLifecycle(connection);
  const draft = await lifecycle.createDraft({
    slug: fixture.slug,
    title: fixture.title,
    when_to_use: fixture.when_to_use,
    authored_at: fixture.authored_at,
    subject: fixture.subject,
    fallback: fixture.fallback,
    consolidation_register: fixture.consolidation_register,
  });
  await placeFixtureHypotheses(lifecycle, fixture, draft.version);
  await lifecycle.release(fixture.slug, draft.version);
}

async function alreadySeeded(connection: DatabaseConnection): Promise<boolean> {
  const stored = await createCaseStore(connection).assembleVersion(CASE_SLUG, CASE_VERSION);
  return stored !== undefined;
}

async function verifySeededCase(connection: DatabaseConnection): Promise<void> {
  await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);
}

const env = loadEnv();
const connection = createDatabaseConnection(env.DATABASE_URL);
try {
  const glossary = new RelationalGlossaryStore(connection);
  await seedOutcomes(glossary);
  await seedRemainingVocabularies(glossary);
  await seedConcepts(connection);
  await seedCapabilities(connection);
  if (!(await alreadySeeded(connection))) {
    await seedCase(connection);
  }
  await verifySeededCase(connection);
} finally {
  await connection.end();
}

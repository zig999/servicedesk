// The seed that carries the fixture-era glossary, capability registry and
// one curated case version into the database
// (task/case-authoring/curated-data-seeded): the data a first diagnosis
// needs to exist before it can run. Follows migrate.ts's own convention for
// a short-lived, whole-process script exactly: reads DATABASE_URL only
// through loadEnv() (config/env.ts), builds one DatabaseConnection, does its
// work in a try, closes the connection in a finally. Locates the fixtures
// the same way migrate.ts locates the migrations directory — a relative URL
// resolved from this module's own import.meta.url, never through an
// environment variable — and package.json's own "seed" script is what makes
// this a step the tree holds rather than a module nobody runs.
//
// The sequence below is itself the proof of criterion 1
// (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case): the
// outcome vocabulary, merged with the two non-conclusion outcomes, is
// written first; the curated case is authored last, once every other
// vocabulary, every concept and every capability registration it needs
// already stands. Every vocabulary term and concept
// (contracts/knowledge/vocabulary-terms) and every capability's declared
// contract (contracts/knowledge/capability-check) the curated case needs is
// seeded before that authoring, so the coherence checks
// rules/knowledge/validation-runs-at-every-read requires at every read —
// case-terms-exist-in-the-glossary, a-concept-accepts-the-declared-subject-type,
// a-collected-concept-declares-a-ttl, every-collected-concept-has-a-read-only-
// capability — hold both when the case is authored and again at the
// self-check read below (criterion 6).
//
// Rewired against the six published case-lifecycle operations
// (task/case-lifecycle-operations/wire-and-retire-author-case-version): the
// retired author-case-version command this module used to enter the case
// through is gone, and the case now enters only through
// createCaseLifecycle's own createDraft, reviseHypothesis, placeHypothesis
// and release, called in that order — never through the case store
// directly (this task's own extension of criterion 5's "no other write" to
// the operations that replaced the one command it named). The fixture's own
// declared "hypotheses" array — each entry naming its own position, exactly
// the flat shape the retired parse-case-document.ts once read directly —
// still names one hypothesis-revision and the manifest position it is
// placed at; this module reads it as CaseFixture below rather than as the
// aggregate's own CaseDocument shape, since the fixture predates the
// domain-model rewrite that split a hypothesis's identity from its content
// and this task does not touch the fixture itself (this delivery's own
// inference, disclosed below).
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

// Resolved against the source tree rather than the compiled output
// (task/case-authoring/seed-fixtures-resolve-against-a-real-build): the
// fixtures directory lives at <package-root>/src/fixtures, inside the
// TypeScript rootDir tsc compiles from, and the project's own build step
// (tsconfig.build.json) only ever emits .ts files — it copies nothing into
// dist/, so a path resolved against this module's own compiled location
// (dist/seed.js) never finds them there. Stepping up one level from this
// module's own URL and back down into src/fixtures lands on the same
// directory whether import.meta.url is dist/seed.js or the uncompiled
// src/seed.ts (both sit exactly one level below the package root), which is
// the same relative-URL, no-environment-variable technique migrate.ts
// already uses for '../migrations' — that directory happens to sit beside
// dist/ rather than inside rootDir, but the resolution is the same trick.
const FIXTURES_ROOT = fileURLToPath(new URL('../src/fixtures', import.meta.url));
const CASE_SLUG = 'intermittent-connection-outage';
const CASE_VERSION = 1;

/** One glossary term vocabulary fixture file, read exactly as committed. */
async function fixtureTerms(file: string): Promise<readonly GlossaryTerm[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', file), 'utf8');
  return JSON.parse(raw) as readonly GlossaryTerm[];
}

/**
 * Adds the outcome vocabulary's fixture-declared names and the two
 * non-conclusion outcomes to whatever the table already holds
 * (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case),
 * through insertMissingTerms rather than writeTerms
 * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome):
 * once the curated case's own hypotheses reference an outcome row by
 * foreign key, writeTerms' own DELETE fails, and this call now runs on
 * every execution of this script rather than only before the case first
 * exists (task/seed-already-seeded-guard-hotfix/narrow-the-guard) — called
 * first below, before every other vocabulary, every concept, every
 * capability and the case itself (criterion 1).
 */
async function seedOutcomes(store: IGlossaryStore): Promise<void> {
  const fixtureOutcomes = await fixtureTerms('outcome.json');
  const known = new Set(fixtureOutcomes.map((outcome) => outcome.name));
  const missing = NON_CONCLUSION_OUTCOMES.filter((outcome) => !known.has(outcome.name));
  await store.insertMissingTerms('outcome', [...fixtureOutcomes, ...missing]);
}

/**
 * Adds the remaining four term vocabularies' fixture-declared names to
 * whatever each table already holds, through insertMissingTerms rather
 * than writeTerms, for the same reason seedOutcomes above now does
 * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome):
 * once the curated case's own hypotheses reference an action or recipient
 * row by foreign key, writeTerms' own DELETE fails, and this call now runs
 * on every execution of this script rather than only before the case first
 * exists (task/seed-already-seeded-guard-hotfix/narrow-the-guard) —
 * subject-attribute included, even though the curated case names no
 * subject attribute of its own, so the glossary can still answer one where
 * a diagnosis request assembles it (this task's own inference, recorded in
 * the delivery).
 */
async function seedRemainingVocabularies(store: IGlossaryStore): Promise<void> {
  await store.insertMissingTerms('subject-type', await fixtureTerms('subject-type.json'));
  await store.insertMissingTerms('subject-attribute', await fixtureTerms('subject-attribute.json'));
  await store.insertMissingTerms('action', await fixtureTerms('action.json'));
  await store.insertMissingTerms('recipient', await fixtureTerms('recipient.json'));
}

/** One concept fixture entry, read exactly as committed. */
type ConceptFixture = { readonly name: string; readonly accepts: readonly string[]; readonly ttl: number };

/**
 * One manifest entry exactly as the fixture's own committed document
 * declares it: its own declared position and hypothesis name alongside the
 * content revise-hypothesis needs (the same flat shape
 * parse-case-document.ts's own ManifestEntryDocument now requires of every
 * case document, fixture or otherwise).
 */
type CaseFixtureManifestEntry = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/** The curated case fixture's own whole committed document, read exactly as committed. */
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

/**
 * Seeds "concepts" and "concept_accepts" directly through the given
 * connection: the glossary store's own port declares no write operation for
 * concepts (this task's own ADVISORY note), so this mirrors the exact
 * parameterized SQL __tests__/integration/fixtures/case-fixture-reads-clean.spec.ts's
 * own insertConcepts helper already runs against the same two tables, each
 * insert guarded by ON CONFLICT DO NOTHING so a rerun of this script never
 * fails or duplicates a row it already holds. Runs after the vocabularies
 * above — concept_accepts.subject_type_name references subject_types.name —
 * and before the capabilities below — capabilities.concept references
 * concepts.name.
 */
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

/**
 * Registers one read-only capability per fixture entry through the
 * registry's own validated write path (criterion 4): a re-registration
 * under an already-held name and version replaces its own record rather
 * than refusing (CapabilityRegistryService's own sameIdentity holding), so
 * rerunning this script is safe without an ON CONFLICT clause of its own.
 */
async function seedCapabilities(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8');
  const registrations = JSON.parse(raw) as readonly CapabilityRegistration[];
  const registry = createCapabilityRegistry(connection);
  for (const registration of registrations) {
    await registry.registerCapability(registration);
  }
}

/**
 * Revises then places every fixture-declared hypothesis at its own
 * fixture-declared position, in the fixture's own declared order — the
 * per-hypothesis half of seedCase's own criterion-5 sequence (below), pulled
 * out into its own function only so that seedCase's own body stays inside
 * the standard's max-lines-per-function rule; the sequence and behavior are
 * exactly what seedCase's own loop ran before this split (this delivery's
 * own inference — the extraction changes nothing but where the lines are
 * counted).
 */
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

/**
 * Authors the curated case version through the six published case-lifecycle
 * operations and by no other write (criterion 5, extended from the retired
 * author-case-version command to the operations that replaced it — this
 * module's own header comment): originates the draft from the fixture's own
 * case-level attributes, revises and places every fixture-declared
 * hypothesis at its own fixture-declared position, in the fixture's own
 * declared order (placeFixtureHypotheses above), then releases the draft —
 * the same structural and coherence validation the retired command once ran
 * up front now running at release() itself
 * (rules/knowledge/validation-runs-at-every-read). Unlike the retired
 * command's own write-once refusal, no case already answering
 * alreadySeeded() below ever reaches this function, so no defensive catch is
 * needed here: alreadySeeded() is this script's whole idempotency guard, the
 * same way it already was before this task's rewiring (this delivery's own
 * inference, since no criterion states a replacement race-safety behavior
 * for the six operations that replaced the one command's own refusal).
 */
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

/**
 * Whether the curated case version already stands — this script's own
 * write-once guard for seedCase alone
 * (rules/knowledge/a-case-version-is-written-once), narrowed from an
 * earlier all-or-nothing gate that also skipped every vocabulary, concept
 * and capability write above whenever the case already existed
 * (task/seed-already-seeded-guard-hotfix/narrow-the-guard). That wider gate
 * was itself the fix for a real failure — seedOutcomes and
 * seedRemainingVocabularies used to replace a whole vocabulary table
 * (IGlossaryStore.writeTerms' own DELETE, then INSERT), and once the
 * curated case's own hypotheses held a row naming one of those
 * outcome/action/recipient rows by foreign key, that DELETE failed,
 * discovered live running this exact script a second time against an
 * already-seeded database — but it went on skipping those writes forever
 * once the case became permanently released
 * (rules/knowledge/a-case-version-is-written-once), even on a run where a
 * sibling test file's own cleanup (seed.spec.ts's own
 * wipeFixtureOwnedRows) had deleted concept_accepts and capabilities rows
 * with nothing left to reseed them, which is what verifySeededCase caught
 * as a CaseNotValidError — discovered live against the real database,
 * disclosed in this delivery's own record. seedOutcomes and
 * seedRemainingVocabularies are additive now (insertMissingTerms, above),
 * and seedConcepts and seedCapabilities were already safe to rerun
 * unconditionally (their own ON CONFLICT DO NOTHING and
 * replace-on-reregistration respectively), so only originating and
 * releasing the case itself still needs this check.
 */
async function alreadySeeded(connection: DatabaseConnection): Promise<boolean> {
  const stored = await createCaseStore(connection).assembleVersion(CASE_SLUG, CASE_VERSION);
  return stored !== undefined;
}

/**
 * Reads the seeded case back whole through the published case-query, the
 * same validation every read runs
 * (rules/knowledge/validation-runs-at-every-read) — this call's own
 * rejection is never caught here, so a version that does not genuinely read
 * back whole and coherent fails this script rather than a silent success
 * (criterion 6).
 */
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

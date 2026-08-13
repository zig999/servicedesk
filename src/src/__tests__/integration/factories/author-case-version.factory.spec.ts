// Proof for task/case-authoring/author-case-version-command, through the module's real wiring,
// against a real, externally provisioned PostgreSQL database
// (constraints/the-database-is-externally-provisioned): a valid submission is stored and answered
// with its slug and version; a submission naming a slug and version already stored is refused
// through the real store's own CaseVersionAlreadyStoredError, leaving the stored version exactly
// as it was; a submission naming a vocabulary term, a concept or a capability the real glossary or
// capability registry does not currently hold is refused through the composed CaseNotValidError,
// naming what is missing, before the store is ever reached — unlike the read side's own
// case-query.factory.spec.ts, where a missing concept surfaces as a write-time foreign-key failure
// because that file writes the raw document directly to the store first: this command runs the
// coherence check before ever calling into persistence, so the concept's absence is always
// discovered there, never at the store; a case that validated once is refused again once a real
// capability registration it depends on is edited directly against the table, bypassing every API;
// and nothing lands in cases, case_versions, hypotheses or hypothesis_collects when a submission is
// refused, whichever rule refused it.
//
// The fixture shape (freshVocabulary, persistCoherentGlossary, registerCoherentCapability,
// cleanupVocabulary) mirrors case-query.factory.spec.ts's own precedent for the identical
// dependency composition — one shared DatabaseConnection wiring createCaseStore,
// createGlossaryQuery and createCapabilityQuery together — since createAuthorCaseVersion composes
// exactly the same three leaf factories for authoring rather than for reading.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { CaseVersionAlreadyStoredError } from '../../../errors/case-version-already-stored.error.js';
import { InvalidCaseDocumentError } from '../../../errors/invalid-case-document.error.js';
import { createAuthorCaseVersion } from '../../../factories/author-case-version.factory.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

const VERSION = 1;

interface IVocabulary {
  readonly slug: string;
  readonly subject: string;
  readonly concept: string;
  readonly outcome: string;
  readonly fallbackOutcome: string;
  readonly action: string;
  readonly fallbackAction: string;
  readonly recipient: string;
  readonly fallbackRecipient: string;
  readonly capabilityName: string;
}

let pool: DatabaseConnection;
let vocabulariesWrittenByThisTest: IVocabulary[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

/** Every distinct, freshly generated name one test's own case, glossary and capability need — nothing here shared with any other test or any other suite file. */
function freshVocabulary(): IVocabulary {
  const id = randomUUID();
  return {
    slug: `author-case-version-case-${id}`,
    subject: `author-case-version-subject-${id}`,
    concept: `author-case-version-concept-${id}`,
    outcome: `author-case-version-outcome-${id}`,
    fallbackOutcome: `author-case-version-fallback-outcome-${id}`,
    action: `author-case-version-action-${id}`,
    fallbackAction: `author-case-version-fallback-action-${id}`,
    recipient: `author-case-version-recipient-${id}`,
    fallbackRecipient: `author-case-version-fallback-recipient-${id}`,
    capabilityName: `author-case-version-capability-${id}`,
  };
}

/** A raw case document — every attribute parseCaseDocument requires — naming exactly the given vocabulary's own terms, for a test to depart from one attribute at a time. */
function validCaseDocument(vocabulary: IVocabulary, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: vocabulary.slug,
    title: 'A case',
    when_to_use: 'when a curator submits a case version for author-case-version to store',
    version: VERSION,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: vocabulary.subject,
    fallback: {
      outcome: vocabulary.fallbackOutcome,
      referral: { action: vocabulary.fallbackAction, recipient: vocabulary.fallbackRecipient },
    },
    hypotheses: [
      {
        name: 'h1',
        position: 1,
        criterion: 'prose no check in this composition ever reads',
        collects: [vocabulary.concept],
        resolution: { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } },
      },
    ],
    ...overrides,
  };
}

/** Writes every vocabulary row and, unless told to skip it, the concept row this vocabulary's own case depends on, directly against the real tables — tracked for this file's own afterEach cleanup. */
async function persistCoherentGlossary(vocabulary: IVocabulary, options: { withConcept?: boolean } = {}): Promise<void> {
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1)', [vocabulary.subject]);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1), ($2)', [vocabulary.outcome, vocabulary.fallbackOutcome]);
  await pool.query('INSERT INTO public.actions (name) VALUES ($1), ($2)', [vocabulary.action, vocabulary.fallbackAction]);
  await pool.query('INSERT INTO public.recipients (name) VALUES ($1), ($2)', [vocabulary.recipient, vocabulary.fallbackRecipient]);
  if (options.withConcept ?? true) {
    await registerConceptAccepting(vocabulary, vocabulary.subject);
  }
  vocabulariesWrittenByThisTest.push(vocabulary);
}

/** Writes the concept row plus one concept_accepts row naming the given subject type — split out so a test can register it accepting a subject type other than the case's own declared one. */
async function registerConceptAccepting(vocabulary: IVocabulary, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [vocabulary.concept]);
  await pool.query('INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [vocabulary.concept, subjectType]);
}

/** Registers, through the real registry, a complete read-only capability answering the vocabulary's own concept. */
async function registerCoherentCapability(vocabulary: IVocabulary): Promise<void> {
  await createCapabilityRegistry(pool).registerCapability({
    name: vocabulary.capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: vocabulary.concept,
  });
}

/** Every row this file's own tests wrote for one vocabulary, deleted in an order that always satisfies their own foreign keys. */
async function cleanupVocabulary(vocabulary: IVocabulary): Promise<void> {
  await pool.query('DELETE FROM public.hypothesis_collects WHERE case_slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.hypotheses WHERE case_slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.case_versions WHERE slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.cases WHERE slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.capabilities WHERE name = $1', [vocabulary.capabilityName]);
  await pool.query('DELETE FROM public.concept_accepts WHERE concept_name = $1', [vocabulary.concept]);
  await pool.query('DELETE FROM public.concepts WHERE name = $1', [vocabulary.concept]);
  await pool.query('DELETE FROM public.subject_types WHERE name = $1', [vocabulary.subject]);
  await pool.query('DELETE FROM public.outcomes WHERE name = ANY($1)', [[vocabulary.outcome, vocabulary.fallbackOutcome]]);
  await pool.query('DELETE FROM public.actions WHERE name = ANY($1)', [[vocabulary.action, vocabulary.fallbackAction]]);
  await pool.query('DELETE FROM public.recipients WHERE name = ANY($1)', [[vocabulary.recipient, vocabulary.fallbackRecipient]]);
}

afterEach(async () => {
  for (const vocabulary of vocabulariesWrittenByThisTest) {
    await cleanupVocabulary(vocabulary);
  }
  vocabulariesWrittenByThisTest = [];
});

/** Every row of cases/case_versions/hypotheses/hypothesis_collects one slug currently holds, read directly against the real tables — the shape criterion 10's own "nothing stored" tests assert against. */
async function storedRowsFor(slug: string): Promise<{
  cases: readonly unknown[];
  versions: readonly unknown[];
  hypotheses: readonly unknown[];
  collects: readonly unknown[];
}> {
  const [cases, versions, hypotheses, collects] = await Promise.all([
    pool.query('SELECT slug FROM public.cases WHERE slug = $1', [slug]),
    pool.query('SELECT version FROM public.case_versions WHERE slug = $1', [slug]),
    pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1', [slug]),
    pool.query('SELECT concept_name FROM public.hypothesis_collects WHERE case_slug = $1', [slug]),
  ]);
  return { cases: cases.rows, versions: versions.rows, hypotheses: hypotheses.rows, collects: collects.rows };
}

// -------------------------------------------------------------------------------- criterion 1

it('stores a submission of one valid case version, through the real wiring, and answers with its slug and version', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary);
  await registerCoherentCapability(vocabulary);
  const command = createAuthorCaseVersion(pool);

  const result = await command.authorCaseVersion(validCaseDocument(vocabulary));

  expect(result).toEqual({ slug: vocabulary.slug, version: VERSION });
  const stored = await new RelationalCaseStore(pool).readVersion(vocabulary.slug, VERSION);
  expect(stored?.document).toMatchObject({ slug: vocabulary.slug, subject: vocabulary.subject });
});

// -------------------------------------------------------------------------------- criterion 2, criterion 10

it(
  "refuses a submission naming a slug and version already stored, through the real store's own " +
    'CaseVersionAlreadyStoredError, and leaves the stored version exactly as it was',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary);
    await registerCoherentCapability(vocabulary);
    const command = createAuthorCaseVersion(pool);
    await command.authorCaseVersion(validCaseDocument(vocabulary));

    const rejection = command.authorCaseVersion(validCaseDocument(vocabulary, { title: 'a conflicting title' }));

    await expect(rejection).rejects.toBeInstanceOf(CaseVersionAlreadyStoredError);
    await expect(rejection).rejects.toMatchObject({ context: { slug: vocabulary.slug, version: VERSION } });
    const stored = await new RelationalCaseStore(pool).readVersion(vocabulary.slug, VERSION);
    expect((stored?.document as { title: string }).title).toBe('A case');
    const rows = await storedRowsFor(vocabulary.slug);
    expect(rows.versions).toEqual([{ version: VERSION }]); // the conflicting write added nothing beyond the original
  },
);

// -------------------------------------------------------------------------------- criterion 3

it('does not refuse, through the real wiring, a submission that holds against every validator rule, including a case declaring more than one hypothesis', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary);
  await registerCoherentCapability(vocabulary);
  const command = createAuthorCaseVersion(pool);
  const document = validCaseDocument(vocabulary, {
    hypotheses: [
      {
        name: 'h1',
        position: 1,
        criterion: 'first',
        collects: [vocabulary.concept],
        resolution: { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } },
      },
      {
        name: 'h2',
        position: 2,
        criterion: 'second',
        collects: [vocabulary.concept],
        resolution: {
          outcome: vocabulary.fallbackOutcome,
          referral: { action: vocabulary.fallbackAction, recipient: vocabulary.fallbackRecipient },
        },
      },
    ],
  });

  await expect(command.authorCaseVersion(document)).resolves.toEqual({ slug: vocabulary.slug, version: VERSION });
});

// -------------------------------------------------------------------------------- criterion 4

it(
  'refuses through the real wiring a submission naming an outcome the glossary does not hold, naming the ' +
    'outcome — every other term, the concept and its capability staying coherent',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary);
    await registerCoherentCapability(vocabulary);
    // Removes just the outcome term directly against the table, bypassing every API.
    await pool.query('DELETE FROM public.outcomes WHERE name = $1', [vocabulary.outcome]);
    const command = createAuthorCaseVersion(pool);

    const refusal = await command.authorCaseVersion(validCaseDocument(vocabulary)).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual([
      `the outcome "${vocabulary.outcome}" does not exist in the glossary`,
    ]);
  },
);

// -------------------------------------------------------------------------------- criterion 5

it(
  'refuses through the real wiring a submission whose hypothesis collects a concept that does not accept ' +
    "the case's declared subject type, naming the concept and the subject type",
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary, { withConcept: false });
    const otherSubject = `${vocabulary.subject}-other`;
    await pool.query('INSERT INTO public.subject_types (name) VALUES ($1)', [otherSubject]);
    await registerConceptAccepting(vocabulary, otherSubject); // accepts a subject type other than the case's own declared one
    await registerCoherentCapability(vocabulary);
    const command = createAuthorCaseVersion(pool);

    const refusal = await command.authorCaseVersion(validCaseDocument(vocabulary)).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual([
      `the concept "${vocabulary.concept}" does not accept the subject type "${vocabulary.subject}" the case declares`,
    ]);
    // Not tracked by freshVocabulary's own cleanup — the concept_accepts row referencing otherSubject is
    // removed first, so the later subject_types delete never meets a real foreign-key violation.
    await pool.query('DELETE FROM public.concept_accepts WHERE concept_name = $1 AND subject_type_name = $2', [
      vocabulary.concept,
      otherSubject,
    ]);
    await pool.query('DELETE FROM public.subject_types WHERE name = $1', [otherSubject]);
  },
);

// -------------------------------------------------------------------------------- criterion 6

it(
  'refuses through the real wiring a submission whose collected concept has no registered capability at ' +
    'all, naming the concept',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary); // registers the concept, never a capability for it
    const command = createAuthorCaseVersion(pool);

    const refusal = await command.authorCaseVersion(validCaseDocument(vocabulary)).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual([
      `no read-only capability currently answers the concept "${vocabulary.concept}"`,
    ]);
  },
);

// -------------------------------------------------------------------------------- criterion 8, criterion 10

it(
  'answers the real capability check from the registration as it stands at this submission, refusing a ' +
    "later submission once the real registration's own output schema is edited away directly against " +
    'the table, and storing nothing for that refused version',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary);
    await registerCoherentCapability(vocabulary);
    const command = createAuthorCaseVersion(pool);
    await expect(command.authorCaseVersion(validCaseDocument(vocabulary, { version: 1 }))).resolves.toEqual({
      slug: vocabulary.slug,
      version: 1,
    });

    // Edits the registered capability's own output schema away directly against the table, bypassing every API.
    await pool.query('UPDATE public.capabilities SET output_schema = $1 WHERE name = $2', ['', vocabulary.capabilityName]);

    const refusal = await command
      .authorCaseVersion(validCaseDocument(vocabulary, { version: 2 }))
      .catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual([
      `the capability answering the concept "${vocabulary.concept}" declares no output schema`,
    ]);
    const rows = await storedRowsFor(vocabulary.slug);
    expect(rows.versions).toEqual([{ version: 1 }]); // never a row for the refused version 2
  },
);

// -------------------------------------------------------------------------------- criterion 9

it(
  'refuses through the real wiring, joining every coherence violation together, when a collected concept ' +
    "is absent from the glossary entirely — which also leaves it with no capability, since a capability's " +
    'own concept column is a real foreign key into concepts and can never name one the glossary does not hold',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary, { withConcept: false });
    const command = createAuthorCaseVersion(pool);

    const refusal = await command.authorCaseVersion(validCaseDocument(vocabulary)).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual([
      `the concept "${vocabulary.concept}" does not exist in the glossary`,
      `no read-only capability currently answers the concept "${vocabulary.concept}"`,
    ]);
  },
);

it(
  'refuses through the real wiring, joining every structural violation together, before the coherence ' +
    'checks or the store are ever reached',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary);
    await registerCoherentCapability(vocabulary);
    const command = createAuthorCaseVersion(pool);

    const refusal = await command
      .authorCaseVersion(validCaseDocument(vocabulary, { title: '', hypotheses: [] }))
      .catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(InvalidCaseDocumentError);
    expect((refusal as InvalidCaseDocumentError).context.problems).toEqual([
      'title is empty',
      'the case declares no hypothesis',
    ]);
  },
);

// -------------------------------------------------------------------------------- criterion 10

it('leaves no row in cases, case_versions, hypotheses or hypothesis_collects when a submission is refused structurally', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary);
  await registerCoherentCapability(vocabulary);
  const command = createAuthorCaseVersion(pool);

  await command.authorCaseVersion(validCaseDocument(vocabulary, { hypotheses: [] })).catch(() => undefined);

  const rows = await storedRowsFor(vocabulary.slug);
  expect(rows).toEqual({ cases: [], versions: [], hypotheses: [], collects: [] });
});

it('leaves no row in cases, case_versions, hypotheses or hypothesis_collects when a submission is refused for a coherence violation', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary); // no capability registered, so the concept is coherence-refused
  const command = createAuthorCaseVersion(pool);

  await command.authorCaseVersion(validCaseDocument(vocabulary)).catch(() => undefined);

  const rows = await storedRowsFor(vocabulary.slug);
  expect(rows).toEqual({ cases: [], versions: [], hypotheses: [], collects: [] });
});

// Proof through the module's real wiring (task/case-store/read-case): a case
// authored directly into the real, file-backed case store is readable at its
// very next read with no publication step in between, pinned by the sha256
// of the exact bytes its file holds; a structural or a coherence violation
// refuses through the real glossary and capability-registry factories the
// same way the unit proof shows through fakes, and a coherence violation
// refuses as the composed CaseNotValidError rather than the coherence
// module's own IncoherentCaseError; a case that validated once is refused
// again once the real glossary file is edited directly, bypassing every API,
// so it no longer holds a concept the case depends on; and replaying a
// pinned version through the real store answers it unchanged even after a
// registration the case depends on is edited away from the real registry.
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { replayCase } from '../../../case/case-query.service.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';

/** The fixture case's identity and the version every test addresses. */
const SLUG = 'a-case';
const VERSION = 1;

/** The fixture's subject type, accepted by the one concept the fixture case collects. */
const SUBJECT = 'contract';

/** The one concept the fixture case's one hypothesis collects. */
const CONCEPT = 'equipment-state';

/** The vocabulary terms the fixture names, each distinct from its fallback counterpart. */
const OUTCOME = 'issue-resolved';
const FALLBACK_OUTCOME = 'inconclusive';
const ACTION = 'notify-customer';
const FALLBACK_ACTION = 'escalate';
const RECIPIENT = 'support-queue';
const FALLBACK_RECIPIENT = 'escalation-queue';

/** The one plain JSON file capability registrations land in, spelled here so a renamed file fails the proof. */
const CAPABILITY_FILE = 'capability.json';
/** The one plain JSON file concept registrations land in. */
const CONCEPT_FILE = 'concept.json';

/**
 * A raw case document — every attribute parseCaseDocument requires — for a
 * test to depart from one attribute at a time. Declares no hash at all: the
 * case aggregate no longer admits one
 * (task/case-and-investigation-model/case-aggregate-shape) — the sha256 this
 * file's own tests read is the real store's content-identity pin over the
 * exact bytes on disk, never a value this document declares.
 */
function validCaseDocument(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: SLUG,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
    version: VERSION,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: SUBJECT,
    fallback: {
      outcome: FALLBACK_OUTCOME,
      referral: { action: FALLBACK_ACTION, recipient: FALLBACK_RECIPIENT },
    },
    hypotheses: [
      {
        name: 'h1',
        position: 1,
        criterion: 'prose no check in this composition ever reads',
        collects: [CONCEPT],
        resolution: { outcome: OUTCOME, referral: { action: ACTION, recipient: RECIPIENT } },
      },
    ],
    ...overrides,
  };
}

/** Seeds a real glossary data directory with every term and the one concept the fixture case names. */
async function persistCoherentGlossary(directory: string): Promise<void> {
  await writeFile(join(directory, 'subject-type.json'), JSON.stringify([{ name: SUBJECT }]), 'utf8');
  await writeFile(
    join(directory, 'outcome.json'),
    JSON.stringify([{ name: OUTCOME }, { name: FALLBACK_OUTCOME }]),
    'utf8',
  );
  await writeFile(
    join(directory, 'action.json'),
    JSON.stringify([{ name: ACTION }, { name: FALLBACK_ACTION }]),
    'utf8',
  );
  await writeFile(
    join(directory, 'recipient.json'),
    JSON.stringify([{ name: RECIPIENT }, { name: FALLBACK_RECIPIENT }]),
    'utf8',
  );
  await writeFile(
    join(directory, CONCEPT_FILE),
    JSON.stringify([{ name: CONCEPT, accepts: [SUBJECT], ttl: 60 }]),
    'utf8',
  );
}

/** Registers, through the real registry, a complete read-only capability answering the fixture concept. */
async function registerCoherentCapability(directory: string): Promise<void> {
  await createCapabilityRegistry(directory).registerCapability({
    name: 'equipment-state-reader',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: CONCEPT,
  });
}

let caseDir: string;
let glossaryDir: string;
let capabilityDir: string;

beforeEach(async () => {
  caseDir = await mkdtemp(join(tmpdir(), 'case-query-case-'));
  glossaryDir = await mkdtemp(join(tmpdir(), 'case-query-glossary-'));
  capabilityDir = await mkdtemp(join(tmpdir(), 'case-query-capability-'));
});

afterEach(async () => {
  await rm(caseDir, { recursive: true, force: true });
  await rm(glossaryDir, { recursive: true, force: true });
  await rm(capabilityDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------- criteria 1 and 5

it('answers a case written directly to the real store, pinned by the sha256 of the exact bytes on disk, with no publish step in between', async () => {
  await persistCoherentGlossary(glossaryDir);
  await registerCoherentCapability(capabilityDir);
  await createCaseStore(caseDir).writeVersion(SLUG, VERSION, validCaseDocument());
  const query = createCaseQuery(caseDir, glossaryDir, capabilityDir);

  const result = await query.readCase(SLUG, VERSION);

  const bytes = await readFile(join(caseDir, SLUG, `${VERSION}.json`), 'utf8');
  const expectedHash = createHash('sha256').update(bytes, 'utf8').digest('hex');
  expect(result.hash).toBe(expectedHash);
  expect(result.case).toMatchObject({ slug: SLUG, subject: SUBJECT });
});

// -------------------------------------------------------------------------------- criterion 2

it('refuses through the real wiring a case document declaring no hypothesis, naming the structural violation', async () => {
  await persistCoherentGlossary(glossaryDir);
  await registerCoherentCapability(capabilityDir);
  await createCaseStore(caseDir).writeVersion(SLUG, VERSION, validCaseDocument({ hypotheses: [] }));
  const query = createCaseQuery(caseDir, glossaryDir, capabilityDir);

  const refusal = await query.readCase(SLUG, VERSION).catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context.violations).toEqual(['the case declares no hypothesis']);
});

it(
  "refuses through the real wiring a structurally valid case whose collected concept the glossary does not " +
    "hold, as the composed CaseNotValidError rather than the coherence module's own IncoherentCaseError",
  async () => {
    await persistCoherentGlossary(glossaryDir);
    await writeFile(join(glossaryDir, CONCEPT_FILE), JSON.stringify([]), 'utf8'); // the concept is never registered
    await registerCoherentCapability(capabilityDir);
    await createCaseStore(caseDir).writeVersion(SLUG, VERSION, validCaseDocument());
    const query = createCaseQuery(caseDir, glossaryDir, capabilityDir);

    const refusal = await query.readCase(SLUG, VERSION).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect(refusal).not.toBeInstanceOf(IncoherentCaseError);
  },
);

// -------------------------------------------------------------------------------- criterion 3

it(
  'refuses at a later read, through the real wiring, a case that validated earlier once the glossary file ' +
    'no longer holds a concept it depends on',
  async () => {
    await persistCoherentGlossary(glossaryDir);
    await registerCoherentCapability(capabilityDir);
    await createCaseStore(caseDir).writeVersion(SLUG, VERSION, validCaseDocument());
    const query = createCaseQuery(caseDir, glossaryDir, capabilityDir);
    await expect(query.readCase(SLUG, VERSION)).resolves.toMatchObject({ case: { slug: SLUG } });

    // Edits the concept out of the glossary's own file directly, bypassing every API.
    await writeFile(join(glossaryDir, CONCEPT_FILE), JSON.stringify([]), 'utf8');

    const refusal = await query.readCase(SLUG, VERSION).catch((error: unknown) => error);
    expect(refusal).toBeInstanceOf(CaseNotValidError);
  },
);

// -------------------------------------------------------------------------------- criterion 4

it(
  'replays the pinned version through the real store, answering it unchanged even after the real ' +
    'capability registration the case depends on is edited away',
  async () => {
    await persistCoherentGlossary(glossaryDir);
    await registerCoherentCapability(capabilityDir);
    const store = createCaseStore(caseDir);
    await store.writeVersion(SLUG, VERSION, validCaseDocument());
    const query = createCaseQuery(caseDir, glossaryDir, capabilityDir);
    const read = await query.readCase(SLUG, VERSION);

    // Edits the registration out of the capability registry's own file directly, bypassing every API.
    await writeFile(join(capabilityDir, CAPABILITY_FILE), JSON.stringify([]), 'utf8');
    await expect(query.readCase(SLUG, VERSION)).rejects.toBeInstanceOf(CaseNotValidError);

    const replayed = await replayCase(SLUG, VERSION, store);

    expect(replayed).toEqual(read.case);
  },
);

// ---------------------------------------------------- inference: independently routed data directories

it(
  'routes each of the three dependencies to the directory named for it, whether all three differ or two ' +
    'of them coincide',
  async () => {
    const sharedDir = await mkdtemp(join(tmpdir(), 'case-query-shared-'));
    try {
      await persistCoherentGlossary(sharedDir);
      await registerCoherentCapability(sharedDir); // the glossary and the capability registry share one directory here
      await createCaseStore(caseDir).writeVersion(SLUG, VERSION, validCaseDocument());
      const query = createCaseQuery(caseDir, sharedDir, sharedDir);

      const result = await query.readCase(SLUG, VERSION);

      expect(result.case.slug).toBe(SLUG);
    } finally {
      await rm(sharedDir, { recursive: true, force: true });
    }
  },
);

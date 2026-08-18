// Proof that a canned observation outcome exists for every concept the fixture case's hypotheses
// collect, and that the real stand-in observation source can be seeded from it and read back
// unchanged — so the diagnose pipeline can run against this case without a live corporate-records
// connection (contracts/investigation/observation-source, domain/investigation/evidence-result,
// contracts/integration/corporate-records-source).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { collectionPlan } from '../../../case/case-resolution.js';
import type { Case } from '../../../case/case.js';
import { parseCaseDocument } from '../../../case/parse-case-document.js';
import { EVIDENCE_RESULTS, type EvidenceResult } from '../../../investigation/evidence-result.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { ObservationOutcome } from '../../../investigation/observation-source.port.js';
import { buildSubject } from '../../../investigation/subject.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';

type CannedObservation = {
  readonly concept: string;
  readonly result: EvidenceResult;
  readonly observation?: string;
};

async function loadFixtureCase(): Promise<Case> {
  const file = join(FIXTURES_ROOT, 'case', SLUG, '1.json');
  const raw = JSON.parse(await readFile(file, 'utf8')) as unknown;
  return parseCaseDocument(raw, SLUG);
}

async function loadCannedObservations(): Promise<readonly CannedObservation[]> {
  const text = await readFile(join(FIXTURES_ROOT, 'observations.json'), 'utf8');
  return JSON.parse(text) as readonly CannedObservation[];
}

/** The canned entry's data as one of the four evidence-result endings the observation-source port declares. */
function outcomeOf(canned: CannedObservation): ObservationOutcome {
  return canned.result === 'ok'
    ? { result: 'ok', observation: canned.observation ?? '' }
    : { result: canned.result };
}

it(
  "carries a canned observation outcome, one of the four evidence-result endings, for every concept the " +
    "fixture case's hypotheses collect",
  async () => {
    const theCase = await loadFixtureCase();
    const observations = await loadCannedObservations();
    const collected = collectionPlan(theCase);

    for (const concept of collected) {
      const observation = observations.find((entry) => entry.concept === concept);
      expect(observation).toBeDefined();
      expect(EVIDENCE_RESULTS).toContain((observation as CannedObservation).result);
    }
  },
);

it(
  'seeds the real stand-in observation source with the canned outcome for every collected concept and reads ' +
    'each one back unchanged through observe-concept',
  async () => {
    const theCase = await loadFixtureCase();
    const observations = await loadCannedObservations();
    const collected = collectionPlan(theCase);
    const subject = buildSubject(theCase.subject, [{ attribute: 'contract-number', value: 'CTR-0001' }]);
    const source = new FakeObservationSource();
    for (const concept of collected) {
      const canned = cannedFor(observations, concept);
      source.seed(concept, subject, outcomeOf(canned));
    }

    for (const concept of collected) {
      const canned = cannedFor(observations, concept);
      await expect(source.observeConcept(concept, subject, 'a-test-requester')).resolves.toEqual(
        outcomeOf(canned),
      );
    }
  },
);

/** The canned entry for one concept, or a setup failure naming which concept the fixture left uncanned. */
function cannedFor(observations: readonly CannedObservation[], concept: string): CannedObservation {
  const canned = observations.find((entry) => entry.concept === concept);
  if (canned === undefined) {
    throw new Error(`no canned observation for concept "${concept}"`);
  }
  return canned;
}

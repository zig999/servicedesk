// Wires the diagnose HTTP surface for a real process
// (task/http-surface/diagnose-http-endpoint): the file-backed case query and
// the production diagnose runner behind the given env's own data
// directories and model configuration, plus one FakeObservationSource
// seeded from the fixture's own canned observations.json — the stand-in
// this MVP runs against since no real corporate-records connector exists
// yet (contracts/integration/corporate-records-source's own declared
// remainder). Never listens itself: buildApp's own instance is handed back
// unstarted, so only src/index.ts calls .listen().

import { readFile } from 'node:fs/promises';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Env } from '../config/env.js';
import { buildApp } from '../http/build-app.js';
import { EVIDENCE_RESULTS } from '../investigation/evidence-result.js';
import { FakeObservationSource } from '../investigation/fake-observation-source.adapter.js';
import type { ObservationOutcome, Subject } from '../investigation/observation-source.port.js';
import { buildSubject } from '../investigation/subject.js';
import { createCaseQuery } from './case-query.factory.js';
import { createProductionDiagnoseRunner, type ProductionDiagnoseDependencies } from './production-diagnose.factory.js';

/**
 * The one subject this MVP's stand-in observation source answers for:
 * observations.json carries no subject of its own (it is keyed by concept
 * alone) and no specification node names a canonical subject for this
 * fixture case, so this factory's own inference fixes one — the same
 * subject-type/attribute-name convention the fixture task's own
 * case-fixture-observations.spec.ts already demonstrates the stand-in
 * against. A request naming a different subject still validates and still
 * runs; it simply finds no seeded evidence for it, the same real gap a live
 * corporate-records connector would eventually close.
 */
const SEEDED_SUBJECT: Subject = buildSubject('contract', [{ attribute: 'contract-number', value: 'CTR-0001' }]);

/** The canned observations fixture's own record shape, validated rather than merely asserted (STK-08's own boundary-parsing discipline extended to this fixture read). */
const cannedObservationSchema = z.object({
  concept: z.string().min(1),
  result: z.enum(EVIDENCE_RESULTS),
  observation: z.string().optional(),
});
const cannedObservationsSchema = z.array(cannedObservationSchema);

/**
 * Builds the whole diagnose HTTP surface for a real process: the file-backed
 * case query and production diagnose runner wired from the given env, and a
 * FakeObservationSource seeded from its own OBSERVATIONS_FIXTURE_FILE, all
 * handed to buildApp already built.
 */
export async function createDiagnoseHttpServer(env: Env): Promise<FastifyInstance> {
  const observationSource = new FakeObservationSource();
  await seedFixtureObservations(observationSource, env.OBSERVATIONS_FIXTURE_FILE);
  const caseQuery = createCaseQuery(env.CASE_DATA_DIRECTORY, env.GLOSSARY_DATA_DIRECTORY, env.CAPABILITY_DATA_DIRECTORY);
  const runDiagnose = createProductionDiagnoseRunner(runnerDependencies(env, observationSource));
  return buildApp({ caseQuery, runDiagnose, model: env.EVALUATOR_MODEL, promptVersion: env.PROMPT_VERSION });
}

/** ProductionDiagnoseDependencies assembled from the given env and the already-seeded observation source, kept out of createDiagnoseHttpServer's own body to stay inside MNT-01's line bound. */
function runnerDependencies(env: Env, observationSource: FakeObservationSource): ProductionDiagnoseDependencies {
  return {
    investigationDataDirectory: env.INVESTIGATION_DATA_DIRECTORY,
    glossaryDataDirectory: env.GLOSSARY_DATA_DIRECTORY,
    capabilityDataDirectory: env.CAPABILITY_DATA_DIRECTORY,
    observationSource,
    poolSize: env.POOL_SIZE,
    defaultConsolidationRegister: env.DEFAULT_CONSOLIDATION_REGISTER,
    evaluatorModel: env.EVALUATOR_MODEL,
    evaluatorMaxTokens: env.EVALUATOR_MAX_TOKENS,
    consolidatorModel: env.CONSOLIDATOR_MODEL,
    consolidatorMaxTokens: env.CONSOLIDATOR_MAX_TOKENS,
  };
}

/** Seeds the given source with one canned outcome per concept the fixture file declares, all for SEEDED_SUBJECT. */
async function seedFixtureObservations(source: FakeObservationSource, file: string): Promise<void> {
  const raw = await readFile(file, 'utf8');
  const canned = cannedObservationsSchema.parse(JSON.parse(raw));
  for (const entry of canned) {
    source.seed(entry.concept, SEEDED_SUBJECT, outcomeOf(entry));
  }
}

/** One canned entry's data as one of the four evidence-result endings ObservationOutcome declares. */
function outcomeOf(entry: z.infer<typeof cannedObservationSchema>): ObservationOutcome {
  return entry.result === 'ok' ? { result: 'ok', observation: entry.observation ?? '' } : { result: entry.result };
}

// Proof for the published query over the real relational store, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned): each read
// answers the holding as the tables state it at that moment, so data changed between two reads
// answers the new holding, never a remembered one. Every test baits a cache with a first read
// before changing the row underneath it.
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed a fresh temp
// directory per test and write a plain JSON file the way the store used to persist one;
// createGlossaryQuery now takes the one shared DatabaseConnection this task's own cutover wires
// everywhere, so this file writes rows directly against the real tables instead, each under a
// freshly generated name so no test here can collide with a row any other suite file wrote.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { createGlossaryQuery } from '../../../factories/glossary.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

let pool: DatabaseConnection;
let actionsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let conceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM concept_accepts WHERE concept_name = ANY($1)', [conceptsWrittenByThisTest]);
    await pool.query('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
    conceptsWrittenByThisTest = [];
  }
  if (subjectTypesWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
    subjectTypesWrittenByThisTest = [];
  }
  if (actionsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
    actionsWrittenByThisTest = [];
  }
});

/** Writes one action row directly against the real table, tracked for this file's own afterEach cleanup. */
async function insertAction(name: string): Promise<void> {
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [name]);
  actionsWrittenByThisTest.push(name);
}

/** Removes one action row directly, so a test can prove a term no longer answers once its row is gone. */
async function deleteAction(name: string): Promise<void> {
  await pool.query('DELETE FROM actions WHERE name = $1', [name]);
  actionsWrittenByThisTest = actionsWrittenByThisTest.filter((tracked) => tracked !== name);
}

/** Writes one subject type row directly, tracked for this file's own afterEach cleanup — concept_accepts' own foreign key needs it before a concept can accept it. */
async function insertSubjectType(name: string): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [name]);
  subjectTypesWrittenByThisTest.push(name);
}

/** Writes one concept row plus its own concept_accepts row directly, tracked for this file's own afterEach cleanup. */
async function insertConcept(name: string, subjectType: string, ttl: number): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2)', [name, ttl]);
  conceptsWrittenByThisTest.push(name);
  await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [name, subjectType]);
}

/** Replaces one concept row's own ttl directly against the real table, bypassing every store API. */
async function updateConceptTtl(name: string, ttl: number): Promise<void> {
  await pool.query('UPDATE concepts SET ttl = $1 WHERE name = $2', [ttl, name]);
}

it('answers a term added to the data since the previous read', async () => {
  const firstTerm = `glossary-query-first-term-${randomUUID()}`;
  const laterTerm = `glossary-query-later-term-${randomUUID()}`;
  await insertAction(firstTerm);
  const query = createGlossaryQuery(pool);
  await query.readVocabularyTerm('action', laterTerm); // arranged to bait a remembered holding
  await insertAction(laterTerm);

  const resolution = await query.readVocabularyTerm('action', laterTerm);

  expect(resolution).toEqual({ held: true, term: { name: laterTerm } });
});

it('no longer answers a term removed from the data since the previous read', async () => {
  const removedTerm = `glossary-query-removed-term-${randomUUID()}`;
  await insertAction(removedTerm);
  const query = createGlossaryQuery(pool);
  await query.readVocabularyTerm('action', removedTerm); // answers it held, baiting a memory
  await deleteAction(removedTerm);

  const resolution = await query.readVocabularyTerm('action', removedTerm);

  expect(resolution).toEqual({ held: false, vocabulary: 'action', name: removedTerm });
});

it("answers a concept's ttl as the data now states it, not as it stood at the previous read", async () => {
  const subjectType = `glossary-query-subject-${randomUUID()}`;
  const concept = `glossary-query-concept-${randomUUID()}`;
  await insertSubjectType(subjectType);
  await insertConcept(concept, subjectType, 120);
  const query = createGlossaryQuery(pool);
  await query.readConcept(concept); // arranged to bait a remembered holding
  await updateConceptTtl(concept, 600);

  const resolution = await query.readConcept(concept);

  expect(resolution).toEqual({
    held: true,
    concept: { name: concept, accepts: [subjectType], ttl: 600 },
  });
});

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { collectionPlan } from '../../../case/case-resolution.js';
import type { Case } from '../../../case/case.js';
import { parseCaseDocument } from '../../../case/parse-case-document.js';
import type { ConceptRegistration, GlossaryTerm } from '../../../glossary/terms.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';

async function loadFixtureCase(): Promise<Case> {
  const file = join(FIXTURES_ROOT, 'case', SLUG, '1.json');
  const raw = JSON.parse(await readFile(file, 'utf8')) as unknown;
  return parseCaseDocument(raw, SLUG);
}

async function readJsonArray<T>(...segments: readonly string[]): Promise<readonly T[]> {
  const text = await readFile(join(FIXTURES_ROOT, ...segments), 'utf8');
  return JSON.parse(text) as readonly T[];
}

it("names a subject type that exists in the fixture glossary's subject-type vocabulary", async () => {
  const theCase = await loadFixtureCase();

  const subjectTypes = await readJsonArray<GlossaryTerm>('glossary', 'subject-type.json');

  expect(subjectTypes.map((term) => term.name)).toContain(theCase.subject);
});

it("names only outcomes, actions and recipients that exist in the fixture glossary's matching vocabulary files", async () => {
  const theCase = await loadFixtureCase();
  const resolutions = [...theCase.hypotheses.map((hypothesis) => hypothesis.resolution), theCase.fallback];
  const outcomes = await readJsonArray<GlossaryTerm>('glossary', 'outcome.json');
  const actions = await readJsonArray<GlossaryTerm>('glossary', 'action.json');
  const recipients = await readJsonArray<GlossaryTerm>('glossary', 'recipient.json');

  for (const resolution of resolutions) {
    expect(outcomes.map((term) => term.name)).toContain(resolution.outcome);
    expect(actions.map((term) => term.name)).toContain(resolution.referral.action);
    expect(recipients.map((term) => term.name)).toContain(resolution.referral.recipient);
  }
});

it('carries both non-conclusion outcomes in its own outcome vocabulary file, ahead of any case reading', async () => {
  const outcomes = await readJsonArray<GlossaryTerm>('glossary', 'outcome.json');
  const names = outcomes.map((term) => term.name);

  for (const nonConclusion of NON_CONCLUSION_OUTCOMES) {
    expect(names).toContain(nonConclusion.name);
  }
});

it("registers every concept the fixture hypotheses collect to accept the case's own declared subject type, per the fixture glossary's own concept file", async () => {
  const theCase = await loadFixtureCase();
  const concepts = await readJsonArray<ConceptRegistration>('glossary', 'concept.json');
  const collected = collectionPlan(theCase);

  for (const name of collected) {
    const concept = concepts.find((candidate) => candidate.name === name);
    expect(concept).toBeDefined();
    expect(concept?.accepts ?? []).toContain(theCase.subject);
  }
});

it('answers every concept the fixture hypotheses collect with a registered read-only capability declaring an output schema and an integer timeout', async () => {
  const theCase = await loadFixtureCase();
  const capabilities = await readJsonArray<Capability>('capability', 'capability.json');
  const collected = collectionPlan(theCase);

  for (const name of collected) {
    const capability = capabilities.find((candidate) => candidate.concept === name);
    expect(capability).toBeDefined();
    expect(capability?.nature).toBe('read-only');
    expect((capability?.output_schema ?? '').length).toBeGreaterThan(0);
    expect(Number.isInteger(capability?.timeout)).toBe(true);
  }
});

it("states an explicit ttl on at least one collected concept's registration in the fixture glossary", async () => {
  const theCase = await loadFixtureCase();
  const concepts = await readJsonArray<ConceptRegistration>('glossary', 'concept.json');
  const collected = collectionPlan(theCase);

  const withExplicitTtl = collected.filter((name) => {
    const concept = concepts.find((candidate) => candidate.name === name);
    return concept !== undefined && typeof concept.ttl === 'number';
  });

  expect(withExplicitTtl.length).toBeGreaterThanOrEqual(1);
});

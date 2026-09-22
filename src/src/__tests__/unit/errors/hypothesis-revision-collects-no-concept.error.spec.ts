import { expect, it } from 'vitest';
import { ConceptNotInGlossaryError } from '../../../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../../../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../../../errors/hypothesis-revision-collects-no-concept.error.js';

it('states its message in Brazilian Portuguese, naming the hypothesis and the case slug, and stating that a revision collects at least one concept', () => {
  const error = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');

  expect(error.message).toBe(
    'a hipótese "a-hypothesis" do caso "a-slug" não coleta nenhum conceito, e uma revisão coleta ao menos um',
  );
});

it('names a hypothesis as "hipótese", a case as "caso", a hypothesis revision as "revisão" and a concept as "conceito", using no English domain noun', () => {
  const error = new HypothesisRevisionCollectsNoConceptError('another-slug', 'segunda-hipotese');

  expect(error.message).toContain('hipótese');
  expect(error.message).toContain('caso');
  expect(error.message).toContain('revisão');
  expect(error.message).toContain('conceito');
  expect(error.message).not.toMatch(/\bhypothesis\b/i);
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\brevision\b/i);
  expect(error.message).not.toMatch(/\bconcept\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');

  expect(error.name).toBe('HypothesisRevisionCollectsNoConceptError');
});

it('carries exactly the slug and hypothesis name in context, with no value moved into or out of it', () => {
  const error = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');

  expect(error.context).toEqual({ slug: 'a-slug', hypothesis_name: 'a-hypothesis' });
});

it('is distinguishable from ConceptNotInGlossaryError by text alone, for the same hypothesis, case and concepts', () => {
  const collectsNone = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');
  const notInGlossary = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['a-concept']);

  expect(collectsNone.message).not.toBe(notInGlossary.message);
});

it('is distinguishable from ConceptRefusesSubjectTypeError by text alone, for the same hypothesis, case and concepts', () => {
  const collectsNone = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');
  const refusesSubjectType = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'a-subject-type',
    concepts: ['a-concept'],
  });

  expect(collectsNone.message).not.toBe(refusesSubjectType.message);
});

it('keeps ConceptNotInGlossaryError distinguishable from ConceptRefusesSubjectTypeError by text alone, for the same hypothesis, case and concepts', () => {
  const notInGlossary = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['a-concept']);
  const refusesSubjectType = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'a-subject-type',
    concepts: ['a-concept'],
  });

  expect(notInGlossary.message).not.toBe(refusesSubjectType.message);
});

it('names the hypothesis and the case in the same order and with the same PT-br wording as ConceptNotInGlossaryError and ConceptRefusesSubjectTypeError', () => {
  const collectsNone = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');
  const notInGlossary = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['a-concept']);
  const refusesSubjectType = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'a-subject-type',
    concepts: ['a-concept'],
  });

  const sharedOpening = 'a hipótese "a-hypothesis" do caso "a-slug"';
  expect(collectsNone.message.startsWith(sharedOpening)).toBe(true);
  expect(notInGlossary.message.startsWith(sharedOpening)).toBe(true);
  expect(refusesSubjectType.message.startsWith(sharedOpening)).toBe(true);
});

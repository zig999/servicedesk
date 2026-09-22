import { expect, it } from 'vitest';
import { ConceptNotInGlossaryError } from '../../../errors/concept-not-in-glossary.error.js';

it('states its message in Brazilian Portuguese, naming the hypothesis, the case slug and the concepts the glossary does not hold', () => {
  const error = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['concept-one', 'concept-two']);

  expect(error.message).toBe(
    'a hipótese "a-hypothesis" do caso "a-slug" coleta um conceito que o glossário não possui: concept-one, concept-two',
  );
});

it('names a hypothesis as "hipótese", a case as "caso" and a concept as "conceito", using no English domain noun', () => {
  const error = new ConceptNotInGlossaryError('another-slug', 'segunda-hipotese', ['outro-termo']);

  expect(error.message).toContain('hipótese');
  expect(error.message).toContain('caso');
  expect(error.message).toContain('conceito');
  expect(error.message).not.toMatch(/\bhypothesis\b/i);
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bconcept\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['a-concept']);

  expect(error.name).toBe('ConceptNotInGlossaryError');
});

it('carries exactly the slug, hypothesis name and concepts in context, with no value moved into or out of it', () => {
  const error = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['concept-one', 'concept-two']);

  expect(error.context).toEqual({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    concepts: ['concept-one', 'concept-two'],
  });
});

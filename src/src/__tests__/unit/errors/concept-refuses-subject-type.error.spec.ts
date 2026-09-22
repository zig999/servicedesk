import { expect, it } from 'vitest';
import { ConceptRefusesSubjectTypeError } from '../../../errors/concept-refuses-subject-type.error.js';

it('states its message in Brazilian Portuguese, naming the hypothesis, the case slug, the declared subject type and the concepts that refuse it', () => {
  const error = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'customer',
    concepts: ['equipment-state'],
  });

  expect(error.message).toBe(
    'a hipótese "a-hypothesis" do caso "a-slug" coleta um conceito que não aceita o tipo de sujeito "customer" que a versão do caso declara: equipment-state',
  );
});

it('names a hypothesis as "hipótese", a case as "caso" and a concept as "conceito", using no English domain noun', () => {
  const error = new ConceptRefusesSubjectTypeError({
    slug: 'another-slug',
    hypothesis_name: 'segunda-hipotese',
    subject: 'customer',
    concepts: ['outro-termo'],
  });

  expect(error.message).toContain('hipótese');
  expect(error.message).toContain('caso');
  expect(error.message).toContain('conceito');
  expect(error.message).not.toMatch(/\bhypothesis\b/i);
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bconcept\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'customer',
    concepts: ['equipment-state'],
  });

  expect(error.name).toBe('ConceptRefusesSubjectTypeError');
});

it('carries exactly the slug, hypothesis name, subject and concepts in context, with no value moved into or out of it', () => {
  const error = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'customer',
    concepts: ['equipment-state'],
  });

  expect(error.context).toEqual({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'customer',
    concepts: ['equipment-state'],
  });
});

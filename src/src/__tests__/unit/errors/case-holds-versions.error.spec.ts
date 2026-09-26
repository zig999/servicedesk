import { expect, it } from 'vitest';
import { CaseHoldsVersionsError } from '../../../errors/case-holds-versions.error.js';

it('keeps its class-name string unchanged', () => {
  const error = new CaseHoldsVersionsError('a-slug');

  expect(error.name).toBe('CaseHoldsVersionsError');
});

it(
  'names the case slug in a Brazilian-Portuguese message that calls the case "caso" and never the ' +
    'English word "case"',
  () => {
    const error = new CaseHoldsVersionsError('cliente-sem-internet');

    expect(error.message).toContain('cliente-sem-internet');
    expect(error.message).toMatch(/\bcaso\b/);
    expect(error.message).toMatch(/exclu[ií]do/i);
    expect(error.message).not.toMatch(/\bcase\b/i);
  },
);

it('holds exactly the slug it was constructed with, in its context, and no other field', () => {
  const error = new CaseHoldsVersionsError('a-slug');

  expect(error.context).toEqual({ slug: 'a-slug' });
});

it(
  'names the remaining version by its fixed Portuguese noun "versão", unlike an implementation that ' +
    'would satisfy criteria 6-8 alone by writing the English word "versions" and the raw lifecycle ' +
    'token "draft"',
  () => {
    const error = new CaseHoldsVersionsError('a-slug');

    expect(error.message).toMatch(/\bversão\b/);
    expect(error.message).not.toMatch(/\bversions?\b/i);
    expect(error.message).not.toMatch(/\bdraft\b/i);
  },
);

it(
  'extends Error directly and carries no status of its own, unlike an implementation that would ' +
    'satisfy every stated criterion by subclassing a web framework\'s own HTTP error type and setting ' +
    'status 409 itself',
  () => {
    const error = new CaseHoldsVersionsError('a-slug');

    expect(Object.getPrototypeOf(CaseHoldsVersionsError)).toBe(Error);
    expect('statusCode' in error).toBe(false);
  },
);

import { expect, it } from 'vitest';
import { CaseHoldsNoDraftError } from '../../../errors/case-holds-no-draft.error.js';

it('names the case before it states the state that refuses the act', () => {
  const slug = 'a-slug-naming-the-case';

  const error = new CaseHoldsNoDraftError(slug);

  expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf('rascunho'));
});

it(
  'names the case slug and states, in Brazilian Portuguese, that the case holds no version in ' +
    'draft and that a hypothesis is revised only against its case\'s draft',
  () => {
    const error = new CaseHoldsNoDraftError('cliente-sem-internet');

    expect(error.message).toContain('cliente-sem-internet');
    expect(error.message).toMatch(/\bcaso\b/);
    expect(error.message).toMatch(/\bversão\b/);
    expect(error.message).toMatch(/\brascunho\b/);
    expect(error.message).toMatch(/\bhip[oó]tese\b/);
    expect(error.message).toMatch(/n[ãa]o possui nenhuma/i);
    expect(error.message).toMatch(/revisada/i);
    expect(error.message).not.toMatch(/\bcase\b/i);
    expect(error.message).not.toMatch(/\bdraft\b/i);
    expect(error.message).not.toMatch(/\bversion\b/i);
    expect(error.message).not.toMatch(/\bhypothesis\b/i);
  },
);

it('keeps its class-name string unchanged', () => {
  const error = new CaseHoldsNoDraftError('a-slug');

  expect(error.name).toBe('CaseHoldsNoDraftError');
});

it('holds exactly the slug it was constructed with, in its context', () => {
  const error = new CaseHoldsNoDraftError('a-slug');

  expect(error.context).toEqual({ slug: 'a-slug' });
});

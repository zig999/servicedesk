import { expect, it } from 'vitest';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';

it('names the case before it states the state that refuses the act', () => {
  const slug = 'a-slug-naming-the-case';

  const error = new CaseAlreadyHasDraftError(slug);

  expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf('rascunho'));
});

it(
  'names the case slug and states, in Brazilian Portuguese, that the case already holds a ' +
    'version in draft and holds at most one at a time',
  () => {
    const error = new CaseAlreadyHasDraftError('cliente-sem-internet');

    expect(error.message).toContain('cliente-sem-internet');
    expect(error.message).toMatch(/\bcaso\b/);
    expect(error.message).toMatch(/\bversão\b/);
    expect(error.message).toMatch(/\brascunho\b/);
    expect(error.message).toMatch(/j[áa] possui/i);
    expect(error.message).toMatch(/no m[áa]ximo/i);
    expect(error.message).not.toMatch(/\bcase\b/i);
    expect(error.message).not.toMatch(/\bdraft\b/i);
    expect(error.message).not.toMatch(/\bversion\b/i);
  },
);

it('keeps its class-name string unchanged', () => {
  const error = new CaseAlreadyHasDraftError('a-slug');

  expect(error.name).toBe('CaseAlreadyHasDraftError');
});

it('holds exactly the slug it was constructed with, in its context', () => {
  const error = new CaseAlreadyHasDraftError('a-slug');

  expect(error.context).toEqual({ slug: 'a-slug' });
});

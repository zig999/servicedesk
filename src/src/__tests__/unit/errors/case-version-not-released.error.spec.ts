import { expect, it } from 'vitest';
import { CaseVersionNotReleasedError } from '../../../errors/case-version-not-released.error.js';

it('names the case and its version before it states the state that refuses the act', () => {
  const slug = 'a-slug-naming-the-case';
  const state = 'a-distinctive-state-value-this-test-recognizes';

  const error = new CaseVersionNotReleasedError(slug, 3, state);

  expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf(state));
});

it(
  'names the case slug, the version number and the state the version is in, and states, in ' +
    'Brazilian Portuguese, that diagnosis runs only against a released version',
  () => {
    const error = new CaseVersionNotReleasedError('cliente-sem-internet', 4, 'draft');

    expect(error.message).toContain('cliente-sem-internet');
    expect(error.message).toContain('4');
    expect(error.message).toContain('draft');
    expect(error.message).toMatch(/\bcaso\b/);
    expect(error.message).toMatch(/\bversão\b/);
    expect(error.message).toMatch(/\bliberada\b/);
    expect(error.message).toMatch(/diagn[oó]stico/i);
    expect(error.message).not.toMatch(/\bcase\b/i);
    expect(error.message).not.toMatch(/\breleased\b/i);
  },
);

it('keeps its class-name string unchanged', () => {
  const error = new CaseVersionNotReleasedError('a-slug', 1, 'draft');

  expect(error.name).toBe('CaseVersionNotReleasedError');
});

it('holds exactly the slug, version and state it was constructed with, in its context', () => {
  const error = new CaseVersionNotReleasedError('a-slug', 7, 'draft');

  expect(error.context).toEqual({ slug: 'a-slug', version: 7, state: 'draft' });
});

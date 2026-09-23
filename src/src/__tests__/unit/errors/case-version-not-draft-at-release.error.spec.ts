import { expect, it } from 'vitest';
import { CaseVersionNotDraftAtReleaseError } from '../../../errors/case-version-not-draft-at-release.error.js';

it('names the case and its version before it states the state that refuses the act', () => {
  const slug = 'a-slug-naming-the-case';
  const state = 'draft';

  const error = new CaseVersionNotDraftAtReleaseError(slug, 3, state);

  expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf('rascunho'));
});

it(
  'names the case slug, the version number and the state the version is in, and states, in ' +
    'Brazilian Portuguese, that release only ever moves a version out of draft',
  () => {
    const error = new CaseVersionNotDraftAtReleaseError('cliente-sem-internet', 4, 'released');

    expect(error.message).toContain('cliente-sem-internet');
    expect(error.message).toContain('4');
    expect(error.message).toContain('liberada');
    expect(error.message).toMatch(/\bcaso\b/);
    expect(error.message).toMatch(/\bversão\b/);
    expect(error.message).toMatch(/\brascunho\b/);
    expect(error.message).toMatch(/libera[çc][ãa]o/i);
    expect(error.message).toMatch(/gatilho/i);
    expect(error.message).not.toMatch(/\bcase\b/i);
  },
);

it('keeps its class-name string unchanged', () => {
  const error = new CaseVersionNotDraftAtReleaseError('a-slug', 1, 'released');

  expect(error.name).toBe('CaseVersionNotDraftAtReleaseError');
});

it('holds exactly the slug, version and state it was constructed with, in its context', () => {
  const error = new CaseVersionNotDraftAtReleaseError('a-slug', 7, 'released');

  expect(error.context).toEqual({ slug: 'a-slug', version: 7, state: 'released' });
});

it('never leaks the raw lifecycle token into its message, for either state', () => {
  const draftState = new CaseVersionNotDraftAtReleaseError('a-slug', 1, 'draft');
  const releasedState = new CaseVersionNotDraftAtReleaseError('a-slug', 1, 'released');

  expect(draftState.message).not.toContain('draft');
  expect(releasedState.message).not.toContain('released');
});

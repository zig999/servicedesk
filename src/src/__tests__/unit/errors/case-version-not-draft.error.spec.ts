import { expect, it } from 'vitest';
import { CaseVersionNotDraftAtReleaseError } from '../../../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotDraftError } from '../../../errors/case-version-not-draft.error.js';
import { CaseVersionNotReleasedError } from '../../../errors/case-version-not-released.error.js';

it('names the case and its version before it states the state that refuses the act', () => {
  const slug = 'a-slug-naming-the-case';
  const state = 'draft';

  const error = new CaseVersionNotDraftError(slug, 3, state);

  expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf('rascunho'));
});

it(
  'names the case slug, the version number and the state the version is in instead of draft, ' +
    'in Brazilian Portuguese',
  () => {
    const error = new CaseVersionNotDraftError('cliente-sem-internet', 4, 'released');

    expect(error.message).toContain('cliente-sem-internet');
    expect(error.message).toContain('4');
    expect(error.message).toContain('liberada');
    expect(error.message).toMatch(/\bcaso\b/);
    expect(error.message).toMatch(/\bversão\b/);
    expect(error.message).toMatch(/\brascunho\b/);
    expect(error.message).toMatch(/n[ãa]o em rascunho/i);
    expect(error.message).not.toMatch(/\bcase\b/i);
  },
);

it('keeps its class-name string unchanged', () => {
  const error = new CaseVersionNotDraftError('a-slug', 1, 'released');

  expect(error.name).toBe('CaseVersionNotDraftError');
});

it('holds exactly the slug, version and state it was constructed with, in its context', () => {
  const error = new CaseVersionNotDraftError('a-slug', 7, 'released');

  expect(error.context).toEqual({ slug: 'a-slug', version: 7, state: 'released' });
});

it('is distinguishable from CaseVersionNotReleasedError by its text alone, given the same slug, version and state', () => {
  const notDraftMessage = new CaseVersionNotDraftError('a-slug', 3, 'released').message;
  const notReleasedMessage = new CaseVersionNotReleasedError('a-slug', 3, 'released').message;

  expect(notDraftMessage).not.toBe(notReleasedMessage);
});

it('is distinguishable from CaseVersionNotDraftAtReleaseError by its text alone, given the same slug, version and state', () => {
  const notDraftMessage = new CaseVersionNotDraftError('a-slug', 3, 'released').message;
  const notDraftAtReleaseMessage = new CaseVersionNotDraftAtReleaseError('a-slug', 3, 'released').message;

  expect(notDraftMessage).not.toBe(notDraftAtReleaseMessage);
});

it('is distinguishable from CaseVersionNotDraftAtReleaseError and CaseVersionNotReleasedError from each other, by text alone, given the same slug, version and state', () => {
  const notReleasedMessage = new CaseVersionNotReleasedError('a-slug', 3, 'released').message;
  const notDraftAtReleaseMessage = new CaseVersionNotDraftAtReleaseError('a-slug', 3, 'released').message;

  expect(notReleasedMessage).not.toBe(notDraftAtReleaseMessage);
});

it('never leaks the raw lifecycle token into its message, for either state', () => {
  const draftState = new CaseVersionNotDraftError('a-slug', 1, 'draft');
  const releasedState = new CaseVersionNotDraftError('a-slug', 1, 'released');

  expect(draftState.message).not.toContain('draft');
  expect(releasedState.message).not.toContain('released');
});

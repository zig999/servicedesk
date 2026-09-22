import { expect, it } from 'vitest';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';

it('names the case and its version before it states the kind of rule that refuses the release', () => {
  const slug = 'a-slug-naming-the-case';
  const violation = 'a violated rule this test recognizes by this exact phrase';

  const error = new CaseVersionNotReleasableError(slug, 3, [violation]);

  expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf(violation));
});

it('names the case slug, the version number and every violation that refuses the release, in Brazilian Portuguese', () => {
  const error = new CaseVersionNotReleasableError('cliente-sem-internet', 4, [
    'first violation',
    'second violation',
  ]);

  expect(error.message).toContain('cliente-sem-internet');
  expect(error.message).toContain('4');
  expect(error.message).toContain('first violation');
  expect(error.message).toContain('second violation');
  expect(error.message).toMatch(/\bcaso\b/);
  expect(error.message).toMatch(/\bversão\b/);
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bversion\b/i);
});

it(
  'states explicitly that no rule was specifically identified, rather than trailing off with an ' +
    'unexplained empty violation list, when release finds no violation to name',
  () => {
    const error = new CaseVersionNotReleasableError('a-slug', 3, []);

    expect(error.message.trim()).not.toMatch(/:\s*$/);
    expect(error.message.length).toBeGreaterThan(0);
  },
);

it('keeps its class-name string unchanged', () => {
  const error = new CaseVersionNotReleasableError('a-slug', 1, ['a violation']);

  expect(error.name).toBe('CaseVersionNotReleasableError');
});

const contextScenarios: readonly [string, readonly string[]][] = [
  ['violations present', ['first violation', 'second violation']],
  ['no violation found', []],
];

it.each(contextScenarios)(
  'holds exactly the slug, version and violations it was constructed with, in its context, when %s',
  (_label, violations) => {
    const error = new CaseVersionNotReleasableError('a-slug', 7, violations);

    expect(error.context).toEqual({ slug: 'a-slug', version: 7, violations });
  },
);

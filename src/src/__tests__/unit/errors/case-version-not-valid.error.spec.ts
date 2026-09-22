import { expect, it } from 'vitest';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';
import { CaseVersionNotValidError } from '../../../errors/case-version-not-valid.error.js';

function longestCommonSuffixLength(left: string, right: string): number {
  let length = 0;
  while (
    length < left.length &&
    length < right.length &&
    left[left.length - 1 - length] === right[right.length - 1 - length]
  ) {
    length += 1;
  }
  return length;
}

it('names the case and its version before it states the kind of rule that refuses it', () => {
  const slug = 'a-slug-naming-the-case';
  const violation = 'a violated rule this test recognizes by this exact phrase';

  const error = new CaseVersionNotValidError(slug, 3, [violation]);

  expect(error.message.indexOf(slug)).toBeLessThan(error.message.indexOf(violation));
});

it('names the case slug, the version number and every validator rule the version violates, in Brazilian Portuguese', () => {
  const error = new CaseVersionNotValidError('cliente-sem-internet', 4, [
    'first rule violated',
    'second rule violated',
  ]);

  expect(error.message).toContain('cliente-sem-internet');
  expect(error.message).toContain('4');
  expect(error.message).toContain('first rule violated');
  expect(error.message).toContain('second rule violated');
  expect(error.message).toMatch(/\bcaso\b/);
  expect(error.message).toMatch(/\bversão\b/);
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bversion\b/i);
});

it('keeps its class-name string unchanged', () => {
  const error = new CaseVersionNotValidError('a-slug', 1, ['a violation']);

  expect(error.name).toBe('CaseVersionNotValidError');
});

it('holds exactly the slug, version and violations it was constructed with, in its context', () => {
  const violations = ['first violation', 'second violation'];

  const error = new CaseVersionNotValidError('a-slug', 7, violations);

  expect(error.context).toEqual({ slug: 'a-slug', version: 7, violations });
});

it('introduces the joined list of violations with the same wording as CaseVersionNotReleasableError does', () => {
  const violation = 'a distinctive violation this test uses only to anchor the comparison';

  const validMessage = new CaseVersionNotValidError('a-slug', 3, [violation]).message;
  const releasableMessage = new CaseVersionNotReleasableError('a-slug', 3, [violation]).message;

  const sharedSuffixLength = longestCommonSuffixLength(validMessage, releasableMessage);

  expect(sharedSuffixLength).toBeGreaterThan(violation.length);
});

it('is distinguishable from CaseVersionNotReleasableError by its text alone, given the same slug, version and violations', () => {
  const validMessage = new CaseVersionNotValidError('a-slug', 3, ['a violation']).message;
  const releasableMessage = new CaseVersionNotReleasableError('a-slug', 3, ['a violation']).message;

  expect(validMessage).not.toBe(releasableMessage);
});

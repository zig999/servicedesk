import { expect, it } from 'vitest';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';

it('states its message in Brazilian Portuguese, naming the case slug and the version number no stored version answers', () => {
  const error = new CaseNotFoundError('a-slug', 3);

  expect(error.message).toBe('o caso "a-slug" não tem a versão 3 armazenada');
});

it('names a case as "caso" and a case version as "versão", using no English domain noun', () => {
  const error = new CaseNotFoundError('another-slug', 7);

  expect(error.message).toContain('caso');
  expect(error.message).toContain('versão');
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bversion\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new CaseNotFoundError('a-slug', 3);

  expect(error.name).toBe('CaseNotFoundError');
});

it('carries exactly the slug and version in context, with no value moved into or out of it', () => {
  const error = new CaseNotFoundError('a-slug', 3);

  expect(error.context).toEqual({ slug: 'a-slug', version: 3 });
});

import { expect, it } from 'vitest';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionAlreadyStoredError } from '../../../errors/case-version-already-stored.error.js';
import { statusForError } from '../../../errors/status-map.js';

it('states in Brazilian Portuguese that a version already stored at that slug and number is never recreated by a new write', () => {
  const error = new CaseVersionAlreadyStoredError('a-slug', 3);

  expect(error.message).toBe(
    'o caso "a-slug" já tem a versão 3 armazenada, e uma versão já armazenada nesse número nunca é recriada por uma nova escrita',
  );
});

it("never claims the version's content is never altered, only that it is never recreated", () => {
  const error = new CaseVersionAlreadyStoredError('a-slug', 3);

  expect(error.message).not.toMatch(/alterad/i);
});

it('names a case as "caso" and a case version as "versão", using no English domain noun', () => {
  const error = new CaseVersionAlreadyStoredError('another-slug', 7);

  expect(error.message).toContain('caso');
  expect(error.message).toContain('versão');
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bversion\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new CaseVersionAlreadyStoredError('a-slug', 3);

  expect(error.name).toBe('CaseVersionAlreadyStoredError');
});

it('carries exactly the slug and version in context, with no value moved into or out of it', () => {
  const error = new CaseVersionAlreadyStoredError('a-slug', 3);

  expect(error.context).toEqual({ slug: 'a-slug', version: 3 });
});

it('is distinguishable from CaseNotFoundError by text alone, for the same slug and version', () => {
  const alreadyStored = new CaseVersionAlreadyStoredError('a-slug', 3);
  const notFound = new CaseNotFoundError('a-slug', 3);

  expect(alreadyStored.message).not.toBe(notFound.message);
});

it('names the case slug and the version number in the same order and with the same wording as CaseNotFoundError', () => {
  const alreadyStored = new CaseVersionAlreadyStoredError('a-slug', 3);
  const notFound = new CaseNotFoundError('a-slug', 3);

  expect(alreadyStored.message).toContain('o caso "a-slug"');
  expect(notFound.message).toContain('o caso "a-slug"');
  expect(alreadyStored.message).toContain('a versão 3 armazenada');
  expect(notFound.message).toContain('a versão 3 armazenada');
  expect(alreadyStored.message.indexOf('o caso "a-slug"')).toBeLessThan(
    alreadyStored.message.indexOf('a versão 3 armazenada'),
  );
  expect(notFound.message.indexOf('o caso "a-slug"')).toBeLessThan(notFound.message.indexOf('a versão 3 armazenada'));
});

it('remains absent from the status map, exactly as before this task', () => {
  const error = new CaseVersionAlreadyStoredError('a-slug', 3);

  expect(statusForError(error)).toBeUndefined();
});

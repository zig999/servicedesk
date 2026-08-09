// Proof over the file adapter against a real temporary directory: every
// version of a case persists as its own plain JSON file, no second file ever
// holds any part of a case, an earlier version stays readable once a later
// one is written, the index answering listVersions is the directory's own
// entries rather than a record kept beside them, and the hash a read answers
// is the content identity of the exact bytes that file holds
// (rules/knowledge/every-case-version-remains-readable,
// constraints/a-case-is-stored-as-one-json-document,
// constraints/the-mvp-persists-to-no-database).
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { FileCaseStore } from '../../../persistence/file-case-store.repository.js';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'case-store-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

/** Every file under `root`, as paths relative to it, walked without relying on any one Node version's `readdir` options. */
async function filesUnder(root: string): Promise<readonly string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relative = entry.name;
    if (entry.isDirectory()) {
      const nested = await filesUnder(join(root, relative));
      files.push(...nested.map((file) => join(relative, file)));
    } else {
      files.push(relative);
    }
  }
  return files;
}

/** The sha256 hex of exactly the bytes a file holds, computed independently of the store under test. */
async function independentHashOf(file: string): Promise<string> {
  const bytes = await readFile(file, 'utf8');
  return createHash('sha256').update(bytes, 'utf8').digest('hex');
}

it('persists a written case version as a plain JSON file at <slug>/<version>.json', async () => {
  const store = new FileCaseStore(directory);
  const document = { slug: 'a-case', version: 1, title: 'A stored case' };

  await store.writeVersion('a-case', 1, document);

  const text = await readFile(join(directory, 'a-case', '1.json'), 'utf8');
  expect(JSON.parse(text)).toEqual(document);
});

it('writes no file anywhere in the data directory besides each version file itself', async () => {
  const store = new FileCaseStore(directory);

  await store.writeVersion('first-case', 1, { title: 'first' });
  await store.writeVersion('second-case', 1, { title: 'second' });

  const files = [...(await filesUnder(directory))].sort();
  expect(files).toEqual([join('first-case', '1.json'), join('second-case', '1.json')].sort());
});

it('keeps every earlier version readable after later versions of the same case are written', async () => {
  const store = new FileCaseStore(directory);
  const first = { title: 'first version' };
  const second = { title: 'second version' };
  const third = { title: 'third version' };

  await store.writeVersion('a-case', 1, first);
  await store.writeVersion('a-case', 2, second);
  await store.writeVersion('a-case', 3, third);

  expect(await store.readVersion('a-case', 1)).toMatchObject({ document: first });
  expect(await store.readVersion('a-case', 2)).toMatchObject({ document: second });
  expect(await store.readVersion('a-case', 3)).toMatchObject({ document: third });
});

it('grows the list of versions with each write instead of keeping only the last', async () => {
  const store = new FileCaseStore(directory);

  await store.writeVersion('a-case', 1, { title: 'v1' });
  expect(await store.listVersions('a-case')).toEqual([1]);

  await store.writeVersion('a-case', 2, { title: 'v2' });
  expect(await store.listVersions('a-case')).toEqual([1, 2]);

  await store.writeVersion('a-case', 3, { title: 'v3' });
  expect(await store.listVersions('a-case')).toEqual([1, 2, 3]);
});

it('derives listVersions from the version files present on disk right now, not from a record kept beside them', async () => {
  const store = new FileCaseStore(directory);
  await store.writeVersion('a-case', 1, { title: 'v1' });
  await store.writeVersion('a-case', 2, { title: 'v2' });

  // Removes a version file directly, bypassing the store entirely — there is
  // no manifest for this removal to leave stale.
  await rm(join(directory, 'a-case', '1.json'));

  expect(await store.listVersions('a-case')).toEqual([2]);
});

it('answers a stored version with a hash equal to the sha256 of the exact bytes its file holds', async () => {
  const store = new FileCaseStore(directory);
  await store.writeVersion('a-case', 1, { title: 'A stored case', hypotheses: [1, 2, 3] });

  const read = await store.readVersion('a-case', 1);

  const expectedHash = await independentHashOf(join(directory, 'a-case', '1.json'));
  expect(read?.hash).toBe(expectedHash);
});

it('answers undefined for a version that was never written', async () => {
  const store = new FileCaseStore(directory);
  await store.writeVersion('a-case', 1, { title: 'only version' });

  const read = await store.readVersion('a-case', 2);

  expect(read).toBeUndefined();
});

it('answers no versions for a case slug that was never written', async () => {
  const store = new FileCaseStore(directory);

  const versions = await store.listVersions('a-case-never-written');

  expect(versions).toEqual([]);
});

it('reads one version unaffected by another version file of the same case being unreadable', async () => {
  const store = new FileCaseStore(directory);
  const goodVersion = { title: 'the version being read' };
  await store.writeVersion('a-case', 1, goodVersion);
  // Corrupts a sibling version's file directly, bypassing the store, so the
  // only way this could affect reading version 1 is if reading it touched
  // more than its own file.
  await writeFile(join(directory, 'a-case', '2.json'), 'not json at all', 'utf8');

  const read = await store.readVersion('a-case', 1);

  expect(read?.document).toEqual(goodVersion);
});

it('resolves writeVersion with nothing, leaving hashing to a subsequent read', async () => {
  const store = new FileCaseStore(directory);

  const result = await store.writeVersion('a-case', 1, { title: 'a document' });

  expect(result).toBeUndefined();
});

it('refuses with a CaseStoreError when a version file does not hold valid JSON', async () => {
  const store = new FileCaseStore(directory);
  await mkdir(join(directory, 'a-case'), { recursive: true });
  await writeFile(join(directory, 'a-case', '1.json'), 'not json at all', 'utf8');

  await expect(store.readVersion('a-case', 1)).rejects.toBeInstanceOf(CaseStoreError);
});

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const TESTS_ROOT = fileURLToPath(new URL('../', import.meta.url));

const DDL_VERBS = 'CREATE|ALTER';
const DDL_SUBJECT = 'TABLE';

const DDL_STATEMENT_LITERAL = new RegExp(`\\b(${DDL_VERBS})\\s+${DDL_SUBJECT}\\b`, 'i');

async function specFilesUnder(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await specFilesUnder(entryPath)));
    } else if (entry.name.endsWith('.spec.ts')) {
      found.push(entryPath);
    }
  }
  return found;
}

it('no test in the tree writes a table-creating or table-altering statement of its own', async () => {
  const specFiles = await specFilesUnder(TESTS_ROOT);

  const offenders: string[] = [];
  for (const file of specFiles) {
    const source = await readFile(file, 'utf8');
    if (DDL_STATEMENT_LITERAL.test(source)) {
      offenders.push(file);
    }
  }

  expect(offenders).toEqual([]);
});

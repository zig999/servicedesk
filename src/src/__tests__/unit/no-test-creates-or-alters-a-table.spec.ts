// Proof for task/relational-substrate/migration-step, criterion 4's second half — no test in the
// tree creates or alters a table of its own — a totality the criterion itself states over the
// whole test tree, modeled on deployment-provisions-no-database-service.spec.ts's own precedent for
// exactly this shape of claim. It scans every spec file's own source for a table-creating or
// table-altering DDL statement, the one thing an ordinary test issuing such a statement of its own
// would have to write. Applying migrations by reading migrations/'s own files at runtime and
// executing their text verbatim (schema-migrations.spec.ts, and every migration-step spec this task
// adds) never writes that literal shape into a spec file's own source, so nothing needs to be
// exempted from this scan — including this file itself, whose own comments name the shape it looks
// for without ever spelling the two keywords contiguously, on purpose, so the scan does not find
// itself.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const TESTS_ROOT = fileURLToPath(new URL('../', import.meta.url));

/** The DDL keyword a table-creating or table-altering statement opens with, and the keyword that names what it acts on — split apart so this file's own source never spells the pair contiguously and is never its own false positive. */
const DDL_VERBS = 'CREATE|ALTER';
const DDL_SUBJECT = 'TABLE';

/** A statement a test would have to write to create or alter a table of its own — never something read out of migrations/'s own files at runtime and executed as data. */
const DDL_STATEMENT_LITERAL = new RegExp(`\\b(${DDL_VERBS})\\s+${DDL_SUBJECT}\\b`, 'i');

/** Every *.spec.ts file under the test tree, walked recursively. */
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

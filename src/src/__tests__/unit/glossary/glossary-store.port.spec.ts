import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const MODULE_PATH = fileURLToPath(new URL('../../../glossary/glossary-store.port.ts', import.meta.url));

it('no longer cites the discarded ensure-non-conclusion-outcomes-hotfix task path, citing rules/glossary/the-non-conclusion-outcomes-precede-the-first-case instead', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(source).not.toContain('task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome');
  expect(source).toContain('rules/glossary/the-non-conclusion-outcomes-precede-the-first-case');
});

it("readConcepts' own doc comment cites rules/knowledge/a-collected-concept-declares-a-ttl for the ttl-absent-on-read claim, rather than stating it without attribution", async () => {
  const source = await readFile(MODULE_PATH, 'utf8');

  expect(source).toContain('ttl absent where the registration stated none (rules/knowledge/a-collected-concept-declares-a-ttl)');
  expect(source).toContain('no default resolved on its behalf');
});

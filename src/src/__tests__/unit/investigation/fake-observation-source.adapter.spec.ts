import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/fake-observation-source.adapter.ts', import.meta.url));

function proseOf(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

it("observeConcept's own doc comment cites domain/investigation/evidence-result for the four endings it names, rather than typing them as unattributed prose", async () => {
  const source = await readFile(MODULE_PATH, 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toContain('one of the four evidence-result endings');
  expect(prose).toContain('one of the four endings domain/investigation/evidence-result enumerates (ok, unavailable, denied, timeout)');
});

// Proof for task/stale-specification-citations-round-two/citations-corrected-again, criterion 2:
// observeConcept()'s own doc comment in fake-observation-source.adapter.ts cites
// domain/investigation/evidence-result by identity for the four endings it types, rather than
// describing them as unattributed prose. The fake's own runtime behavior over those four endings
// is proven separately, in observation-source.port.spec.ts — this file proves only the citation.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/fake-observation-source.adapter.ts', import.meta.url));

// Strips every line's own leading comment marker (a line-comment slash pair, or a block-comment
// opener, closer or continuation star) and collapses what remains to one line of prose, so a
// comment wrapped across several source lines compares the same as its own single-line paraphrase.
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

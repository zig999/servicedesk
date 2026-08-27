// Proof for task/stale-specification-citations-round-two/citations-corrected-again, criterion 6:
// the header comment's masking paragraph in test-connector.controller.ts cites
// rules/integration/a-diagnostic-response-masks-a-resolved-credential by identity for the
// credential-masking behavior it describes, rather than framing that behavior as this
// controller's own unattributed inference. handleTestConnectorRequest's own masking behavior is
// proven separately, on the wire, in test-connector.routes.spec.ts — this file proves only the
// citation.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const MODULE_PATH = fileURLToPath(new URL('../../../http/test-connector.controller.ts', import.meta.url));

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

it("the header comment's masking paragraph cites rules/integration/a-diagnostic-response-masks-a-resolved-credential, rather than framing the masking as this controller's own unattributed inference", async () => {
  const source = await readFile(MODULE_PATH, 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import type')));

  expect(header).not.toContain("this controller's own inference");
  expect(header).toContain('rules/integration/a-diagnostic-response-masks-a-resolved-credential');
  expect(header).toContain(
    "a connector configuration's diagnostic call masks whatever value a credential placeholder in its own call resolves to, so the response echoing that call back never carries a credential's real value",
  );
  expect(header).toContain("this project's own standard (SEC-03, SEC-04) independently forbids a credential reaching a client response too");
});

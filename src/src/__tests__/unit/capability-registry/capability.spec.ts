// Proof for task/stale-specification-citations/citations-corrected's own criterion 9, over
// capability.ts: REQUIRED_REGISTRATION_ATTRIBUTES' own doc comment attributes the concept field's
// requiredness to domain/integration/capability, the aggregate-root that declares it, rather than
// to domain/integration/capability-registry, the domain-service that only resolves by it once the
// capability already declares it.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const MODULE_PATH = fileURLToPath(new URL('../../../capability-registry/capability.ts', import.meta.url));

it("attributes the concept field's requiredness to domain/integration/capability, explicitly disclaiming domain/integration/capability-registry", async () => {
  const source = await readFile(MODULE_PATH, 'utf8');
  const prose = source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  expect(prose).toContain('domain/integration/capability\'s own "concept ... required: true"');
  expect(prose).toContain('not a fact of domain/integration/capability-registry');
});

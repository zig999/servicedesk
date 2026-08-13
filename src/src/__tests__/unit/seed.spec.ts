// Proof for the "seed" entry package.json's own record for this delivery adds
// (delivery/relational-persistence/implementation/case-authoring/curated-data-seeded.md): the tree
// holds a runnable step, reachable as "npm run seed", invoking the built seed.ts entry point
// exactly the way "migrate" already invokes migrate.ts's — mirroring
// __tests__/unit/migrate.spec.ts's own pattern for that sibling script exactly. No numbered
// criterion of task/case-authoring/curated-data-seeded names this script entry directly (its six
// criteria are all about what running the seed leaves behind in the database); this proves the
// record's own package.json file change instead. What running the seed actually leaves behind is
// proven directly against the real database in this file's own integration-level sibling
// (__tests__/integration/seed.spec.ts); seed.ts's own top-level composition is left untested here,
// following the same precedent migrate.spec.ts already sets for migrate.ts (see this record's own
// `untested`).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { z } from 'zod';

const MANIFEST_PATH = fileURLToPath(new URL('../../../package.json', import.meta.url));

const manifestScripts = z.object({
  scripts: z.record(z.string(), z.string()).optional(),
});

/** package.json's own "scripts" section, parsed as a boundary input (STK-08) rather than trusted as an untyped JSON.parse result. */
async function readManifestScripts(): Promise<Record<string, string>> {
  const text = await readFile(MANIFEST_PATH, 'utf8');
  const parsed: unknown = JSON.parse(text);
  return manifestScripts.parse(parsed).scripts ?? {};
}

it('the manifest declares a "seed" script that runs the built seed.js from dist/, mirroring "migrate"\'s own precedent', async () => {
  const scripts = await readManifestScripts();

  expect(scripts.seed).toBe('node dist/seed.js');
});

// Proof for task/relational-substrate/migration-step, criterion 1's own wiring: the tree holds a
// runnable step, reachable as "npm run migrate", invoking the built migrate.ts entry point exactly
// the way "start" already invokes index.ts's — through node, from dist/, never from a source file.
// The assertion claims that invocation shape and nothing more: an earlier version of this test
// asserted the whole command line by exact equality, which claimed every flag on it too, and flags
// like --env-file are ground every script in the manifest shares and a sibling task may
// legitimately move — the criterion only ever required that the step exist and run the built entry
// point. What that script does once invoked — reading DATABASE_URL exclusively through loadEnv
// with no default, and applying every pending script in order through applyPendingMigrations — is
// proven directly against those two modules elsewhere in this tree; migrate.ts's own top-level
// composition is left untested here, following the same precedent index.ts's own top-level
// composition already sets (see this record's own `untested`).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { z } from 'zod';

const MANIFEST_PATH = fileURLToPath(new URL('../../../package.json', import.meta.url));

/** The invocation shape criterion 1's wiring requires of the "migrate" script: node runs it, and what it runs is the built dist/migrate.js rather than a source file — whatever flags sit between are the manifest's shared ground, not this task's claim. */
const NODE_RUNS_BUILT_MIGRATE_ENTRY = /^node\b.*\bdist\/migrate\.js$/;

const manifestScripts = z.object({
  scripts: z.record(z.string(), z.string()).optional(),
});

/** package.json's own "scripts" section, parsed as a boundary input (STK-08) rather than trusted as an untyped JSON.parse result. */
async function readManifestScripts(): Promise<Record<string, string>> {
  const text = await readFile(MANIFEST_PATH, 'utf8');
  const parsed: unknown = JSON.parse(text);
  return manifestScripts.parse(parsed).scripts ?? {};
}

it('the manifest declares a "migrate" script that node-runs the built migrate entry point from dist/, mirroring "start"\'s own precedent of never running a source file', async () => {
  const scripts = await readManifestScripts();

  expect(scripts.migrate).toMatch(NODE_RUNS_BUILT_MIGRATE_ENTRY);
});

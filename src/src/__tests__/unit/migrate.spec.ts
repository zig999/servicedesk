// Proof for task/relational-substrate/migration-step, criterion 1's own wiring: the tree holds a
// runnable step, reachable as "npm run migrate", invoking the built migrate.ts entry point exactly
// the way "start" already invokes index.ts's. What that script does once invoked — reading
// DATABASE_URL exclusively through loadEnv with no default, and applying every pending script in
// order through applyPendingMigrations — is proven directly against those two modules elsewhere in
// this tree; migrate.ts's own top-level composition is left untested here, following the same
// precedent index.ts's own top-level composition already sets (see this record's own `untested`).
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

it('the manifest declares a "migrate" script that runs the built migrate.js from dist/, mirroring "start"\'s own precedent', async () => {
  const scripts = await readManifestScripts();

  expect(scripts.migrate).toBe('node dist/migrate.js');
});

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { z } from 'zod';

const MANIFEST_PATH = fileURLToPath(new URL('../../../package.json', import.meta.url));

const NODE_RUNS_BUILT_MIGRATE_ENTRY = /^node\b.*\bdist\/migrate\.js$/;

const manifestScripts = z.object({
  scripts: z.record(z.string(), z.string()).optional(),
});

async function readManifestScripts(): Promise<Record<string, string>> {
  const text = await readFile(MANIFEST_PATH, 'utf8');
  const parsed: unknown = JSON.parse(text);
  return manifestScripts.parse(parsed).scripts ?? {};
}

it('the manifest declares a "migrate" script that node-runs the built migrate entry point from dist/, mirroring "start"\'s own precedent of never running a source file', async () => {
  const scripts = await readManifestScripts();

  expect(scripts.migrate).toMatch(NODE_RUNS_BUILT_MIGRATE_ENTRY);
});

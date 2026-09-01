import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const TARGET_SOURCE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git', 'dist']);

const PROVISIONING_FILENAME_PATTERNS: readonly RegExp[] = [
  /^dockerfile$/i,
  /^docker-compose(\..+)?\.ya?ml$/i,
  /\.tf$/i,
  /^procfile$/i,
];

async function findProvisioningArtifacts(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
      found.push(...(await findProvisioningArtifacts(join(root, entry.name))));
    } else if (PROVISIONING_FILENAME_PATTERNS.some((pattern) => pattern.test(entry.name))) {
      found.push(join(root, entry.name));
    }
  }
  return found;
}

it('the tree contains no Dockerfile, docker-compose file, Terraform script or Procfile provisioning a database service for the deployment', async () => {
  const artifacts = await findProvisioningArtifacts(TARGET_SOURCE_ROOT);

  expect(artifacts).toEqual([]);
});

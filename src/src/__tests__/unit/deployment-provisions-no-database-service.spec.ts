// Proof for task/relational-substrate/database-connection, criterion 3: "Nothing in the tree
// provisions a database service for the deployment." The database is provisioned outside the
// deployment and reached only through the connection URL configuration supplies
// (constraints/the-database-is-externally-provisioned); this audit is what a deployment artifact
// declaring one would be caught by.
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const TARGET_SOURCE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** Directories this audit never descends into: generated or version-control trees, never this project's own authored source. */
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git', 'dist']);

/** Filenames that provision a service for a deployment — a Dockerfile, a docker-compose file, a Terraform script or a Procfile. */
const PROVISIONING_FILENAME_PATTERNS: readonly RegExp[] = [
  /^dockerfile$/i,
  /^docker-compose(\..+)?\.ya?ml$/i,
  /\.tf$/i,
  /^procfile$/i,
];

/** Every path under root whose basename matches a provisioning pattern, walked recursively. */
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

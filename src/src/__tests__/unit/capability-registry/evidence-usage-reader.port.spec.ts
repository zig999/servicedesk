import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const MODULE_SOURCE_PATH = fileURLToPath(new URL('../../../capability-registry/evidence-usage-reader.port.ts', import.meta.url));

it(
  'declares IEvidenceUsageReader and its composite capability identity with no import statement at all, so the capability-registry module reaches no database driver through this file',
  async () => {
    const source = await readFile(MODULE_SOURCE_PATH, 'utf8');

    expect(/^\s*import\b/m.test(source)).toBe(false);
  },
);

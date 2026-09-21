import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const MODULE_SOURCE_PATH = fileURLToPath(new URL('../../../glossary/concept-usage-reader.port.ts', import.meta.url));

it(
  'declares IConceptUsageReader and its resolution types with no import statement at all, so the glossary module reaches no database driver, framework or provider client through this file',
  async () => {
    const source = await readFile(MODULE_SOURCE_PATH, 'utf8');

    expect(/^\s*import\b/m.test(source)).toBe(false);
  },
);

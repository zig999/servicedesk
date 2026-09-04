import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const IMPORT_LINE_PATTERN = /^\s*import\b/m;

async function portSource(): Promise<string> {
  const path = fileURLToPath(new URL('../../../case/hypothesis-revision-release.port.ts', import.meta.url));
  return readFile(path, 'utf8');
}

it('declares no import at all, so a caller depending on this port alone pulls in nothing else', async () => {
  const source = await portSource();

  expect(IMPORT_LINE_PATTERN.test(source)).toBe(false);
});

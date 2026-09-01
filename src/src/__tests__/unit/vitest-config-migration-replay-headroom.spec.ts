import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const VITEST_CONFIG_PATH = fileURLToPath(new URL('../../../vitest.config.ts', import.meta.url));

it('declares a testTimeout raised above the prior 40000ms value', async () => {
  const source = await readFile(VITEST_CONFIG_PATH, 'utf8');

  const match = source.match(/testTimeout:\s*(\d+)/);
  if (!match) {
    throw new Error('vitest.config.ts must declare a numeric testTimeout');
  }

  expect(Number(match[1])).toBeGreaterThan(40000);
});

it('explains why fileParallelism is disabled without naming any database provider ("Neon")', async () => {
  const source = await readFile(VITEST_CONFIG_PATH, 'utf8');

  const paragraphs = source.split(/\n\/\/ *\n/);
  const fileParallelismParagraph = paragraphs.find((paragraph) => paragraph.includes('fileParallelism is disabled'));
  if (fileParallelismParagraph === undefined) {
    throw new Error('vitest.config.ts must still explain why fileParallelism is disabled');
  }

  expect(fileParallelismParagraph).not.toMatch(/Neon/i);
  expect(fileParallelismParagraph).toMatch(/transaction-pooling endpoint/i);
});

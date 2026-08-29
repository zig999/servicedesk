// Proof for task/migration-runner-comment-hang-corrective/strip-leading-comments-before-applying,
// criteria 5 and 6: vitest.config.ts's own testTimeout is raised above its prior 40000ms value, and
// the comment explaining why fileParallelism is disabled no longer names a database provider
// ("Neon") this project does not use. Both are read from vitest.config.ts's own source text on disk,
// never from a value this file computes itself, so what makes either test fail is a real regression
// in that file — the number lowered back to (or below) 40000, or the vendor name reintroduced into
// that specific paragraph. The two later, historical testTimeout paragraphs that still name "Neon"
// (disclosed in this task's own implementation record as deliberately out of scope) are never
// inspected here — only the one paragraph this task's own criterion names.
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

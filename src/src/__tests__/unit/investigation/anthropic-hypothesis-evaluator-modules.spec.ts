import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const ADAPTER_FILE = fileURLToPath(new URL('../../../investigation/anthropic-hypothesis-evaluator.adapter.ts', import.meta.url));

const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

it('imports exactly one external package — @anthropic-ai/sdk — and no other HTTP client library', async () => {
  const source = await readFile(ADAPTER_FILE, 'utf8');
  const specifiers = importSpecifiersOf(source);

  const external = specifiers.filter((specifier) => !specifier.startsWith('.') && !specifier.startsWith('node:'));

  expect(external).toEqual(['@anthropic-ai/sdk']);
});

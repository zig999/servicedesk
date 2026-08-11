// An audit over the one file task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator
// delivered under src/investigation: anthropic-hypothesis-evaluator.adapter.ts imports exactly
// one external package for the call — @anthropic-ai/sdk, criterion 5's own text — and no other
// HTTP client library. Checked by reading the file's own import specifiers and asserting the
// whole set of external ones, rather than against a curated forbidden-package list the way the
// sibling hypothesis-evaluator-modules.spec.ts and assessment-consolidator-modules.spec.ts do:
// an arbitrary HTTP client this project never anticipated (axios, got, node-fetch) is caught the
// same way a listed one would be, since anything beyond the one permitted specifier fails this
// check regardless of its name. Whether this file is the only implementer of IHypothesisEvaluator
// is not this file's own claim — that shared-directory totality lives in
// hypothesis-evaluator-modules.spec.ts, which this task's own delivery updates to admit this file
// as the port's second, legitimate adapter.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const ADAPTER_FILE = fileURLToPath(new URL('../../../investigation/anthropic-hypothesis-evaluator.adapter.ts', import.meta.url));

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier one source text imports. */
function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

it('imports exactly one external package — @anthropic-ai/sdk — and no other HTTP client library', async () => {
  const source = await readFile(ADAPTER_FILE, 'utf8');
  const specifiers = importSpecifiersOf(source);

  const external = specifiers.filter((specifier) => !specifier.startsWith('.') && !specifier.startsWith('node:'));

  expect(external).toEqual(['@anthropic-ai/sdk']);
});

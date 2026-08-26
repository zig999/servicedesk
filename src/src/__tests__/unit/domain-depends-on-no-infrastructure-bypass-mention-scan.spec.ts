// Focused unit tests for task/domain-boundary-scan-fix/narrow-bypass-mention-scan's own new
// exemption logic — HTTP_CONNECTOR_MENTION and everyHttpConnectorMentionIsANodeIdentityCitation,
// declared inside domain-depends-on-no-infrastructure.spec.ts's ninth test itself, since that
// corrective task's own implementation lives inside a test file rather than a production module:
// there is nowhere else to import these bindings from.
//
// Neither binding is exported, and this task's own criteria forbid changing that file to add an
// export just so a separate spec could reach in. So this file extracts the exact source slice the
// two criteria bear on — byte for byte, from the sibling file, at test time — compiles it with the
// project's own TypeScript compiler and evaluates the result. Every assertion below therefore runs
// the real, deployed logic rather than a second, hand-written copy of it that could agree with a
// bug the real code carries. If a later change renames or reshapes that slice, extraction fails
// loudly (a thrown Error naming the missing anchor) rather than silently testing stale code.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

const SCAN_FILE_PATH = fileURLToPath(
  new URL('./domain-depends-on-no-infrastructure.spec.ts', import.meta.url),
);
const OBSERVATION_SOURCE_PORT_PATH = fileURLToPath(
  new URL('../../investigation/observation-source.port.ts', import.meta.url),
);
const EXTRACTION_START_MARKER = 'const HTTP_CONNECTOR_MENTION';
const EXTRACTION_FUNCTION_MARKER = 'function everyHttpConnectorMentionIsANodeIdentityCitation';

/** The one decision function this file's tests drive directly. */
interface IBypassMentionScanHelpers {
  readonly everyHttpConnectorMentionIsANodeIdentityCitation: (source: string) => boolean;
}

/** The index one past the closing brace that balances the opening brace at openBraceIndex. */
function matchingCloseBraceEnd(text: string, openBraceIndex: number): number {
  let depth = 0;
  for (let index = openBraceIndex; index < text.length; index++) {
    if (text[index] === '{') depth++;
    if (text[index] === '}') {
      depth--;
      if (depth === 0) return index + 1;
    }
  }
  throw new Error('unbalanced braces while extracting the bypass-mention scan logic');
}

/**
 * Slices the scan file's own text from HTTP_CONNECTOR_MENTION's declaration through the end of
 * everyHttpConnectorMentionIsANodeIdentityCitation's balanced closing brace — the exact span the
 * ninth test's exemption logic lives in, including SPECIFICATION_NODE_IDENTITY_PATTERN and
 * specificationNodeIdentityRanges, which that function calls.
 */
function extractBypassMentionScanSource(scanFileText: string): string {
  const startIndex = scanFileText.indexOf(EXTRACTION_START_MARKER);
  if (startIndex === -1) {
    throw new Error(`could not locate "${EXTRACTION_START_MARKER}" — the scan file's shape changed`);
  }
  const functionIndex = scanFileText.indexOf(EXTRACTION_FUNCTION_MARKER, startIndex);
  if (functionIndex === -1) {
    throw new Error(`could not locate "${EXTRACTION_FUNCTION_MARKER}" — the scan file's shape changed`);
  }
  const bodyOpen = scanFileText.indexOf('{', functionIndex);
  const bodyEnd = matchingCloseBraceEnd(scanFileText, bodyOpen);
  return scanFileText.slice(startIndex, bodyEnd);
}

/** Compiles the extracted TypeScript slice to plain JS and evaluates it in a fresh function scope. */
function loadBypassMentionScanHelpers(extractedSource: string): IBypassMentionScanHelpers {
  const { outputText } = ts.transpileModule(extractedSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const buildHelpers = new Function(
    `${outputText}\nreturn { everyHttpConnectorMentionIsANodeIdentityCitation };`,
  ) as unknown as () => IBypassMentionScanHelpers;
  return buildHelpers();
}

let helpersPromise: Promise<IBypassMentionScanHelpers> | undefined;

/** Extracts and compiles the bypass-mention scan's own exemption logic once, memoized for this file's tests. */
function scanHelpers(): Promise<IBypassMentionScanHelpers> {
  helpersPromise ??= readFile(SCAN_FILE_PATH, 'utf8').then((text) =>
    loadBypassMentionScanHelpers(extractBypassMentionScanSource(text)),
  );
  return helpersPromise;
}

it("exempts observation-source.port.ts's own real, unchanged citation of rules/integration/an-http-connector-configuration-declares-its-call", async () => {
  const helpers = await scanHelpers();
  const portFileSource = await readFile(OBSERVATION_SOURCE_PORT_PATH, 'utf8');
  expect(portFileSource).toContain('rules/integration/an-http-connector-configuration-declares-its-call');

  const exempt = helpers.everyHttpConnectorMentionIsANodeIdentityCitation(portFileSource);

  expect(exempt).toBe(true);
});

it('exempts a synthetic comment citing that same specification-node identity, standing alone', async () => {
  const helpers = await scanHelpers();
  const source = '// see rules/integration/an-http-connector-configuration-declares-its-call for the rule';

  const exempt = helpers.everyHttpConnectorMentionIsANodeIdentityCitation(source);

  expect(exempt).toBe(true);
});

it('exempts a citation using the single-segment constraints/<slug> grammar, when that slug itself contains "http-connector"', async () => {
  const helpers = await scanHelpers();
  const source = '// see constraints/the-http-connector-boundary for the rule';

  const exempt = helpers.everyHttpConnectorMentionIsANodeIdentityCitation(source);

  expect(exempt).toBe(true);
});

it('still reports a real reference to the http-connector module, such as a relative import specifier', async () => {
  const helpers = await scanHelpers();
  const source = "import { adapter } from './http-connector-adapter';";

  const exempt = helpers.everyHttpConnectorMentionIsANodeIdentityCitation(source);

  expect(exempt).toBe(false);
});

it('still reports a real reference sitting beside a legitimate citation in the same source, since the exemption is per-occurrence', async () => {
  const helpers = await scanHelpers();
  const source = [
    '// rules/integration/an-http-connector-configuration-declares-its-call',
    "const adapterKey = 'http-connector';",
  ].join('\n');

  const exempt = helpers.everyHttpConnectorMentionIsANodeIdentityCitation(source);

  expect(exempt).toBe(false);
});

it('still reports "http-connector" sitting beside a slug that does not satisfy the specification-node identity grammar', async () => {
  const helpers = await scanHelpers();
  const source = '// see domain/http-connector for background';

  const exempt = helpers.everyHttpConnectorMentionIsANodeIdentityCitation(source);

  expect(exempt).toBe(false);
});

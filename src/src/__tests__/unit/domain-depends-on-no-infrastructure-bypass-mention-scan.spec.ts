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

interface IBypassMentionScanHelpers {
  readonly everyHttpConnectorMentionIsANodeIdentityCitation: (source: string) => boolean;
}

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

// Proof for
// task/assessment-consolidation-adapter/anthropic-assessment-consolidator:
// AnthropicAssessmentConsolidator's own consolidate() call, exercised
// against a stand-in for the @anthropic-ai/sdk client (TST-03 — a stand-in
// replaces the network boundary, never business logic) so this suite never
// reaches the live Anthropic API. Proves the provider request grants no
// tools, that assembling it is a pure function of consolidate()'s own three
// arguments, that the data block carries exactly those three inputs
// delimited from the system prompt, that consolidate() answers the model's
// own text alone, trimmed, and the adapter's own import boundary —
// including the credential-from-environment fallback and the domain files
// this task's own criteria name as staying free of any provider client
// (constraints/the-domain-depends-on-no-infrastructure).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, expect, it, vi } from 'vitest';

const { create, anthropicClientMock } = vi.hoisted(() => {
  const create = vi.fn();
  const anthropicClientMock = vi.fn().mockImplementation(() => ({ messages: { create } }));
  return { create, anthropicClientMock };
});

vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicClientMock }));

import type { AnthropicConsolidatorConfig } from '../../../investigation/anthropic-assessment-consolidator.adapter.js';
import { AnthropicAssessmentConsolidator } from '../../../investigation/anthropic-assessment-consolidator.adapter.js';
import type { ConsolidationRegister } from '../../../investigation/consolidation-register.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';

const INVESTIGATION_DIRECTORY = fileURLToPath(new URL('../../../investigation/', import.meta.url));
const ADAPTER_PATH = join(INVESTIGATION_DIRECTORY, 'anthropic-assessment-consolidator.adapter.ts');

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier — the same pattern this suite's sibling audits already use. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier one source text imports. */
function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

/** HTTP client libraries besides the SDK itself — what criterion 5 forbids this adapter to import for the call. */
const OTHER_HTTP_CLIENTS = ['axios', 'node-fetch', 'undici', 'got', 'superagent', 'cross-fetch', 'request', 'http', 'https', 'node:http', 'node:https'];

/** Domain files this task's own criteria concern, none of which may reach a provider client — the port, the register, and the two value objects consolidate() itself receives. */
const DOMAIN_FILES_FEEDING_CONSOLIDATE = ['assessment-consolidator.port.ts', 'consolidation-register.ts', 'evaluation.ts', 'evidence.ts'];

/** A decided evaluation carrying citations — one of consolidate()'s own three arguments. */
const A_CONFIRMED_EVALUATION: Evaluation = {
  hypothesis: 'hypothesis-one',
  verdict: 'confirmed',
  citations: [{ concept: 'a-concept', field: 'a-field' }],
};

/** An undecided evaluation, carrying a reason and no citations — the shape a decided one does not have. */
const AN_INCONCLUSIVE_EVALUATION: Evaluation = {
  hypothesis: 'hypothesis-two',
  verdict: 'inconclusive',
  reason: 'no-data',
  citations: [],
};

const SOME_EVALUATIONS: readonly Evaluation[] = [A_CONFIRMED_EVALUATION, AN_INCONCLUSIVE_EVALUATION];

const SOME_EVIDENCE: readonly Evidence[] = [
  {
    concept: 'a-concept',
    inputs: 'a-serialized-call',
    observation: 'an-observed-value',
    observed_at: '2026-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: 'a-capability',
    capability_version: '1',
  },
];

const A_REGISTER: ConsolidationRegister = 'formal';

const A_CONFIG: AnthropicConsolidatorConfig = { model: 'a-test-model', maxTokens: 512, apiKey: 'a-config-supplied-key' };

/** A successful response carrying exactly one text content block, the shape consolidate() reads its answer from. */
function textResponse(text: string) {
  return { content: [{ type: 'text', text }] };
}

beforeEach(() => {
  create.mockReset();
  anthropicClientMock.mockClear();
});

// ------------------------------------------------------------- criterion 2: no tools granted

it('asks the model with no tools field in the request', async () => {
  create.mockResolvedValueOnce(textResponse('the write-up'));
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);

  await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);

  const [request] = create.mock.calls[0] as [Record<string, unknown>];
  expect(request).not.toHaveProperty('tools');
});

// ------------------------------------------------------------- criterion 3: one delimited data block, exactly the three inputs

it('wraps exactly the given evaluations, evidence and register in one <CONSOLIDATION_DATA> block', async () => {
  create.mockResolvedValueOnce(textResponse('the write-up'));
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);

  await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);

  const [request] = create.mock.calls[0] as [{ messages: readonly { content: string }[] }];
  const expectedBlock = `<CONSOLIDATION_DATA>\n${JSON.stringify({
    evaluations: SOME_EVALUATIONS,
    evidence: SOME_EVIDENCE,
    consolidation_register: A_REGISTER,
  })}\n</CONSOLIDATION_DATA>`;
  expect(request.messages[0]?.content).toBe(expectedBlock);
});

it('produces a well-formed, empty data block when given no evaluations and no evidence', async () => {
  create.mockResolvedValueOnce(textResponse('nothing was required'));
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);

  await consolidator.consolidate([], [], 'plain');

  const [request] = create.mock.calls[0] as [{ messages: readonly { content: string }[] }];
  const parsed: unknown = JSON.parse(
    (request.messages[0]?.content ?? '').replace('<CONSOLIDATION_DATA>\n', '').replace('\n</CONSOLIDATION_DATA>', ''),
  );
  expect(parsed).toEqual({ evaluations: [], evidence: [], consolidation_register: 'plain' });
});

// ------------------------------------------------------------- criterion 1: purity across calls

it('produces byte-identical prompt content across two calls given the same evaluations, evidence and register, even passed as freshly-constructed copies', async () => {
  create.mockResolvedValue(textResponse('the write-up'));
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);
  const evaluationsCopy: readonly Evaluation[] = JSON.parse(JSON.stringify(SOME_EVALUATIONS));
  const evidenceCopy: readonly Evidence[] = JSON.parse(JSON.stringify(SOME_EVIDENCE));

  await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);
  await consolidator.consolidate(evaluationsCopy, evidenceCopy, A_REGISTER);

  const [firstRequest] = create.mock.calls[0] as [{ system: string; messages: readonly { content: string }[] }];
  const [secondRequest] = create.mock.calls[1] as [{ system: string; messages: readonly { content: string }[] }];
  expect(secondRequest.system).toBe(firstRequest.system);
  expect(secondRequest.messages[0]?.content).toBe(firstRequest.messages[0]?.content);
});

it('varies the system prompt with the consolidation register, given the same evaluations and evidence', async () => {
  create.mockResolvedValue(textResponse('the write-up'));
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);

  await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, 'formal');
  await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, 'plain');

  const [formalRequest] = create.mock.calls[0] as [{ system: string }];
  const [plainRequest] = create.mock.calls[1] as [{ system: string }];
  expect(plainRequest.system).not.toBe(formalRequest.system);
});

// ------------------------------------------------------------- criterion 4: text alone, trimmed

it("returns exactly the model's own text content, trimmed of surrounding whitespace", async () => {
  create.mockResolvedValueOnce(textResponse('  The consolidated assessment.\n'));
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);

  const text = await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);

  expect(text).toBe('The consolidated assessment.');
});

it('rejects with an error rather than answering an empty string when the response carries no text content block', async () => {
  create.mockResolvedValueOnce({ content: [] });
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);

  await expect(consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER)).rejects.toThrow();
});

it('propagates a provider failure rather than swallowing it', async () => {
  create.mockRejectedValueOnce(new Error('the provider is unavailable'));
  const consolidator = new AnthropicAssessmentConsolidator(A_CONFIG);

  await expect(consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER)).rejects.toThrow('the provider is unavailable');
});

// ------------------------------------------------------------- the API-key inference (STK-11)

it('constructs the Anthropic client with the config-supplied API key when one is given', () => {
  void new AnthropicAssessmentConsolidator({ model: 'a-test-model', maxTokens: 512, apiKey: 'a-given-key' });

  expect(anthropicClientMock).toHaveBeenCalledWith({ apiKey: 'a-given-key' });
});

it('falls back to ANTHROPIC_API_KEY from the environment when the config supplies no apiKey', () => {
  const original = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'an-environment-key';
  try {
    void new AnthropicAssessmentConsolidator({ model: 'a-test-model', maxTokens: 512 });

    expect(anthropicClientMock).toHaveBeenCalledWith({ apiKey: 'an-environment-key' });
  } finally {
    if (original === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = original;
    }
  }
});

// ------------------------------------------------------------- criterion 5 and the import boundary (task Notes)

it('imports no other HTTP client library beside @anthropic-ai/sdk', async () => {
  const source = await readFile(ADAPTER_PATH, 'utf8');
  const specifiers = importSpecifiersOf(source);

  expect(specifiers.filter((specifier) => OTHER_HTTP_CLIENTS.includes(specifier))).toEqual([]);
});

it('assessment-consolidator.port.ts, consolidation-register.ts, evaluation.ts and evidence.ts import no LLM or provider client, so the live call sits outside them', async () => {
  const offenders: string[] = [];
  for (const file of DOMAIN_FILES_FEEDING_CONSOLIDATE) {
    const source = await readFile(join(INVESTIGATION_DIRECTORY, file), 'utf8');
    if (importSpecifiersOf(source).includes('@anthropic-ai/sdk')) {
      offenders.push(file);
    }
  }

  expect(offenders).toEqual([]);
});

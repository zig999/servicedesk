// Proof for task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator:
// AnthropicHypothesisEvaluator never reaches the network. @anthropic-ai/sdk
// is a boundary (TST-03), stood in for by a mocked constructor and a mocked
// messages.create — what crosses that boundary (the request sent, and
// whether it was sent at all) is the only externally observable trace of
// this adapter's own prompt-assembly, no-data short-circuit and
// response-parsing behavior, since none of those are exported from the
// module under test.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AnthropicHypothesisEvaluator } from '../../../investigation/anthropic-hypothesis-evaluator.adapter.js';
import type { CaseContext, EvidenceItem } from '../../../investigation/hypothesis-evaluator.port.js';

/** What one mocked messages.create() call receives — only the fields this suite reads. */
type MockedCreateParams = {
  readonly model: string;
  readonly max_tokens: number;
  readonly system: string;
  readonly messages: readonly { readonly role: string; readonly content: string }[];
  readonly tools?: unknown;
};

/** What one mocked messages.create() call answers — only the shape textOf() reads. */
type MockedMessage = { readonly content: readonly { readonly type: string; readonly text: string }[] };

const { createMock, anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn<(params: MockedCreateParams) => Promise<MockedMessage>>();
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { createMock, anthropicConstructorMock };
});

vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

/** One well-formed model answer carrying exactly this text, in the one shape textOf()/parseJudgment() ever read. */
function messageWithText(text: string): MockedMessage {
  return { content: [{ type: 'text', text }] };
}

/** The subject under test, with an explicit apiKey so no test depends on the host's own environment unless it says so. */
function createEvaluator(options?: { readonly maxTokens?: number; readonly model?: string }): AnthropicHypothesisEvaluator {
  return new AnthropicHypothesisEvaluator({ apiKey: 'a-test-api-key', model: options?.model ?? 'a-test-model', maxTokens: options?.maxTokens });
}

const A_CRITERION = 'a-criterion';
const SOME_OK_EVIDENCE: readonly EvidenceItem[] = [
  { concept: 'concept-one', result: 'ok', observation: 'an-observed-value', declaredFields: ['field-one'] },
];
const A_CASE_CONTEXT: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };

const ORIGINAL_ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

beforeEach(() => {
  createMock.mockReset();
  anthropicConstructorMock.mockClear();
});

afterEach(() => {
  if (ORIGINAL_ANTHROPIC_API_KEY === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = ORIGINAL_ANTHROPIC_API_KEY;
  }
});

it('answers inconclusive with reason no-data, citing exactly the evidence items whose result is not ok', async () => {
  const mixedEvidence: readonly EvidenceItem[] = [
    { concept: 'concept-ok', result: 'ok', observation: 'an-observed-value', declaredFields: ['a-field'] },
    { concept: 'concept-timeout', result: 'timeout', declaredFields: [] },
    { concept: 'concept-denied', result: 'denied', declaredFields: [] },
  ];
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, mixedEvidence, A_CASE_CONTEXT);

  expect(outcome).toEqual({
    verdict: 'inconclusive',
    reason: 'no-data',
    citations: [
      { concept: 'concept-timeout', field: '' },
      { concept: 'concept-denied', field: '' },
    ],
  });
});

it('never calls the provider when the evidence carries any non-ok result', async () => {
  const mixedEvidence: readonly EvidenceItem[] = [
    { concept: 'concept-ok', result: 'ok', observation: 'an-observed-value', declaredFields: ['a-field'] },
    { concept: 'concept-timeout', result: 'timeout', declaredFields: [] },
  ];
  const evaluator = createEvaluator();

  await evaluator.evaluate(A_CRITERION, mixedEvidence, A_CASE_CONTEXT);

  expect(createMock).not.toHaveBeenCalled();
});

it('sends byte-identical prompt content across two calls carrying the same criterion, evidence and case context', async () => {
  createMock.mockResolvedValue(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidenceForFirstCall: readonly EvidenceItem[] = [
    { concept: 'concept-one', result: 'ok', observation: 'an-observed-value', declaredFields: ['field-one'] },
  ];
  const evidenceForSecondCall: readonly EvidenceItem[] = [
    { concept: 'concept-one', result: 'ok', observation: 'an-observed-value', declaredFields: ['field-one'] },
  ];
  const caseContextForFirstCall: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };
  const caseContextForSecondCall: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };

  await evaluator.evaluate(A_CRITERION, evidenceForFirstCall, caseContextForFirstCall);
  await evaluator.evaluate(A_CRITERION, evidenceForSecondCall, caseContextForSecondCall);

  const firstContent = createMock.mock.calls[0]?.[0]?.messages[0]?.content;
  const secondContent = createMock.mock.calls[1]?.[0]?.messages[0]?.content;
  expect(firstContent).toBe(secondContent);
});

it('carries the given criterion, evidence observation, declared fields, case title and case when_to_use inside one delimited block', async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    { concept: 'the-marker-concept', result: 'ok', observation: 'the-marker-observation', declaredFields: ['the-marker-field'] },
  ];
  const caseContext: CaseContext = { title: 'the-marker-title', whenToUse: 'the-marker-when-to-use' };

  await evaluator.evaluate('the-marker-criterion', evidence, caseContext);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  expect(content).toContain('<judgment_input>');
  expect(content).toContain('the-marker-criterion');
  expect(content).toContain('the-marker-observation');
  expect(content).toContain('the-marker-field');
  expect(content).toContain('the-marker-title');
  expect(content).toContain('the-marker-when-to-use');
});

it("renders each evidence item's own declared fields as its own item's fields attribute, never the schema itself and never another item's fields", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    { concept: 'concept-one', result: 'ok', observation: 'observation-one', declaredFields: ['field-one', 'field-two'] },
    { concept: 'concept-two', result: 'ok', observation: 'observation-two', declaredFields: [] },
  ];

  await evaluator.evaluate(A_CRITERION, evidence, A_CASE_CONTEXT);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  expect(content).toContain('<item concept="concept-one" fields="field-one field-two">');
  expect(content).toContain('<item concept="concept-two" fields="">');
  expect(content).not.toContain('properties');
  expect(content).not.toContain('type');
});

it('escapes reserved XML characters in the criterion so the closed data block cannot be broken out of', async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const criterion = 'a-criterion-with-a-<tag>-and-an-&-symbol';

  await evaluator.evaluate(criterion, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  expect(content).toContain('a-criterion-with-a-&lt;tag&gt;-and-an-&amp;-symbol');
  expect(content).not.toContain('<tag>');
});

it('declares no tools field on the provider request', async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();

  await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  const params = createMock.mock.calls[0]?.[0];
  expect(Object.hasOwn(params ?? {}, 'tools')).toBe(false);
});

it('parses a well-formed confirmed answer into the confirmed verdict with its citations', async () => {
  const citation = { concept: 'concept-one', field: 'field-one' };
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'confirmed', citations: [citation] })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'confirmed', citations: [citation] });
});

it('parses a well-formed refuted answer into the refuted verdict with its citations', async () => {
  const citation = { concept: 'concept-two', field: 'field-two' };
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'refuted', citations: [citation] })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'refuted', citations: [citation] });
});

it('parses a confirmed answer wrapped in a ```json code fence, despite the system prompt asking for none', async () => {
  const citation = { concept: 'equipment-status', field: 'status' };
  createMock.mockResolvedValueOnce(
    messageWithText('```json\n' + JSON.stringify({ verdict: 'confirmed', citations: [citation] }) + '\n```'),
  );
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'confirmed', citations: [citation] });
});

it('parses a refuted answer wrapped in an untagged ``` code fence', async () => {
  const citation = { concept: 'concept-two', field: 'field-two' };
  createMock.mockResolvedValueOnce(
    messageWithText('```\n' + JSON.stringify({ verdict: 'refuted', citations: [citation] }) + '\n```'),
  );
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'refuted', citations: [citation] });
});

it("maps the model's own well-formed inconclusive answer to reason judgment-failure", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
});

it('answers inconclusive with reason judgment-failure when the model response is not valid JSON', async () => {
  createMock.mockResolvedValueOnce(messageWithText('this is not json at all'));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
});

it('answers inconclusive with reason judgment-failure when the model response is valid JSON but matches none of the three declared shapes', async () => {
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'maybe' })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
});

it('answers inconclusive with reason judgment-failure when a confirmed answer carries no citations', async () => {
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'confirmed', citations: [] })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
});

it('answers inconclusive with reason judgment-failure, never throwing, when the provider call itself rejects', async () => {
  createMock.mockRejectedValueOnce(new Error('the provider is unavailable'));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
});

it('reads the credential from ANTHROPIC_API_KEY when the constructor is given no apiKey', async () => {
  process.env.ANTHROPIC_API_KEY = 'an-env-api-key';
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = new AnthropicHypothesisEvaluator({ model: 'a-test-model' });

  await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(anthropicConstructorMock).toHaveBeenCalledWith({ apiKey: 'an-env-api-key' });
});

it('defaults the token ceiling to 1024 when the caller configures none', async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();

  await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(createMock.mock.calls[0]?.[0]).toMatchObject({ max_tokens: 1024 });
});

it("sends the caller's own configured token ceiling instead of the default", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator({ maxTokens: 42 });

  await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(createMock.mock.calls[0]?.[0]).toMatchObject({ max_tokens: 42 });
});

it('sends exactly the model the caller configured, not a hardcoded default', async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator({ model: 'a-configured-model' });

  await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(createMock.mock.calls[0]?.[0]).toMatchObject({ model: 'a-configured-model' });
});

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

/**
 * What one mocked messages.create() call answers — the content shape
 * textOf()/parseJudgment() read, plus the optional usage field this suite's
 * own criteria-1/2/3 tests give a mocked response so evaluate() has
 * message.usage to read from
 * (task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing).
 */
type MockedMessage = {
  readonly content: readonly { readonly type: string; readonly text: string }[];
  readonly usage?: { readonly input_tokens: number; readonly output_tokens: number };
};

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
/** A representative ok evidence item, carrying a non-empty fields array (one field with its own type and description) and a non-empty concept_description — used across tests that are not themselves about prompt shape, so its exact content is otherwise arbitrary. */
const SOME_OK_EVIDENCE: readonly EvidenceItem[] = [
  {
    concept: 'concept-one',
    result: 'ok',
    observation: 'an-observed-value',
    fields: [{ name: 'field-one', type: 'string', description: 'field-one description' }],
    concept_description: 'what concept-one means',
  },
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
    { concept: 'concept-ok', result: 'ok', observation: 'an-observed-value', fields: [{ name: 'a-field' }], concept_description: '' },
    { concept: 'concept-timeout', result: 'timeout', fields: [], concept_description: '' },
    { concept: 'concept-denied', result: 'denied', fields: [], concept_description: '' },
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
    { concept: 'concept-ok', result: 'ok', observation: 'an-observed-value', fields: [{ name: 'a-field' }], concept_description: '' },
    { concept: 'concept-timeout', result: 'timeout', fields: [], concept_description: '' },
  ];
  const evaluator = createEvaluator();

  await evaluator.evaluate(A_CRITERION, mixedEvidence, A_CASE_CONTEXT);

  expect(createMock).not.toHaveBeenCalled();
});

it('sends byte-identical prompt content across two calls carrying the same criterion, evidence (including its own field semantics and concept description) and case context', async () => {
  createMock.mockResolvedValue(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidenceForFirstCall: readonly EvidenceItem[] = [
    {
      concept: 'concept-one',
      result: 'ok',
      observation: 'an-observed-value',
      fields: [{ name: 'field-one', type: 'string', description: 'field-one description' }],
      concept_description: 'what concept-one means',
    },
  ];
  const evidenceForSecondCall: readonly EvidenceItem[] = [
    {
      concept: 'concept-one',
      result: 'ok',
      observation: 'an-observed-value',
      fields: [{ name: 'field-one', type: 'string', description: 'field-one description' }],
      concept_description: 'what concept-one means',
    },
  ];
  const caseContextForFirstCall: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };
  const caseContextForSecondCall: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };

  await evaluator.evaluate(A_CRITERION, evidenceForFirstCall, caseContextForFirstCall);
  await evaluator.evaluate(A_CRITERION, evidenceForSecondCall, caseContextForSecondCall);

  const firstContent = createMock.mock.calls[0]?.[0]?.messages[0]?.content;
  const secondContent = createMock.mock.calls[1]?.[0]?.messages[0]?.content;
  expect(firstContent).toBe(secondContent);
});

it('carries the given criterion, evidence observation, its own concept description, its own field semantics, case title and case when_to_use inside one delimited block', async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    {
      concept: 'the-marker-concept',
      result: 'ok',
      observation: 'the-marker-observation',
      fields: [{ name: 'the-marker-field', type: 'the-marker-type', description: 'the-marker-field-description' }],
      concept_description: 'the-marker-concept-description',
    },
  ];
  const caseContext: CaseContext = { title: 'the-marker-title', whenToUse: 'the-marker-when-to-use' };

  await evaluator.evaluate('the-marker-criterion', evidence, caseContext);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  expect(content).toContain('<judgment_input>');
  expect(content).toContain('the-marker-criterion');
  expect(content).toContain('the-marker-observation');
  expect(content).toContain('the-marker-field');
  expect(content).toContain('the-marker-type');
  expect(content).toContain('the-marker-field-description');
  expect(content).toContain('the-marker-concept-description');
  expect(content).toContain('the-marker-title');
  expect(content).toContain('the-marker-when-to-use');
});

/** Extracts one item's own rendered block — from its own opening `<item concept="...">` tag up to the following `</item>` — so a test can assert what is, and is not, inside that one item's own block without a false positive from another item's content elsewhere in the same prompt. */
function itemBlockOf(content: string, concept: string): string {
  const openTag = `<item concept="${concept}">`;
  const start = content.indexOf(openTag);
  if (start === -1) {
    throw new Error(`no <item> found for concept "${concept}" in: ${content}`);
  }
  const end = content.indexOf('</item>', start);
  return content.slice(start, end + '</item>'.length);
}

it("renders each evidence item's own field semantics as its own <field> elements inside its own <fields>, each carrying its own name plus its own type attribute and description text exactly where the snapshot declared them, and never invented where it declared neither", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    {
      concept: 'concept-one',
      result: 'ok',
      observation: 'observation-one',
      fields: [
        { name: 'field-one', type: 'string', description: 'field-one description' },
        { name: 'field-two' },
      ],
      concept_description: 'what concept-one means',
    },
    { concept: 'concept-two', result: 'ok', observation: 'observation-two', fields: [], concept_description: '' },
  ];

  await evaluator.evaluate(A_CRITERION, evidence, A_CASE_CONTEXT);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  const itemOne = itemBlockOf(content, 'concept-one');
  const itemTwo = itemBlockOf(content, 'concept-two');
  expect(itemOne).toContain('<field name="field-one" type="string">field-one description</field>');
  expect(itemOne).toContain('<field name="field-two"></field>');
  expect(itemTwo.includes('field-one')).toBe(false);
  expect(itemTwo).not.toContain('<field ');
  expect(content).not.toContain('properties');
});

it("renders a field's own type attribute independently of its own description text — present for one without the other in either direction, and never coupling the two together", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    {
      concept: 'concept-one',
      result: 'ok',
      observation: 'an-observation',
      fields: [
        { name: 'field-type-only', type: 'string' },
        { name: 'field-description-only', description: 'a description with no type' },
      ],
      concept_description: '',
    },
  ];

  await evaluator.evaluate(A_CRITERION, evidence, A_CASE_CONTEXT);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  expect(content).toContain('<field name="field-type-only" type="string"></field>');
  expect(content).toContain('<field name="field-description-only">a description with no type</field>');
});

it("renders each evidence item's own concept description as its own <concept_description>, and the closed <evidence> block carries it alongside the item's own fields and observation", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    {
      concept: 'concept-with-a-description',
      result: 'ok',
      observation: 'an-observation',
      fields: [{ name: 'a-field' }],
      concept_description: 'what concept-with-a-description means',
    },
  ];

  await evaluator.evaluate(A_CRITERION, evidence, A_CASE_CONTEXT);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  const evidenceOpen = content.indexOf('<evidence>');
  const evidenceClose = content.indexOf('</evidence>');
  const conceptDescriptionIdx = content.indexOf('<concept_description>what concept-with-a-description means</concept_description>');
  expect(evidenceOpen).toBeGreaterThan(-1);
  expect(conceptDescriptionIdx).toBeGreaterThan(evidenceOpen);
  expect(conceptDescriptionIdx).toBeLessThan(evidenceClose);
});

it('omits the <concept_description> tag entirely for an item whose concept_description is the empty string, naming that item by its concept alone with no stated meaning, while still carrying its own fields and observation', async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    {
      concept: 'a-legacy-concept',
      result: 'ok',
      observation: 'an-observation',
      fields: [{ name: 'a-field' }],
      concept_description: '',
    },
  ];

  await evaluator.evaluate(A_CRITERION, evidence, A_CASE_CONTEXT);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  const itemBlock = itemBlockOf(content, 'a-legacy-concept');
  expect(itemBlock).not.toContain('concept_description');
  expect(itemBlock).toContain('<field name="a-field"></field>');
  expect(itemBlock).toContain('<observation>an-observation</observation>');
});

it("escapes reserved XML characters in an item's own concept_description and field name/type/description, so none of them can break out of the closed data block", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();
  const evidence: readonly EvidenceItem[] = [
    {
      concept: 'concept-one',
      result: 'ok',
      observation: 'an-observation',
      fields: [{ name: 'a-<field>-&-name', type: 'a-<type>', description: 'a-<description>-&-text' }],
      concept_description: 'a-<concept-description>-&-text',
    },
  ];

  await evaluator.evaluate(A_CRITERION, evidence, A_CASE_CONTEXT);

  const content = createMock.mock.calls[0]?.[0]?.messages[0]?.content ?? '';
  expect(content).toContain('a-&lt;concept-description&gt;-&amp;-text');
  expect(content).toContain('a-&lt;field&gt;-&amp;-name');
  expect(content).toContain('a-&lt;type&gt;');
  expect(content).toContain('a-&lt;description&gt;-&amp;-text');
  expect(content).not.toContain('<concept-description>');
  expect(content).not.toContain('<field>');
  expect(content).not.toContain('<type>');
  expect(content).not.toContain('<description>');
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

  expect(outcome).toMatchObject({ verdict: 'confirmed', citations: [citation] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('parses a well-formed refuted answer into the refuted verdict with its citations', async () => {
  const citation = { concept: 'concept-two', field: 'field-two' };
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'refuted', citations: [citation] })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'refuted', citations: [citation] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('parses a confirmed answer wrapped in a ```json code fence, despite the system prompt asking for none', async () => {
  const citation = { concept: 'equipment-status', field: 'status' };
  createMock.mockResolvedValueOnce(
    messageWithText('```json\n' + JSON.stringify({ verdict: 'confirmed', citations: [citation] }) + '\n```'),
  );
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'confirmed', citations: [citation] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('parses a refuted answer wrapped in an untagged ``` code fence', async () => {
  const citation = { concept: 'concept-two', field: 'field-two' };
  createMock.mockResolvedValueOnce(
    messageWithText('```\n' + JSON.stringify({ verdict: 'refuted', citations: [citation] }) + '\n```'),
  );
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'refuted', citations: [citation] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it("maps the model's own well-formed inconclusive answer to reason judgment-failure", async () => {
  createMock.mockResolvedValueOnce(messageWithText('{"verdict":"inconclusive"}'));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('answers inconclusive with reason judgment-failure when the model response is not valid JSON', async () => {
  createMock.mockResolvedValueOnce(messageWithText('this is not json at all'));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('answers inconclusive with reason judgment-failure when the model response is valid JSON but matches none of the three declared shapes', async () => {
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'maybe' })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('answers inconclusive with reason judgment-failure when the model answers valid JSON that is a top-level array rather than an object', async () => {
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify([1, 2, 3])));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('answers inconclusive with reason judgment-failure when a confirmed answer carries a citation entry that is not an object', async () => {
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'confirmed', citations: ['not-an-object'] })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('answers inconclusive with reason judgment-failure when a confirmed answer carries no citations', async () => {
  createMock.mockResolvedValueOnce(messageWithText(JSON.stringify({ verdict: 'confirmed', citations: [] })));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it('answers inconclusive with reason judgment-failure, never throwing, when the provider call itself rejects', async () => {
  createMock.mockRejectedValueOnce(new Error('the provider is unavailable'));
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  expect(outcome.usage).toBeUndefined();
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
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

// ---------- task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing:
// ---------- criteria 1-3, replacing this suite's own now-obsolete placeholder-behavior tests
// ---------- above (task/investigation-telemetry/widen-judgment-and-consolidation-ports' own
// ---------- criterion 5, which this task deliberately replaced)

it("answers a decided verdict carrying usage read exactly from the provider response's own message.usage, alongside the measured elapsed_ms and the sent prompt", async () => {
  const citation = { concept: 'concept-one', field: 'field-one' };
  const responseCarryingProviderUsage = {
    content: [{ type: 'text', text: JSON.stringify({ verdict: 'confirmed', citations: [citation] }) }],
    usage: { input_tokens: 77, output_tokens: 88 },
  };
  createMock.mockResolvedValueOnce(responseCarryingProviderUsage);
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'confirmed', citations: [citation], usage: { input_tokens: 77, output_tokens: 88 } });
  expect(outcome.elapsed_ms).toEqual(expect.any(Number));
  expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);
});

it("reads a different usage value per call, exactly matching that call's own mocked response, rather than any fixed placeholder value", async () => {
  const firstCitation = { concept: 'concept-one', field: 'field-one' };
  const secondCitation = { concept: 'concept-two', field: 'field-two' };
  createMock.mockResolvedValueOnce({
    content: [{ type: 'text', text: JSON.stringify({ verdict: 'confirmed', citations: [firstCitation] }) }],
    usage: { input_tokens: 10, output_tokens: 4 },
  });
  createMock.mockResolvedValueOnce({
    content: [{ type: 'text', text: JSON.stringify({ verdict: 'confirmed', citations: [secondCitation] }) }],
    usage: { input_tokens: 99, output_tokens: 32 },
  });
  const evaluator = createEvaluator();

  const first = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);
  const second = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(first.usage).toEqual({ input_tokens: 10, output_tokens: 4 });
  expect(second.usage).toEqual({ input_tokens: 99, output_tokens: 32 });
});

it("still carries usage read from the response's own message.usage when the model answered but the text could not be parsed into a recognized shape", async () => {
  createMock.mockResolvedValueOnce({
    content: [{ type: 'text', text: 'this is not json at all' }],
    usage: { input_tokens: 10, output_tokens: 5 },
  });
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure', usage: { input_tokens: 10, output_tokens: 5 } });
});

it('measures elapsed_ms as the real wall-clock time the provider call itself took, rather than a fixed value', async () => {
  createMock.mockImplementationOnce(
    () => new Promise((resolve) => setTimeout(() => resolve(messageWithText('{"verdict":"inconclusive"}')), 20)),
  );
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(20);
});

it("reports elapsed_ms and the exact prompt sent, but never invents a usage field, when the provider call itself throws before any response arrives", async () => {
  createMock.mockImplementationOnce(
    () => new Promise<MockedMessage>((_resolve, reject) => setTimeout(() => reject(new Error('the provider is unavailable')), 15)),
  );
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_OK_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toMatchObject({ verdict: 'inconclusive', reason: 'judgment-failure' });
  expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(15);
  expect(outcome.prompt).toContain('<judgment_input>');
  expect(outcome).not.toHaveProperty('usage');
});

it('a no-data outcome, answered without ever reaching the provider, still carries none of usage, elapsed_ms or prompt', async () => {
  const mixedEvidence: readonly EvidenceItem[] = [
    { concept: 'concept-ok', result: 'ok', observation: 'an-observed-value', fields: [{ name: 'a-field' }], concept_description: '' },
    { concept: 'concept-timeout', result: 'timeout', fields: [], concept_description: '' },
  ];
  const evaluator = createEvaluator();

  const outcome = await evaluator.evaluate(A_CRITERION, mixedEvidence, A_CASE_CONTEXT);

  expect(outcome).not.toHaveProperty('usage');
  expect(outcome).not.toHaveProperty('elapsed_ms');
  expect(outcome).not.toHaveProperty('prompt');
});

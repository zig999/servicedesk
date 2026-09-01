import Anthropic from '@anthropic-ai/sdk';
import type { Citation } from './citation.js';
import { isPlainObject } from './citation-validation.js';
import type { FieldSemantics } from './field-semantics.js';
import type {
  CaseContext,
  EvaluationOutcome,
  EvidenceItem,
  IHypothesisEvaluator,
} from './hypothesis-evaluator.port.js';
import type { Usage } from './usage.js';
import { VERDICTS, type Verdict } from './verdict.js';

const SYSTEM_PROMPT = `You judge whether the criterion of one troubleshooting hypothesis is confirmed or refuted, using only the evidence given to you.

Ground every verdict in the <judgment_input> block of the user message. The absence of evidence that would ground a verdict is itself a reason to answer inconclusively — never an invitation to infer, assume, or draw on anything beyond the <criterion>, <evidence>, <case_title> and <case_when_to_use> the block carries. Do not consult outside knowledge, and never let the case's title or when-to-use substitute for evidence. Each <item> inside <evidence> names its own concept, carries a <concept_description> naming what that concept means wherever one is known (absent where none is — the item is then known by its concept alone, with no stated meaning), lists its own <field> elements inside <fields> — each naming itself and, wherever known, its own type and a description of what it means — and carries its own <observation>.

Answer with exactly one JSON object and nothing else — no prose before or after it, no markdown code fence — matching exactly one of these three shapes:

{"verdict":"confirmed","citations":[{"concept":"<a concept named in <evidence>>","field":"<the name of one of that item's own <field> elements>"}]}
{"verdict":"refuted","citations":[{"concept":"<a concept named in <evidence>>","field":"<the name of one of that item's own <field> elements>"}]}
{"verdict":"inconclusive"}

A citation's field must be copied exactly from the name one of its own item's <field> elements declares — never invented, never the observation's own text, and never a field named on another item. Use "confirmed" or "refuted" only where the evidence's own content grounds that verdict, with at least one citation naming the evidence that grounds it. Use "inconclusive" whenever the evidence does not ground either, or whenever the item that would ground it declares no fields at all.`;

const DEFAULT_MAX_TOKENS = 1024;

export type AnthropicHypothesisEvaluatorOptions = {
  readonly apiKey?: string;
  readonly model: string;
  readonly maxTokens?: number;
};

export class AnthropicHypothesisEvaluator implements IHypothesisEvaluator {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  public constructor(options: AnthropicHypothesisEvaluatorOptions) {
    this.client = new Anthropic({ apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY });
    this.model = options.model;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  public async evaluate(
    criterion: string,
    evidence: readonly EvidenceItem[],
    caseContext: CaseContext,
  ): Promise<EvaluationOutcome> {
    const nonOkEvidence = evidence.filter((item) => item.result !== 'ok');
    if (nonOkEvidence.length > 0) {
      return noDataOutcome(nonOkEvidence);
    }
    const prompt = buildUserPrompt(criterion, evidence, caseContext);
    const startedAt = Date.now();
    const message = await this.requestJudgment(prompt);
    const elapsedMs = Date.now() - startedAt;
    if (message === undefined) {
      return judgmentFailureOutcome({ elapsed_ms: elapsedMs, prompt });
    }
    return outcomeFromModelText(textOf(message), { usage: message.usage, elapsed_ms: elapsedMs, prompt });
  }

  private async requestJudgment(prompt: string): Promise<Anthropic.Message | undefined> {
    try {
      return await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      });
    } catch {
      return undefined;
    }
  }
}

type CallRecord = {
  readonly usage?: Usage;
  readonly elapsed_ms: number;
  readonly prompt: string;
};

function noDataOutcome(nonOkEvidence: readonly EvidenceItem[]): EvaluationOutcome {
  return {
    verdict: 'inconclusive',
    reason: 'no-data',
    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept, field: '' })),
  };
}

function judgmentFailureOutcome(callRecord?: CallRecord): EvaluationOutcome {
  return { verdict: 'inconclusive', reason: 'judgment-failure', citations: [], ...callRecord };
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

function outcomeFromModelText(text: string, callRecord: CallRecord): EvaluationOutcome {
  const parsed = parseJudgment(text);
  if (parsed === undefined || parsed.verdict === 'inconclusive') {
    return judgmentFailureOutcome(callRecord);
  }
  if (parsed.verdict === 'confirmed') {
    return { verdict: 'confirmed', citations: parsed.citations, ...callRecord };
  }
  return { verdict: 'refuted', citations: parsed.citations, ...callRecord };
}

type ParsedJudgment =
  | { readonly verdict: 'inconclusive' }
  | { readonly verdict: 'confirmed' | 'refuted'; readonly citations: readonly [Citation, ...Citation[]] };

function parseJudgment(text: string): ParsedJudgment | undefined {
  const value = parseJsonOrUndefined(text);
  if (!isPlainObject(value) || !isVerdict(value.verdict)) {
    return undefined;
  }
  if (value.verdict === 'inconclusive') {
    return { verdict: 'inconclusive' };
  }
  const citations = value.citations;
  if (!isCitationArray(citations) || !isNonEmpty(citations)) {
    return undefined;
  }
  return { verdict: value.verdict, citations };
}

function buildUserPrompt(criterion: string, evidence: readonly EvidenceItem[], caseContext: CaseContext): string {
  return [
    '<judgment_input>',
    '<criterion>',
    escapeForXmlText(criterion),
    '</criterion>',
    '<evidence>',
    evidenceBlock(evidence),
    '</evidence>',
    '<case_title>',
    escapeForXmlText(caseContext.title),
    '</case_title>',
    '<case_when_to_use>',
    escapeForXmlText(caseContext.whenToUse),
    '</case_when_to_use>',
    '</judgment_input>',
  ].join('\n');
}

function evidenceBlock(evidence: readonly EvidenceItem[]): string {
  return evidence.map(itemBlock).join('\n');
}

function itemBlock(item: EvidenceItem): string {
  return [
    `<item concept="${escapeForXmlAttribute(item.concept)}">`,
    ...conceptDescriptionLines(item.concept_description),
    fieldsBlock(item.fields),
    `<observation>${item.result === 'ok' ? escapeForXmlText(item.observation) : ''}</observation>`,
    '</item>',
  ].join('\n');
}

function conceptDescriptionLines(conceptDescription: string): readonly string[] {
  return conceptDescription === '' ? [] : [`<concept_description>${escapeForXmlText(conceptDescription)}</concept_description>`];
}

function fieldsBlock(fields: readonly FieldSemantics[]): string {
  return ['<fields>', ...fields.map(fieldElement), '</fields>'].join('\n');
}

function fieldElement(field: FieldSemantics): string {
  const typeAttribute = field.type !== undefined ? ` type="${escapeForXmlAttribute(field.type)}"` : '';
  const description = field.description !== undefined ? escapeForXmlText(field.description) : '';
  return `<field name="${escapeForXmlAttribute(field.name)}"${typeAttribute}>${description}</field>`;
}

function escapeForXmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeForXmlAttribute(value: string): string {
  return escapeForXmlText(value).replace(/"/g, '&quot;');
}

function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(unwrapCodeFence(text));
  } catch {
    return undefined;
  }
}

const CODE_FENCE = /^```(?:[a-zA-Z0-9]*\n)?([\s\S]*?)\n?```$/;

function unwrapCodeFence(text: string): string {
  const trimmed = text.trim();
  const match = CODE_FENCE.exec(trimmed);
  return match ? match[1] : trimmed;
}

function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && (VERDICTS as readonly string[]).includes(value);
}

function isCitation(value: unknown): value is Citation {
  return isPlainObject(value) && typeof value.concept === 'string' && typeof value.field === 'string';
}

function isCitationArray(value: unknown): value is readonly Citation[] {
  return Array.isArray(value) && value.every(isCitation);
}

function isNonEmpty<T>(items: readonly T[]): items is readonly [T, ...T[]] {
  return items.length > 0;
}

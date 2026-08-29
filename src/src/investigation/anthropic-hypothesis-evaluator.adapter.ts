// The production IHypothesisEvaluator adapter
// (task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator): judges one
// hypothesis's criterion against its own evidence — each item carrying its
// own snapshotted field semantics (name, and type and description where
// declared) and its concept's own snapshotted description
// (rules/investigation/judgment-reads-the-evidence-snapshot) — and the
// pinned case's own title and when_to_use, by calling the Anthropic API
// through @anthropic-ai/sdk and no other HTTP client
// (constraints/judgment-runs-behind-a-port, STK-11). Prompt assembly is a
// pure function of exactly the criterion, the evidence's own snapshotted
// semantics, and the pinned case's title and when_to_use, placed inside one
// closed, delimited data block, with a fixed system instruction and no tool
// granted on the request (constraints/the-judgment-prompt-is-closed): the
// model can never be led to act, only to answer. Evidence whose own result is not ok
// grounds nothing, so it is answered inconclusive with reason no-data,
// citing exactly that evidence, without ever reaching the model
// (rules/investigation/an-inconclusive-evaluation-declares-its-reason's own
// no-data clause); what the model itself cannot ground from ok evidence is
// answered inconclusive with reason judgment-failure, the same reason a
// provider failure or an unparseable answer falls back to
// (rules/investigation/judgment-does-not-infer). A decided verdict always
// carries at least one citation, the type itself refusing any other shape
// (rules/investigation/a-decided-evaluation-cites-evidence). This adapter
// never validates a citation against the judged hypothesis's own collects or
// against a capability's output schema — that is citation-validation.ts's
// own behavior, run by this port's one caller today
// (task/hypothesis-judgment/judgment-stage), which retries or degrades a
// foreign citation rather than this adapter pre-empting it. This class sits
// beside the existing fake adapter, never imported by the domain layer
// itself (constraints/the-domain-depends-on-no-infrastructure).
//
// evaluate() also reports the call's own record
// (task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing):
// the prompt is built once, before the provider call, and returned exactly as
// materialized regardless of what the call answers; elapsed_ms is measured
// with Date.now() around that one call, this file's own established
// convention (connector-http-issuer.ts's own startedAt/elapsedMs), whether
// the call answers or throws; usage is read from the provider response's own
// message.usage, so it is present only where a response actually came back —
// a call that throws before answering (requestJudgment's own undefined) has
// elapsed_ms and prompt to report but no response to read usage from. A
// no-data outcome, answered without ever reaching the provider, carries none
// of the three, unchanged.

import Anthropic from '@anthropic-ai/sdk';
import type { Citation } from './citation.js';
import type { FieldSemantics } from './field-semantics.js';
import type {
  CaseContext,
  EvaluationOutcome,
  EvidenceItem,
  IHypothesisEvaluator,
} from './hypothesis-evaluator.port.js';
import type { Usage } from './usage.js';
import { VERDICTS, type Verdict } from './verdict.js';

/**
 * The fixed judgment instruction every call carries, unchanged by any input
 * (constraints/the-judgment-prompt-is-closed): evidence inside the closed
 * <judgment_input> block grounds a verdict, and the absence of evidence that
 * would ground one is a reason to answer inconclusively, never an invitation
 * to infer or to draw on anything outside that block
 * (rules/investigation/judgment-does-not-infer). The requested answer shape
 * is stated here rather than through a declared tool, since this adapter's
 * whole point is granting the model none.
 */
const SYSTEM_PROMPT = `You judge whether the criterion of one troubleshooting hypothesis is confirmed or refuted, using only the evidence given to you.

Ground every verdict in the <judgment_input> block of the user message. The absence of evidence that would ground a verdict is itself a reason to answer inconclusively — never an invitation to infer, assume, or draw on anything beyond the <criterion>, <evidence>, <case_title> and <case_when_to_use> the block carries. Do not consult outside knowledge, and never let the case's title or when-to-use substitute for evidence. Each <item> inside <evidence> names its own concept, carries a <concept_description> naming what that concept means wherever one is known (absent where none is — the item is then known by its concept alone, with no stated meaning), lists its own <field> elements inside <fields> — each naming itself and, wherever known, its own type and a description of what it means — and carries its own <observation>.

Answer with exactly one JSON object and nothing else — no prose before or after it, no markdown code fence — matching exactly one of these three shapes:

{"verdict":"confirmed","citations":[{"concept":"<a concept named in <evidence>>","field":"<the name of one of that item's own <field> elements>"}]}
{"verdict":"refuted","citations":[{"concept":"<a concept named in <evidence>>","field":"<the name of one of that item's own <field> elements>"}]}
{"verdict":"inconclusive"}

A citation's field must be copied exactly from the name one of its own item's <field> elements declares — never invented, never the observation's own text, and never a field named on another item. Use "confirmed" or "refuted" only where the evidence's own content grounds that verdict, with at least one citation naming the evidence that grounds it. Use "inconclusive" whenever the evidence does not ground either, or whenever the item that would ground it declares no fields at all.`;

/** The token ceiling this adapter asks the provider for when a caller configures none — an operational bound no specification node names, never a domain fact. */
const DEFAULT_MAX_TOKENS = 1024;

/**
 * What one AnthropicHypothesisEvaluator needs to construct: the provider
 * credential, read from process.env.ANTHROPIC_API_KEY when the constructor
 * is not given one directly (STK-11's own "the credential read from the
 * environment"), the model to call as a required parameter rather than a
 * default this adapter would otherwise have to invent (no specification node
 * names a version), and the token ceiling for its answer.
 */
export type AnthropicHypothesisEvaluatorOptions = {
  readonly apiKey?: string;
  readonly model: string;
  readonly maxTokens?: number;
};

/**
 * The production hypothesis-evaluator adapter
 * (domain/investigation/hypothesis-evaluator,
 * task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator): one
 * isolated Anthropic call per evaluate(), granting the model no tools, never
 * throwing for any of the three verdicts.
 */
export class AnthropicHypothesisEvaluator implements IHypothesisEvaluator {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  public constructor(options: AnthropicHypothesisEvaluatorOptions) {
    this.client = new Anthropic({ apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY });
    this.model = options.model;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  /**
   * evaluate: the port's own call (domain/investigation/hypothesis-evaluator).
   * Evidence carrying even one non-ok result grounds nothing, so it is
   * answered no-data without ever calling the model; otherwise the prompt is
   * built once, the model is called exactly once with elapsed_ms measured
   * around that call, and its answer, or its absence, is turned into one of
   * the three declared outcomes — never a thrown exception — carrying that
   * same call's own elapsed_ms and prompt, plus usage wherever a response
   * actually came back
   * (task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing).
   */
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

  /**
   * Calls the provider exactly once with the given, already-materialized
   * prompt, granting the model no tools at all — the field is never
   * declared, never an empty array forcing a choice — and answers undefined
   * rather than throwing on any provider failure, evaluate()'s own contract
   * never throwing.
   */
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

/**
 * One provider call's own record, as evaluate() itself measured and
 * materialized it: elapsed_ms and prompt are always known once a call has
 * been attempted, whether or not it answered; usage is present only where a
 * response actually came back to read message.usage from
 * (task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing).
 */
type CallRecord = {
  readonly usage?: Usage;
  readonly elapsed_ms: number;
  readonly prompt: string;
};

/**
 * Inconclusive with reason no-data, citing every evidence item whose own
 * result is not ok — this codebase's established convention for a no-data
 * citation (judgment-stage.ts's own noDataEvaluation), field left as the
 * empty string since there is no meaningful field to point at on evidence
 * that carries no observation.
 */
function noDataOutcome(nonOkEvidence: readonly EvidenceItem[]): EvaluationOutcome {
  return {
    verdict: 'inconclusive',
    reason: 'no-data',
    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept, field: '' })),
  };
}

/**
 * Inconclusive with reason judgment-failure and no citations: a provider
 * call that failed outright, a response this adapter could not parse into
 * one of the three declared shapes, or a model answer that itself declined
 * to ground a verdict from evidence that was not missing — none of these a
 * distinction the closed evaluation-reason vocabulary draws any finer than
 * this, once no-data's own evidence-result condition does not hold. Carries
 * whatever call record it is given — present for every path once a call has
 * actually been attempted, absent only where this function is never reached
 * (the no-data path above, which never calls this).
 */
function judgmentFailureOutcome(callRecord?: CallRecord): EvaluationOutcome {
  return { verdict: 'inconclusive', reason: 'judgment-failure', citations: [], ...callRecord };
}

/** The text of every text content block the model answered, concatenated in order — the only content this adapter ever reads, since no tool is ever declared on the request. */
function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

/**
 * Reads the model's whole answer as one JSON object matching one of the
 * three declared shapes, falling back to judgment-failure for anything else
 * — an empty response, prose around the object, or a shape this adapter's
 * own contract does not recognize. Carries the given call record — a
 * response did come back by the time this is called, so it always includes
 * usage alongside elapsed_ms and prompt.
 */
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

/** What one well-formed model answer parses into: a bare inconclusive marker, or a decided verdict with the non-empty citation tuple the port's own EvaluationOutcome type requires. */
type ParsedJudgment =
  | { readonly verdict: 'inconclusive' }
  | { readonly verdict: 'confirmed' | 'refuted'; readonly citations: readonly [Citation, ...Citation[]] };

/** Parses one model answer into ParsedJudgment, answering undefined for anything that is not valid JSON or does not match one of the three declared shapes — never throwing. */
function parseJudgment(text: string): ParsedJudgment | undefined {
  const value = parseJsonOrUndefined(text);
  if (!isRecord(value) || !isVerdict(value.verdict)) {
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

/**
 * The whole prompt one evaluate() call sends, a pure function of exactly its
 * own permitted inputs — this hypothesis's own criterion, its evidence's own
 * snapshotted field semantics and concept descriptions
 * (rules/investigation/judgment-reads-the-evidence-snapshot), and the pinned
 * case's own title and when_to_use — inside one closed, delimited data block
 * (constraints/the-judgment-prompt-is-closed): the same inputs always render
 * this same text, and nothing else (another hypothesis's own criterion, a
 * subject's own attribute, a live glossary or capability-registry read) ever
 * enters it.
 */
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

/**
 * One <item> per evidence entry, each naming its own concept, carrying its
 * own snapshotted <concept_description> where one is known
 * (scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone's
 * own "named by its concept alone" for the empty case, honored by
 * conceptDescriptionLines below omitting the tag entirely rather than
 * rendering it empty), listing its own <field> elements inside <fields> —
 * the field-name vocabulary a citation over this item may draw from, never
 * the schema itself — and carrying its own <observation>. Every entry is
 * 'ok' by the time evaluate() calls this, the non-ok case having already
 * answered no-data without reaching here.
 */
function evidenceBlock(evidence: readonly EvidenceItem[]): string {
  return evidence.map(itemBlock).join('\n');
}

/** One evidence item's own closed-block rendering: its concept, its own snapshotted concept description where one is known, its own fields, and its own observation — every piece escaped, so nothing an item carries can be read as markup or as an instruction. */
function itemBlock(item: EvidenceItem): string {
  return [
    `<item concept="${escapeForXmlAttribute(item.concept)}">`,
    ...conceptDescriptionLines(item.concept_description),
    fieldsBlock(item.fields),
    `<observation>${item.result === 'ok' ? escapeForXmlText(item.observation) : ''}</observation>`,
    '</item>',
  ].join('\n');
}

/** The item's own snapshotted concept description as one escaped <concept_description> line, or no line at all where the snapshot is the empty string — an item collected before its concept declared one, or one the glossary never held, is then named by its concept alone, with no stated meaning (scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone). */
function conceptDescriptionLines(conceptDescription: string): readonly string[] {
  return conceptDescription === '' ? [] : [`<concept_description>${escapeForXmlText(conceptDescription)}</concept_description>`];
}

/** This item's own snapshotted field semantics, one <field> per entry inside <fields> — empty where the item's own capability never resolved and snapshotted no fields at all (domain/investigation/evidence). */
function fieldsBlock(fields: readonly FieldSemantics[]): string {
  return ['<fields>', ...fields.map(fieldElement), '</fields>'].join('\n');
}

/** One field's own name, plus its own type attribute and description text exactly where the snapshot declared them — never invented where the schema declared neither. */
function fieldElement(field: FieldSemantics): string {
  const typeAttribute = field.type !== undefined ? ` type="${escapeForXmlAttribute(field.type)}"` : '';
  const description = field.description !== undefined ? escapeForXmlText(field.description) : '';
  return `<field name="${escapeForXmlAttribute(field.name)}"${typeAttribute}>${description}</field>`;
}

/** Escapes text placed between two tags of the closed data block, keeping evidence content data rather than markup that could otherwise break the block's own closure (constraints/the-judgment-prompt-is-closed). */
function escapeForXmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Escapes text placed inside a double-quoted attribute of the closed data block, additionally closing off the quote character an attribute value could otherwise break out of. */
function escapeForXmlAttribute(value: string): string {
  return escapeForXmlText(value).replace(/"/g, '&quot;');
}

/**
 * Parses text as JSON, answering undefined rather than throwing where it is
 * not valid JSON at all — the same discipline citation-validation.ts's own
 * parseJsonOrUndefined keeps for an opaque schema string. Strips one
 * wrapping markdown code fence first where the whole answer is one, since a
 * model can still wrap its JSON in one despite SYSTEM_PROMPT's own explicit
 * "no markdown code fence" instruction — observed directly against the real
 * provider (claude-haiku-4-5-20251001 answered
 * "```json\n{\"verdict\":...}\n```" for an otherwise well-grounded verdict) —
 * and the closed prompt gives the model no tool to answer through instead,
 * so tolerating this one common wrapping shape is this adapter's own to do
 * rather than the model's to be trusted to stop doing.
 */
function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(unwrapCodeFence(text));
  } catch {
    return undefined;
  }
}

/** A whole-string markdown code fence, optionally tagged with a language, wrapping the text between one pair of matching ``` markers. */
const CODE_FENCE = /^```(?:[a-zA-Z0-9]*\n)?([\s\S]*?)\n?```$/;

/** Strips one wrapping code fence from the whole trimmed text, answering the text unchanged where it is not wrapped in one at all. */
function unwrapCodeFence(text: string): string {
  const trimmed = text.trim();
  const match = CODE_FENCE.exec(trimmed);
  return match ? match[1] : trimmed;
}

/** Whether a parsed JSON value is a non-null, non-array object — the only shape this adapter reads a field from. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Whether a parsed value is one of the port's own three verdict names. */
function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && (VERDICTS as readonly string[]).includes(value);
}

/** Whether a parsed value is a well-formed Citation — a concept and a field, both strings. This adapter checks only that shape, never whether the concept or field are actually valid for the judged hypothesis: that check, and any retry or fallback over a citation that fails it, belongs to this port's caller alone. */
function isCitation(value: unknown): value is Citation {
  return isRecord(value) && typeof value.concept === 'string' && typeof value.field === 'string';
}

/** Whether a parsed value is an array of well-formed citations. */
function isCitationArray(value: unknown): value is readonly Citation[] {
  return Array.isArray(value) && value.every(isCitation);
}

/** Narrows a readonly array to the non-empty tuple shape EvaluationOutcome's confirmed/refuted members require. */
function isNonEmpty<T>(items: readonly T[]): items is readonly [T, ...T[]] {
  return items.length > 0;
}

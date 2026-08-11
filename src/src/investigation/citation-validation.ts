// The structural check that makes a citation's validity machine-checkable
// rather than a promise (domain/investigation/citation): every concept a
// citation names must belong to the judged hypothesis's own collects
// (rules/investigation/a-citation-stays-within-the-hypothesis-collects), and
// every field a citation names must exist in the output schema of the
// capability that produced the cited evidence
// (rules/investigation/a-cited-field-exists-in-the-capability-output-schema).
// Pure and synchronous throughout: it reads a hypothesis's own collects, its
// evidence, and each cited capability's own output schema, all as
// already-available plain data, and imports no port, no framework, no
// driver and no provider client
// (constraints/the-domain-depends-on-no-infrastructure) — a live
// capability-registry lookup, assembling an Evaluation, deciding a verdict
// or a reason, and any retry-or-fallback over a foreign citation all belong
// to task/hypothesis-judgment/judgment-stage, never here.

import type { Citation } from './citation.js';
import type { Evidence } from './evidence.js';

/**
 * The serialized output schema of each capability this check may need,
 * keyed by capabilityOutputSchemaKey(capability_name, capability_version) —
 * never keyed by concept alone, since the field rule binds a citation to the
 * schema of the specific capability that produced the cited evidence, not to
 * whichever capability a live registry read would currently answer for that
 * concept (rules/investigation/a-cited-field-exists-in-the-capability-output-schema).
 * Built by the caller from whatever capability data it already resolved —
 * this check makes no registry call of its own and holds none of its own.
 */
export type CapabilityOutputSchemas = Readonly<Record<string, string>>;

/**
 * The key one capability's output schema is stored under in
 * CapabilityOutputSchemas: its own name and version joined the same way
 * idempotency-key.ts joins its own multi-field lookup key — this
 * codebase's established convention for a composite lookup key
 * (src/investigation/idempotency-key.ts).
 */
export function capabilityOutputSchemaKey(capabilityName: string, capabilityVersion: string): string {
  return [capabilityName, capabilityVersion].join('::');
}

/**
 * Everything one hypothesis's citations are checked against: its own
 * collects (or just that array, per domain/knowledge/hypothesis — this
 * check takes the plain array, never the Hypothesis or Case type, so it
 * models neither), its own evidence (task/evidence-collection/evidence-collection-stage's
 * Evidence, reused as delivered rather than reduced to a parallel shape),
 * and the output schemas of whichever capabilities produced that evidence.
 */
export type HypothesisCitationContext = {
  readonly collects: readonly string[];
  readonly evidence: readonly Evidence[];
  readonly outputSchemas: CapabilityOutputSchemas;
};

/**
 * Whether one proposed citation is accepted: its concept is in the judged
 * hypothesis's own collects
 * (rules/investigation/a-citation-stays-within-the-hypothesis-collects) and
 * its field exists in the output schema of the capability that produced the
 * cited evidence
 * (rules/investigation/a-cited-field-exists-in-the-capability-output-schema).
 * Both rules must hold; either failing refuses the citation.
 */
export function isCitationValid(context: HypothesisCitationContext, citation: Citation): boolean {
  return citesACollectedConcept(context.collects, citation) && citesADeclaredField(context, citation);
}

/**
 * The input a batch call takes: one hypothesis's citation context, plus the
 * proposed set of citations to check against it.
 */
export type ValidateCitationsOptions = HypothesisCitationContext & {
  readonly citations: readonly Citation[];
};

/**
 * The proposed citations that survive both rules, in the order proposed —
 * never the citations refused, deciding no verdict or reason from that: an
 * evaluator's response that names even one foreign or unbacked citation is
 * this check's own criterion for refusal, but what happens next (retry,
 * fallback to inconclusive) is task/hypothesis-judgment/judgment-stage's own
 * orchestration (scenarios/investigation/a-foreign-citation-is-refused).
 */
export function acceptedCitations(options: ValidateCitationsOptions): readonly Citation[] {
  const { citations, ...context } = options;
  return citations.filter((citation) => isCitationValid(context, citation));
}

/** Rule 1: the citation's concept is one this hypothesis actually collects. */
function citesACollectedConcept(collects: readonly string[], citation: Citation): boolean {
  return collects.includes(citation.concept);
}

/**
 * Rule 2: the citation's field exists in the output schema of the
 * capability that produced this hypothesis's evidence for that same
 * concept. A concept with no matching evidence at all has no capability to
 * point at, so its citations are refused the same way a malformed or absent
 * schema is: as declaring no fields, never as a thrown fault.
 */
function citesADeclaredField(context: HypothesisCitationContext, citation: Citation): boolean {
  const citedEvidence = context.evidence.find((item) => item.concept === citation.concept);
  if (citedEvidence === undefined) {
    return false;
  }
  const key = capabilityOutputSchemaKey(citedEvidence.capability_name, citedEvidence.capability_version);
  return declaredFieldsOf(context.outputSchemas[key]).includes(citation.field);
}

/**
 * The field names one capability's output schema declares, read
 * structurally as a JSON Schema's top-level `properties` keys — this task's
 * own inference on how an opaque, serialized output_schema is read
 * (domain/integration/capability's own decision-log entry leaves the
 * concrete format unstated). Answers no fields at all for a schema that is
 * not parseable JSON, or that holds no top-level `properties` object, so a
 * malformed or absent schema refuses every citation against it rather than
 * throwing — a data-quality fact this pure check records as "nothing
 * declared," never as a fault it raises.
 */
export function declaredFieldsOf(outputSchema: string | undefined): readonly string[] {
  if (outputSchema === undefined) {
    return [];
  }
  const parsed = parseJsonOrUndefined(outputSchema);
  if (!isPlainObject(parsed) || !isPlainObject(parsed.properties)) {
    return [];
  }
  return Object.keys(parsed.properties);
}

/** Parses text as JSON, answering undefined rather than throwing where it is not valid JSON at all. */
function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Whether a parsed JSON value is a non-null, non-array object — the only shape this check reads keys from, for a schema's own top level or its `properties` value alike. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

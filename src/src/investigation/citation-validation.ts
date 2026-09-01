import type { Citation } from './citation.js';
import type { Evidence } from './evidence.js';

export type HypothesisCitationContext = {
  readonly collects: readonly string[];
  readonly evidence: readonly Evidence[];
};

export function isCitationValid(context: HypothesisCitationContext, citation: Citation): boolean {
  return citesACollectedConcept(context.collects, citation) && citesADeclaredField(context, citation);
}

export type ValidateCitationsOptions = HypothesisCitationContext & {
  readonly citations: readonly Citation[];
};

export function acceptedCitations(options: ValidateCitationsOptions): readonly Citation[] {
  const { citations, ...context } = options;
  return citations.filter((citation) => isCitationValid(context, citation));
}

function citesACollectedConcept(collects: readonly string[], citation: Citation): boolean {
  return collects.includes(citation.concept);
}

function citesADeclaredField(context: HypothesisCitationContext, citation: Citation): boolean {
  const citedEvidence = context.evidence.find((item) => item.concept === citation.concept);
  if (citedEvidence === undefined) {
    return false;
  }
  return citedEvidence.fields.some((field) => field.name === citation.field);
}

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

export function parseJsonOrUndefined(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

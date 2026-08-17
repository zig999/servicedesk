/**
 * A business error of the knowledge context: revise-hypothesis is asked to
 * originate a hypothesis's own identity or a new revision for a case that
 * currently holds no version in draft state — never drafted, or its only
 * draft already released or discarded — and
 * rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
 * restricts revising a hypothesis to exactly that window: the case's own
 * draft is what the concept-acceptance check anchors its declared subject
 * type against, and revising with no draft to anchor against is refused
 * rather than left unanchored. Refused before revise-hypothesis reaches any
 * of its own concept checks or the case store's own insertHypothesisRevision
 * (revise-hypothesis.operation.ts), the same name-message-context shape
 * CaseAlreadyHasDraftError and HypothesisRevisionCollectsNoConceptError
 * already establish for the case-lifecycle context's own business errors.
 */
export class CaseHoldsNoDraftError extends Error {
  public readonly context: Readonly<{ slug: string }>;

  public constructor(slug: string) {
    super(`the case "${slug}" holds no version in draft state, and a hypothesis is revised only against its case's draft`);
    this.name = 'CaseHoldsNoDraftError';
    this.context = { slug };
  }
}

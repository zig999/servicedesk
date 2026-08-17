/**
 * A business error of the knowledge context: a hypothesis-revision named no
 * concept at all, and rules/knowledge/a-hypothesis-collects-at-least-one-concept
 * requires every hypothesis-revision to collect at least one — a revision
 * without collection can cite nothing, and the citation obligation on decided
 * evaluations would be unsatisfiable for it. Refused before revise-hypothesis
 * ever reaches the case store (revise-hypothesis.operation.ts), the same
 * name-message-context shape CaseAlreadyHasDraftError and
 * ManifestPositionOccupiedError already establish for the case-lifecycle
 * context's own business errors.
 */
export class HypothesisRevisionCollectsNoConceptError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string }>;

  public constructor(slug: string, hypothesisName: string) {
    super(
      `hypothesis "${hypothesisName}" of case "${slug}" collects no concept, and a hypothesis-revision collects at least one`,
    );
    this.name = 'HypothesisRevisionCollectsNoConceptError';
    this.context = { slug, hypothesis_name: hypothesisName };
  }
}

/**
 * A business error of the knowledge context: a structurally valid case
 * violates the coherence rules that read the current glossary and capability
 * registry, and the validation refuses it once, with every violation named
 * (contracts/system/case-authoring) — so a curator corrects the case in one
 * pass rather than one refusal at a time. The violations travel in context
 * the way InvalidCaseDocumentError carries its structural problems, so the
 * reading that joins the two refusals can collect both.
 */
export class IncoherentCaseError extends Error {
  public readonly context: Readonly<{ slug: string; violations: readonly string[] }>;

  public constructor(slug: string, violations: readonly string[]) {
    super(`the case "${slug}" violates its coherence rules: ${violations.join('; ')}`);
    this.name = 'IncoherentCaseError';
    this.context = { slug, violations };
  }
}

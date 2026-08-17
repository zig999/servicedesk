/**
 * A business error of the knowledge context: a hypothesis-revision names a
 * concept the glossary does not currently hold, and
 * rules/knowledge/case-terms-exist-in-the-glossary requires every concept a
 * case version or its manifested hypothesis-revisions name to exist in the
 * glossary — the glossary is the published language, and a name it does not
 * hold names nothing. Every offending concept is named together, the same
 * refuse-once-with-every-violation-named convention
 * SubjectAttributeNotInGlossaryError already keeps for its own context.
 * Refused before revise-hypothesis ever reaches the case store
 * (revise-hypothesis.operation.ts).
 */
export class ConceptNotInGlossaryError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string; concepts: readonly string[] }>;

  public constructor(slug: string, hypothesisName: string, concepts: readonly string[]) {
    super(
      `hypothesis "${hypothesisName}" of case "${slug}" collects a concept the glossary does not hold: ${concepts.join(', ')}`,
    );
    this.name = 'ConceptNotInGlossaryError';
    this.context = { slug, hypothesis_name: hypothesisName, concepts: [...concepts] };
  }
}

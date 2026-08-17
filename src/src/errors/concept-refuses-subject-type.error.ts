/**
 * A business error of the knowledge context: a hypothesis-revision collects a
 * concept that does not accept the subject type its case version declares,
 * and rules/knowledge/a-concept-accepts-the-declared-subject-type requires
 * every concept a case version's manifested hypothesis-revisions collect to
 * accept that declared subject type — it is what stops a case version with
 * subject type customer from requesting equipment state. Every offending
 * concept is named together with the subject type they all disagree with, the
 * same refuse-once-with-every-violation-named convention
 * SubjectAttributeNotInGlossaryError already keeps for its own context.
 * Refused before revise-hypothesis ever reaches the case store
 * (revise-hypothesis.operation.ts). The four identifying fields are bundled
 * into one context object rather than passed positionally, the same
 * three-positional-parameter-limit reasoning case-store.port.ts's own
 * CreateDraftInput already discloses (MNT-01).
 */
export type ConceptRefusesSubjectTypeContext = {
  readonly slug: string;
  readonly hypothesis_name: string;
  readonly subject: string;
  readonly concepts: readonly string[];
};

export class ConceptRefusesSubjectTypeError extends Error {
  public readonly context: Readonly<ConceptRefusesSubjectTypeContext>;

  public constructor(context: ConceptRefusesSubjectTypeContext) {
    super(
      `hypothesis "${context.hypothesis_name}" of case "${context.slug}" collects a concept that does not accept the subject type "${context.subject}" the case version declares: ${context.concepts.join(', ')}`,
    );
    this.name = 'ConceptRefusesSubjectTypeError';
    this.context = { ...context, concepts: [...context.concepts] };
  }
}

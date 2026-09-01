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

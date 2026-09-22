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
      `a hipótese "${context.hypothesis_name}" do caso "${context.slug}" coleta um conceito que não aceita o tipo de sujeito "${context.subject}" que a versão do caso declara: ${context.concepts.join(', ')}`,
    );
    this.name = 'ConceptRefusesSubjectTypeError';
    this.context = { ...context, concepts: [...context.concepts] };
  }
}

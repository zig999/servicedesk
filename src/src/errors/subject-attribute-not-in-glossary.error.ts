/**
 * A business error of the investigation context: the subject being built
 * names at least one attribute the glossary does not hold
 * (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary) — an
 * attribute name the entry point assembled that the glossary's own
 * subject-attribute vocabulary does not publish is not a governed name at
 * all. The same name-message-context shape SubjectCarriesNoAttributeError
 * and InvestigationNotBuildableError already establish for their own
 * contexts, naming every offending attribute together — the same
 * refuse-once-with-every-violation-named convention investigation-factory.ts
 * already keeps for its own totality checks — rather than the first one
 * found.
 */
export class SubjectAttributeNotInGlossaryError extends Error {
  public readonly context: Readonly<{ type: string; attributes: readonly string[] }>;

  public constructor(type: string, attributes: readonly string[]) {
    super(
      `a subject of type "${type}" names an attribute the glossary does not hold: ${attributes.join(', ')}`,
    );
    this.name = 'SubjectAttributeNotInGlossaryError';
    this.context = { type, attributes: [...attributes] };
  }
}

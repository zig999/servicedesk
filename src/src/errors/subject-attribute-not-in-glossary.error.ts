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

export class SubjectCarriesNoAttributeError extends Error {
  public readonly context: Readonly<{ type: string }>;

  public constructor(type: string) {
    super(`a subject of type "${type}" carries no attribute-value; at least one is required`);
    this.name = 'SubjectCarriesNoAttributeError';
    this.context = { type };
  }
}

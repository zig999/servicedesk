export class ConceptDescriptionRequiredError extends Error {
  public readonly context: Readonly<{ name: string; given: string | undefined }>;

  public constructor(name: string, given: string | undefined) {
    super(`concept "${name}" requires a description; none was given`);
    this.name = 'ConceptDescriptionRequiredError';
    this.context = { name, given };
  }
}

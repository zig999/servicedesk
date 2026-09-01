export class WrittenAtRequiredError extends Error {
  public readonly context: Readonly<{ given: string | undefined }>;

  public constructor(given: string | undefined) {
    super('an investigation requires a written_at; none was given');
    this.name = 'WrittenAtRequiredError';
    this.context = { given };
  }
}

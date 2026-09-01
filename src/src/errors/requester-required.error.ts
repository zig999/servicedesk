export class RequesterRequiredError extends Error {
  public readonly context: Readonly<{ given: string | undefined }>;

  public constructor(given: string | undefined) {
    super('diagnose requires a requester in its own payload; none was given');
    this.name = 'RequesterRequiredError';
    this.context = { given };
  }
}

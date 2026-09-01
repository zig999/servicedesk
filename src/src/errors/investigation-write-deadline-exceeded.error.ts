export class InvestigationWriteDeadlineExceededError extends Error {
  public readonly context: Readonly<{ id: string; remainingMs: number }>;

  public constructor(id: string, remainingMs: number) {
    super(
      `the investigation with id "${id}" could not be written within the ${remainingMs}ms remaining of the declared deadline, so no assessment is returned without a corresponding record`,
    );
    this.name = 'InvestigationWriteDeadlineExceededError';
    this.context = { id, remainingMs };
  }
}

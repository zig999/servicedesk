export class MigrationStepError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MigrationStepError';
    this.context = context;
  }
}

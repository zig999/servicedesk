/**
 * A data error of the migration step (task/relational-substrate/migration-step):
 * one script under migrations/ that could not be applied, or the bookkeeping
 * row in schema_migrations that records it as applied.
 */
export class MigrationStepError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MigrationStepError';
    this.context = context;
  }
}

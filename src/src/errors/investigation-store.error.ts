export class InvestigationStoreError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvestigationStoreError';
    this.context = context;
  }
}

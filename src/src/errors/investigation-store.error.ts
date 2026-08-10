/**
 * A data error of the investigation store: an investigation file that
 * cannot be read, or whose content is not valid JSON — the same data-error
 * shape CaseStoreError already establishes for the case store's own file
 * reads.
 */
export class InvestigationStoreError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvestigationStoreError';
    this.context = context;
  }
}

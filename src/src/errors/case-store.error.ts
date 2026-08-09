/**
 * A data error of the case store: a version file that cannot be read, whose
 * content is not valid JSON, or a case directory that cannot be listed.
 */
export class CaseStoreError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CaseStoreError';
    this.context = context;
  }
}

/**
 * A data error of the glossary's file store: a vocabulary file that cannot
 * be read, or whose content is not the plain-JSON records the store port
 * promises.
 */
export class GlossaryStoreError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'GlossaryStoreError';
    this.context = context;
  }
}

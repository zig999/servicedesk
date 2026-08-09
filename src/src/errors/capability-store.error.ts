/**
 * A data error of the registry's file store: a capability file that cannot
 * be read, or whose content is not the plain-JSON records the store port
 * promises.
 */
export class CapabilityStoreError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CapabilityStoreError';
    this.context = context;
  }
}

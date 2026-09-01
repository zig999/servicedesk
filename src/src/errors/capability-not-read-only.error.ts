export class CapabilityNotReadOnlyError extends Error {
  public readonly context: Readonly<{ nature: string }>;

  public constructor(nature: string) {
    super(`the registry refuses a capability whose nature is "${nature}": only read-only registers`);
    this.name = 'CapabilityNotReadOnlyError';
    this.context = { nature };
  }
}

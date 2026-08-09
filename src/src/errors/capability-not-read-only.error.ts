/**
 * A business error of the capability registry: the registration's nature is
 * not read-only, and the registry refuses any capability whose nature is not
 * (rules/integration/a-capability-is-read-only) — the system diagnoses and
 * refers, never acts.
 */
export class CapabilityNotReadOnlyError extends Error {
  public readonly context: Readonly<{ nature: string }>;

  public constructor(nature: string) {
    super(`the registry refuses a capability whose nature is "${nature}": only read-only registers`);
    this.name = 'CapabilityNotReadOnlyError';
    this.context = { nature };
  }
}

/**
 * A business error of the capability registry: the registration does not
 * declare its contract completely, and the registry refuses what departs
 * from it (rules/integration/a-capability-declares-its-contract,
 * domain/integration/capability).
 */
export class IncompleteCapabilityContractError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the registration does not declare its contract completely: ${problems.join('; ')}`);
    this.name = 'IncompleteCapabilityContractError';
    this.context = { problems };
  }
}

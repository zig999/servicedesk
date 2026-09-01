export class IncompleteCapabilityContractError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the registration does not declare its contract completely: ${problems.join('; ')}`);
    this.name = 'IncompleteCapabilityContractError';
    this.context = { problems };
  }
}

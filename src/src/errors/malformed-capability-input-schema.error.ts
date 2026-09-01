export class MalformedCapabilityInputSchemaError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the registry refuses a registration whose input schema does not hold a well-formed shape: ${problems.join('; ')}`);
    this.name = 'MalformedCapabilityInputSchemaError';
    this.context = { problems };
  }
}

export class InvalidEnvironmentError extends Error {
  public readonly context: Readonly<{ issues: readonly string[] }>;

  public constructor(issues: readonly string[]) {
    super(`the process environment is missing or malformed: ${issues.join('; ')}`);
    this.name = 'InvalidEnvironmentError';
    this.context = { issues };
  }
}

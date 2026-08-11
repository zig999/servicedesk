/**
 * A configuration error of this process's own startup (task/http-surface/diagnose-http-endpoint):
 * process.env fails the diagnose HTTP surface's own envSchema, naming every violated field
 * together rather than failing on whichever one this process happens to reach first.
 */
export class InvalidEnvironmentError extends Error {
  public readonly context: Readonly<{ issues: readonly string[] }>;

  public constructor(issues: readonly string[]) {
    super(`the process environment is missing or malformed: ${issues.join('; ')}`);
    this.name = 'InvalidEnvironmentError';
    this.context = { issues };
  }
}

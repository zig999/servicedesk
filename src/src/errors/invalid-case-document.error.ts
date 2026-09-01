export class InvalidCaseDocumentError extends Error {
  public readonly context: Readonly<{ file: string; problems: readonly string[] }>;

  public constructor(file: string, problems: readonly string[]) {
    super(`the case document "${file}" violates its structural rules: ${problems.join('; ')}`);
    this.name = 'InvalidCaseDocumentError';
    this.context = { file, problems };
  }
}

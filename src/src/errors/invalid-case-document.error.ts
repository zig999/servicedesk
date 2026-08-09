/**
 * A business error of the knowledge context: a case document violates the
 * structural rules the aggregate is held to, and the parse refuses it once,
 * with every violation named in context (domain/knowledge/case) — so an
 * author corrects the document in one pass rather than one refusal at a
 * time.
 */
export class InvalidCaseDocumentError extends Error {
  public readonly context: Readonly<{ file: string; problems: readonly string[] }>;

  public constructor(file: string, problems: readonly string[]) {
    super(`the case document "${file}" violates its structural rules: ${problems.join('; ')}`);
    this.name = 'InvalidCaseDocumentError';
    this.context = { file, problems };
  }
}

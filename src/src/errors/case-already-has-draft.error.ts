export class CaseAlreadyHasDraftError extends Error {
  public readonly context: Readonly<{ slug: string }>;

  public constructor(slug: string) {
    super(`the case "${slug}" already holds a version in draft state, and a case has at most one draft at a time`);
    this.name = 'CaseAlreadyHasDraftError';
    this.context = { slug };
  }
}

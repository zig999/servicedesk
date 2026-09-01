export class CaseVersionNotDraftError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; state: string }>;

  public constructor(slug: string, version: number, state: string) {
    super(`case "${slug}" version ${version} is in state "${state}", not draft`);
    this.name = 'CaseVersionNotDraftError';
    this.context = { slug, version, state };
  }
}

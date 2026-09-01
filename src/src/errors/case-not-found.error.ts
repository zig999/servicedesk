export class CaseNotFoundError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(`no version ${version} of the case "${slug}" is stored`);
    this.name = 'CaseNotFoundError';
    this.context = { slug, version };
  }
}

export class CaseVersionAlreadyStoredError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(
      `the case "${slug}" already has a stored version ${version}, and a case version is written once and never altered`,
    );
    this.name = 'CaseVersionAlreadyStoredError';
    this.context = { slug, version };
  }
}

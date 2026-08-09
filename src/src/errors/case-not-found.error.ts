/**
 * A business error of the knowledge context: no version of a case answers a
 * slug and version at the moment read-case or replay-case is asked for it
 * (contracts/knowledge/case-query) — an unwritten version, refused rather
 * than answered as something it is not.
 */
export class CaseNotFoundError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(`no version ${version} of the case "${slug}" is stored`);
    this.name = 'CaseNotFoundError';
    this.context = { slug, version };
  }
}

export class CapabilityCitedByEvidenceError extends Error {
  public readonly context: Readonly<{ name: string; version: string }>;

  public constructor(name: string, version: string) {
    super(`capability "${name}" version "${version}" is cited by collected evidence and cannot be removed`);
    this.name = 'CapabilityCitedByEvidenceError';
    this.context = { name, version };
  }
}

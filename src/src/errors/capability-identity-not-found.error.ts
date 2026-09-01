export class CapabilityIdentityNotFoundError extends Error {
  public readonly context: Readonly<{ name: string; version: string }>;

  public constructor(name: string, version: string) {
    super(`no capability is currently registered under name "${name}" and version "${version}"`);
    this.name = 'CapabilityIdentityNotFoundError';
    this.context = { name, version };
  }
}

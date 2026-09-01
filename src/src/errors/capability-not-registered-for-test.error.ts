export class CapabilityNotRegisteredForTestError extends Error {
  public readonly context: Readonly<{ name: string; version: string }>;

  public constructor(name: string, version: string) {
    super(`no capability is currently registered under name "${name}" and version "${version}"`);
    this.name = 'CapabilityNotRegisteredForTestError';
    this.context = { name, version };
  }
}

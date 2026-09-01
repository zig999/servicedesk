type CapabilityIdentity = Readonly<{ name: string; version: string }>;

export type MissingCaseInput = Readonly<{ attribute: string; capabilities: readonly CapabilityIdentity[] }>;

export class SubjectDoesNotCoverCaseInputsError extends Error {
  public readonly context: Readonly<{ missing: readonly MissingCaseInput[] }>;

  public constructor(missing: readonly MissingCaseInput[]) {
    super(`the subject does not cover this case's required inputs: ${missing.map(describeMissing).join('; ')}`);
    this.name = 'SubjectDoesNotCoverCaseInputsError';
    this.context = { missing };
  }
}

function describeMissing(entry: MissingCaseInput): string {
  const capabilities = entry.capabilities.map((capability) => `${capability.name}@${capability.version}`).join(', ');
  return `"${entry.attribute}" (required by ${capabilities})`;
}

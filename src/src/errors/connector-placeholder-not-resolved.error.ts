export class ConnectorPlaceholderNotResolvedError extends Error {
  public readonly context: Readonly<{ kind: 'subject-attribute' | 'credential'; name: string }>;

  public constructor(kind: 'subject-attribute' | 'credential', name: string) {
    super(
      kind === 'subject-attribute'
        ? `a placeholder names a subject attribute the Subject does not carry, or carries as empty: "${name}"`
        : `a placeholder names a credential environment variable that is not set, or is set empty: "${name}"`,
    );
    this.name = 'ConnectorPlaceholderNotResolvedError';
    this.context = { kind, name };
  }
}

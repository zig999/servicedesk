export class CapabilitySchemaNotWellFormedError extends Error {
  public readonly context: Readonly<{ attributes: readonly string[] }>;

  public constructor(attributes: readonly string[]) {
    super(
      `the registry refuses a registration whose schema is not syntactically valid JSON: ${attributes.join(', ')}`,
    );
    this.name = 'CapabilitySchemaNotWellFormedError';
    this.context = { attributes };
  }
}

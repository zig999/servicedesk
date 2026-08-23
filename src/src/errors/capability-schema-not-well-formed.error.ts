/**
 * A business error of the capability registry: the registration's input
 * schema or output schema is not syntactically valid JSON, and the registry
 * refuses any capability whose schema is not well-formed
 * (rules/integration/a-capability-declares-well-formed-schemas). Nothing
 * checked this before a human could type this text directly, and a
 * malformed schema is silently read as no fields at all wherever a citation
 * is later checked against it — refusing it at the door is what keeps that
 * silent degradation from ever having a case to happen in.
 */
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

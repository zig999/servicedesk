/**
 * A business error of the capability registry: the registration's input
 * schema, once confirmed syntactically valid JSON, does not hold the
 * declared shape — it does not declare properties as an object, or it
 * declares a required array naming a key absent from properties
 * (rules/integration/a-capability-input-schema-holds-a-well-formed-object).
 * Distinct from CapabilitySchemaNotWellFormedError, which only ever asks
 * whether the schema text parses as JSON at all — this rule's own "Distinct
 * from a-capability-declares-well-formed-schemas" clause. Every departure
 * the registration made at once is named together, never just the first
 * one found.
 */
export class MalformedCapabilityInputSchemaError extends Error {
  public readonly context: Readonly<{ problems: readonly string[] }>;

  public constructor(problems: readonly string[]) {
    super(`the registry refuses a registration whose input schema does not hold a well-formed shape: ${problems.join('; ')}`);
    this.name = 'MalformedCapabilityInputSchemaError';
    this.context = { problems };
  }
}

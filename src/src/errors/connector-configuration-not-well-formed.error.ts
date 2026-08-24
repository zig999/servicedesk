/**
 * A business error of the connector-configuration registry: the
 * registration's configuration text is not syntactically valid JSON, or it
 * parses to something other than a plain JSON object (an array or a
 * primitive) — the registry refuses any connector configuration that is not
 * well-formed
 * (rules/integration/a-connector-configuration-holds-a-well-formed-object),
 * the same discipline a-capability-declares-well-formed-schemas already
 * holds for a capability's two schemas
 * (capability-schema-not-well-formed.error.ts, this task's own precedent).
 * Nothing checked this before a human could author the configuration text
 * directly, and a malformed payload would otherwise reach a runtime call
 * untested — refusing it at the door is what keeps that failure from ever
 * having a case to happen in.
 */
export class ConnectorConfigurationNotWellFormedError extends Error {
  public readonly context: Readonly<{ reason: string }>;

  public constructor(reason: string) {
    super(`the registry refuses a registration whose configuration is not syntactically valid JSON object text: ${reason}`);
    this.name = 'ConnectorConfigurationNotWellFormedError';
    this.context = { reason };
  }
}

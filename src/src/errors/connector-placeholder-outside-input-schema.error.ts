import type { RegisteredCapabilityForPlaceholderCheck } from '../connector-registry/capabilities-reader.port.js';

/**
 * One Subject-attribute placeholder a connector configuration's own call
 * text embeds that no capability currently registered against that
 * connector's name declares in its own input schema properties, together
 * with every one of those capabilities — since "a placeholder must be
 * declared by at least one of them to not be orphaned"
 * (task/connector-configuration-and-placeholder-contract/refuse-connector-registration-with-orphaned-placeholder)
 * means every capability registered against this connector fails to declare
 * a placeholder this shape names. Each capability is named exactly as the
 * connector-configuration registry's own narrow read of the capability
 * registry answers it — the connector it names and its own declared input
 * schema (connector-registry/capabilities-reader.port.ts) — since that port
 * carries no wider identity (name, version) for this registry to name a
 * capability by.
 */
export type OrphanedPlaceholder = Readonly<{
  placeholder: string;
  capabilities: readonly RegisteredCapabilityForPlaceholderCheck[];
}>;

/**
 * A business error of the connector-configuration registry:
 * rules/integration/a-connector-placeholder-is-declared-by-its-capability's
 * own connector-configuration-registration direction — a registration or
 * edit is refused when its own call text embeds a placeholder naming a
 * Subject attribute that no capability currently registered against that
 * connector's name declares in its input schema properties. Raised before
 * any write
 * (task/connector-configuration-and-placeholder-contract/refuse-connector-registration-with-orphaned-placeholder).
 * Every orphaned placeholder is named together, never just the first one
 * found — the same refuse-once-with-every-violation-named convention
 * MalformedCapabilityInputSchemaError and SubjectDoesNotCoverCaseInputsError
 * already keep.
 */
export class ConnectorPlaceholderOutsideInputSchemaError extends Error {
  public readonly context: Readonly<{ orphaned: readonly OrphanedPlaceholder[] }>;

  public constructor(orphaned: readonly OrphanedPlaceholder[]) {
    super(
      `the registry refuses a connector configuration embedding a placeholder no registered capability declares: ${orphaned
        .map(describeOrphaned)
        .join('; ')}`,
    );
    this.name = 'ConnectorPlaceholderOutsideInputSchemaError';
    this.context = { orphaned };
  }
}

/** Renders one orphaned placeholder together with the connector every capability that fails to declare it names, for this error's own message. */
function describeOrphaned(entry: OrphanedPlaceholder): string {
  const connector = entry.capabilities[0].connector;
  return `"${entry.placeholder}" (not declared by any capability naming connector "${connector}")`;
}

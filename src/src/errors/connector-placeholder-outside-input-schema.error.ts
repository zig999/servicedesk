import type { RegisteredCapabilityForPlaceholderCheck } from '../connector-registry/capabilities-reader.port.js';

export type OrphanedPlaceholder = Readonly<{
  placeholder: string;
  capabilities: readonly RegisteredCapabilityForPlaceholderCheck[];
}>;

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

function describeOrphaned(entry: OrphanedPlaceholder): string {
  const connector = entry.capabilities[0].connector;
  return `"${entry.placeholder}" (not declared by any capability naming connector "${connector}")`;
}

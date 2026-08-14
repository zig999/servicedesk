/**
 * A data error of the connector-configuration registry's relational store: a
 * read or a write against connector_configurations that the driver refused.
 */
export class ConnectorConfigurationStoreError extends Error {
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(message: string, context: Readonly<Record<string, unknown>>, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ConnectorConfigurationStoreError';
    this.context = context;
  }
}

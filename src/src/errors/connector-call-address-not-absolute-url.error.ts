export class ConnectorCallAddressNotAbsoluteUrlError extends Error {
  public readonly context: Readonly<{ address: string }>;

  public constructor(address: string, options?: ErrorOptions) {
    super(`the connector configuration's resolved address is not a valid absolute URL: "${address}"`, options);
    this.name = 'ConnectorCallAddressNotAbsoluteUrlError';
    this.context = { address };
  }
}

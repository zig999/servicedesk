export class ConnectorUnreachableError extends Error {
  public readonly context: Readonly<{ connector: string }>;

  public constructor(connector: string, options?: ErrorOptions) {
    super(`connector "${connector}"'s own call could not be issued: no HTTP response was ever received`, options);
    this.name = 'ConnectorUnreachableError';
    this.context = { connector };
  }
}

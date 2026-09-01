export type ConnectorCallDescriptor = {
  readonly address: string;
  readonly query?: Readonly<Record<string, string>>;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
};

export type AssembledConnectorRequest = {
  readonly address: string;
  readonly query: Readonly<Record<string, string>>;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: unknown;
};

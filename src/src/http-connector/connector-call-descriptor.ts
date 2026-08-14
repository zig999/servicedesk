// The vocabulary this task's own translation reads and produces
// (task/http-observation-runtime/descriptor-placeholder-resolver): pure
// values with no behavior, the same role connector-configuration.ts already
// plays for the registry's own vocabulary.
//
// No specification node describes a connector's own call configuration as a
// structure with address/query/headers/body fields — domain/integration/
// capability's own "connector" attribute is a deliberately opaque string
// (decision-log: "an opaque string keeps vendors out of the model"), and
// domain/investigation/subject states that a connector "resolves internally
// ... which of the attributes it needs and how to derive its call from
// them." So this shape is this task's own free technical design over what a
// connector's own opaque configuration payload
// (connector-registry/connector-configuration.ts's own
// `ConnectorConfiguration.configuration: Readonly<Record<string, unknown>>`)
// may declare when it is meant for this resolver — never a second, competing
// persisted schema: the registry still stores and returns that payload
// exactly as opaque data, unaware of this shape, and nothing here reads from
// or writes to the registry at all.

/**
 * What this resolver expects a connector's own opaque call configuration to
 * declare, once narrowed: an address, and the optional query, headers and
 * body an outbound call may also carry — each a template that may embed one
 * or more '${...}' placeholders anywhere inside a string value, resolved by
 * connector-request-resolver.ts's own substitution mechanism rather than by
 * evaluating the configuration as code. `query` and `headers` are flat
 * string-to-string maps; `body` is left as `unknown` since a request body
 * may nest arbitrarily (object, array, or scalar), the same way the
 * registry itself leaves the whole configuration payload unshaped.
 */
export type ConnectorCallDescriptor = {
  readonly address: string;
  readonly query?: Readonly<Record<string, string>>;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: unknown;
};

/**
 * The concrete outbound HTTP request one resolution produces: every
 * placeholder in the descriptor's address, query, headers and body already
 * substituted with a Subject-drawn value, the collection's own requester
 * identity, or a credential read from an environment variable — never a
 * placeholder token left unresolved. `query` and `headers` are always
 * present, defaulting to the empty object where the descriptor declared
 * none; `body` stays absent where the descriptor declared none, since an
 * outbound call need not carry one.
 */
export type AssembledConnectorRequest = {
  readonly address: string;
  readonly query: Readonly<Record<string, string>>;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: unknown;
};

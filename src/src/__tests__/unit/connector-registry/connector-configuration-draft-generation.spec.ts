import { expect, expectTypeOf, it } from 'vitest';
import {
  generateConnectorConfigurationDraft,
  type GenerateConnectorConfigurationDraftOptions,
} from '../../../connector-registry/connector-configuration-draft-generation.js';
import { ConnectorConfigurationRegistryService } from '../../../connector-registry/connector-configuration-registry.service.js';
import type { IConnectorConfigurationStore } from '../../../connector-registry/connector-configuration-store.port.js';
import type { ConnectorConfiguration } from '../../../connector-registry/connector-configuration.js';
import type { RegisteredCapabilityForPlaceholderCheck } from '../../../connector-registry/capabilities-reader.port.js';
import type { RegisteredConnectorConfigurationReader } from '../../../connector-registry/registered-method-comparison.js';
import { OpenApiDocumentNotFetchedError } from '../../../errors/openapi-document-not-fetched.error.js';
import { OpenApiDocumentNotReadableError } from '../../../errors/openapi-document-not-readable.error.js';
import { OpenApiOperationNotFoundError } from '../../../errors/openapi-operation-not-found.error.js';

class SpyConnectorConfigurationStore implements IConnectorConfigurationStore {
  public writeCallCount = 0;

  public constructor(private records: readonly ConnectorConfiguration[] = []) {}

  public async readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]> {
    return this.records;
  }

  public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void> {
    this.writeCallCount += 1;
    this.records = configurations;
  }

  public async deleteConnectorConfiguration(connector: string): Promise<void> {
    this.records = this.records.filter((record) => record.connector !== connector);
  }
}

function fetcherFor(document: unknown): { fetchOpenApiDocument: (link: string) => Promise<string> } {
  return { fetchOpenApiDocument: async () => JSON.stringify(document) };
}

function capabilityGranting(names: readonly string[]): RegisteredCapabilityForPlaceholderCheck {
  const properties = Object.fromEntries(names.map((name) => [name, {}]));
  return { connector: 'erp-http', input_schema: JSON.stringify({ properties }) };
}

function unregisteredConnector(connector: string): RegisteredConnectorConfigurationReader {
  return { readConnectorConfiguration: async () => ({ held: false, connector }) };
}

function options(
  overrides: Partial<GenerateConnectorConfigurationDraftOptions> = {},
): GenerateConnectorConfigurationDraftOptions {
  return {
    connector: 'erp-http',
    link: 'https://docs.example.test/openapi.json',
    path: '/widgets',
    method: 'GET',
    documentFetcher: fetcherFor({ openapi: '3.0.0', paths: { '/widgets': { get: {} } } }),
    capabilitiesReader: { readCapabilities: async () => [] },
    registry: unregisteredConnector('erp-http'),
    ...overrides,
  };
}

function configurationOf(draft: { readonly configuration: string }): Readonly<Record<string, unknown>> {
  return JSON.parse(draft.configuration) as Readonly<Record<string, unknown>>;
}

function positionsOptions(): GenerateConnectorConfigurationDraftOptions {
  return options({
    path: '/orders/{order_id}',
    method: 'post',
    documentFetcher: fetcherFor({
      openapi: '3.0.0',
      paths: {
        '/orders/{order_id}': {
          parameters: [{ name: 'order_id', in: 'path' }],
          post: {
            parameters: [
              { name: 'limit', in: 'query' },
              { name: 'contract_number', in: 'header' },
              { name: 'session_id', in: 'cookie' },
            ],
            requestBody: {
              content: { 'application/json': { schema: { properties: { billing_address: { type: 'string' } } } } },
            },
          },
        },
      },
    }),
    capabilitiesReader: {
      readCapabilities: async () => [
        capabilityGranting(['order_id', 'limit', 'contract_number', 'session_id', 'billing_address']),
      ],
    },
  });
}

it('produces a configuration text that parses as a well-formed JSON object', async () => {
  const draft = await generateConnectorConfigurationDraft(options());

  const parsed: unknown = JSON.parse(draft.configuration);

  expect(typeof parsed).toBe('object');
  expect(parsed).not.toBeNull();
  expect(Array.isArray(parsed)).toBe(false);
});

it("upper-cases the operation's own method however the caller requested it", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      method: 'PoSt',
      documentFetcher: fetcherFor({ openapi: '3.0.0', paths: { '/widgets': { post: {} } } }),
    }),
  );

  expect(configurationOf(draft)).toMatchObject({ method: 'POST' });
});

it("composes the address from the operation's own first server entry over the path item's and the document's, trimming a trailing slash", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        servers: [{ url: 'https://doc.example.test' }],
        paths: {
          '/widgets': {
            servers: [{ url: 'https://path.example.test' }],
            get: { servers: [{ url: 'https://op.example.test/' }] },
          },
        },
      }),
    }),
  );

  expect(configurationOf(draft).address).toBe('https://op.example.test/widgets');
});

it("falls back to the path item's own first server entry when the operation declares none", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        servers: [{ url: 'https://doc.example.test' }],
        paths: { '/widgets': { servers: [{ url: 'https://path.example.test/' }], get: {} } },
      }),
    }),
  );

  expect(configurationOf(draft).address).toBe('https://path.example.test/widgets');
});

it("falls back to the document's own top-level first server entry when neither the operation nor the path item declares one", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        servers: [{ url: 'https://doc.example.test/' }],
        paths: { '/widgets': { get: {} } },
      }),
    }),
  );

  expect(configurationOf(draft).address).toBe('https://doc.example.test/widgets');
});

it('composes the address from the path alone when no servers array is in effect anywhere', async () => {
  const draft = await generateConnectorConfigurationDraft(options());

  expect(configurationOf(draft).address).toBe('/widgets');
});

it('uses only the first entry of the servers array in effect when it lists more than one', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: {
          '/widgets': {
            get: { servers: [{ url: 'https://first.example.test' }, { url: 'https://second.example.test' }] },
          },
        },
      }),
    }),
  );

  expect(configurationOf(draft).address).toBe('https://first.example.test/widgets');
});

it("treats the operation's own explicitly empty servers array as in effect, composing the path alone rather than falling back to the path item's own servers", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { servers: [{ url: 'https://path.example.test' }], get: { servers: [] } } },
      }),
    }),
  );

  expect(configurationOf(draft).address).toBe('/widgets');
});

it('treats a servers entry declaring no url as absent, using the next entry that declares one', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: {
          '/widgets': { get: { servers: [{ description: 'no url here' }, { url: 'https://real.example.test' }] } },
        },
      }),
    }),
  );

  expect(configurationOf(draft).address).toBe('https://real.example.test/widgets');
});

it('embeds a resolved path parameter inside the drafted address at its own position', async () => {
  const draft = await generateConnectorConfigurationDraft(positionsOptions());

  expect(configurationOf(draft).address).toBe('/orders/${subject:order_id}');
});

it("places a resolved query parameter at its own query key", async () => {
  const draft = await generateConnectorConfigurationDraft(positionsOptions());

  expect(configurationOf(draft).query).toEqual({ limit: '${subject:limit}' });
});

it("places a resolved header parameter at its own header key", async () => {
  const draft = await generateConnectorConfigurationDraft(positionsOptions());

  const headers = configurationOf(draft).headers as Record<string, string>;
  expect(headers.contract_number).toBe('${subject:contract_number}');
});

it('places a resolved cookie parameter inside the joined Cookie header value', async () => {
  const draft = await generateConnectorConfigurationDraft(positionsOptions());

  const headers = configurationOf(draft).headers as Record<string, string>;
  expect(headers.Cookie).toBe('session_id=${subject:session_id}');
});

it("places a resolved request-body field at its own top-level body key", async () => {
  const draft = await generateConnectorConfigurationDraft(positionsOptions());

  expect(configurationOf(draft).body).toEqual({ billing_address: '${subject:billing_address}' });
});

it("always states a statusMap key drafted from the operation's declared responses -- empty when it declares none -- always states a responseMap key too, empty when no success response schema field is read, and pairs an empty status_readings list with that empty statusMap", async () => {
  const draft = await generateConnectorConfigurationDraft(positionsOptions());

  const configuration = configurationOf(draft);
  expect(configuration.responseMap).toEqual({});
  expect(configuration.statusMap).toEqual({});
  expect(draft.status_readings).toEqual([]);
});

function responsesOptions(responses: Record<string, unknown>): GenerateConnectorConfigurationDraftOptions {
  return options({
    documentFetcher: fetcherFor({ openapi: '3.0.0', paths: { '/widgets': { get: { responses } } } }),
  });
}

it('drafts the ok ending for a status at each end of the 200-through-299 range', async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ '200': {}, '299': {} }));

  expect(configurationOf(draft).statusMap).toEqual({ '200': 'ok', '299': 'ok' });
});

it('drafts the denied ending for exactly the statuses 401, 403 and 407', async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ '401': {}, '403': {}, '407': {} }));

  expect(configurationOf(draft).statusMap).toEqual({ '401': 'denied', '403': 'denied', '407': 'denied' });
});

it('drafts the unavailable ending for a status immediately outside each end of the 200-through-299 range', async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ '199': {}, '300': {} }));

  expect(configurationOf(draft).statusMap).toEqual({ '199': 'unavailable', '300': 'unavailable' });
});

it('drafts the unavailable ending, never timeout, for the statuses HTTP itself names as a timeout', async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ '408': {}, '504': {} }));

  expect(configurationOf(draft).statusMap).toEqual({ '408': 'unavailable', '504': 'unavailable' });
});

it('produces no statusMap entry and no status reading for a default-keyed or a range-keyed response', async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ default: {}, '5XX': {} }));

  expect(configurationOf(draft).statusMap).toEqual({});
  expect(draft.status_readings).toEqual([]);
});

it("carries exactly one status reading per drafted statusMap entry, each holding that entry's own status and ending", async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ '210': {}, '407': {}, '450': {} }));

  expect(configurationOf(draft).statusMap).toEqual({ '210': 'ok', '407': 'denied', '450': 'unavailable' });
  expect(draft.status_readings).toEqual([
    { status: '210', ending: 'ok' },
    { status: '407', ending: 'denied' },
    { status: '450', ending: 'unavailable' },
  ]);
});

it("carries the document's own description as declared_as on a status reading, and omits declared_as entirely where the document declares no description", async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({ '201': { description: 'Widget created' }, '404': {} }),
  );

  expect(draft.status_readings).toEqual([
    { status: '201', ending: 'ok', declared_as: 'Widget created' },
    { status: '404', ending: 'unavailable' },
  ]);
  expect('declared_as' in draft.status_readings[1]).toBe(false);
});

it("keys each drafted responseMap entry by the field's own name and values it with the path the reading gave it, through an envelope", async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: {
          'application/json': {
            schema: { properties: { payload: { type: 'object', properties: { order_id: {}, order_status: {} } } } },
          },
        },
      },
    }),
  );

  expect(configurationOf(draft).responseMap).toEqual({
    order_id: 'payload.order_id',
    order_status: 'payload.order_status',
  });
});

it('states an empty responseMap object -- never an absent key -- and no response fields, for a success response from which no field is read', async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ '204': {} }));

  expect(configurationOf(draft).responseMap).toEqual({});
  expect(draft.response_fields).toEqual([]);
});

it('drafts the path read from the lowest success status when a field name repeats under differing paths', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': { content: { 'application/json': { schema: { properties: { id: {}, extra: {} } } } } },
      '201': {
        content: {
          'application/json': { schema: { properties: { wrapper: { type: 'object', properties: { id: {} } } } } },
        },
      },
    }),
  );

  expect(configurationOf(draft).responseMap).toEqual({ id: 'id', extra: 'extra' });
});

it('drafts one responseMap entry for a field name read under the same path from more than one success response schema', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: { 'application/json': { schema: { properties: { id: { type: 'string' } }, required: ['id'] } } },
      },
      '201': { content: { 'application/json': { schema: { properties: { id: { type: 'integer' } } } } } },
    }),
  );

  expect(configurationOf(draft).responseMap).toEqual({ id: 'id' });
});

it("discloses the lowest success status's own account for a field whose path already agrees across success response schemas", async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: { 'application/json': { schema: { properties: { id: { type: 'string' } }, required: ['id'] } } },
      },
      '201': { content: { 'application/json': { schema: { properties: { id: { type: 'integer' } } } } } },
    }),
  );

  expect(draft.response_fields).toEqual([
    { name: 'id', path: 'id', status: '200', declared_type: 'string', declared_required: true },
  ]);
});

it("carries exactly one response field per drafted responseMap entry, holding that entry's own name, path and success status", async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': { content: { 'application/json': { schema: { properties: { alpha: {} } } } } },
      '201': { content: { 'application/json': { schema: { properties: { beta: {} } } } } },
    }),
  );

  const byName = new Map(draft.response_fields.map((field) => [field.name, field]));
  expect(byName).toEqual(
    new Map([
      ['alpha', { name: 'alpha', path: 'alpha', status: '200' }],
      ['beta', { name: 'beta', path: 'beta', status: '201' }],
    ]),
  );
  expect(draft.response_fields).toHaveLength(2);
  expect(Object.keys(configurationOf(draft).responseMap as Record<string, string>)).toHaveLength(2);
});

it('carries the declared type and the declared required listing on a response field when the schema declares both', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: { 'application/json': { schema: { properties: { qty: { type: 'integer' } }, required: ['qty'] } } },
      },
    }),
  );

  expect(draft.response_fields).toEqual([
    { name: 'qty', path: 'qty', status: '200', declared_type: 'integer', declared_required: true },
  ]);
});

it('carries neither declared_type nor declared_required on a response field when the schema declares neither', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({ '200': { content: { 'application/json': { schema: { properties: { qty: {} } } } } } }),
  );

  const [field] = draft.response_fields;
  expect(field).toEqual({ name: 'qty', path: 'qty', status: '200' });
  expect('declared_type' in field).toBe(false);
  expect('declared_required' in field).toBe(false);
});

it('carries declared_required as false, rather than omitting it, for a field a declared required listing exists but does not name', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: {
          'application/json': {
            schema: { properties: { qty: { type: 'string' }, other: { type: 'string' } }, required: ['other'] },
          },
        },
      },
    }),
  );

  const field = draft.response_fields.find((entry) => entry.name === 'qty');
  expect(field).toEqual({ name: 'qty', path: 'qty', status: '200', declared_type: 'string', declared_required: false });
});

it('carries the envelope name on a response field read through a single-property envelope', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: {
          'application/json': { schema: { properties: { data: { type: 'object', properties: { token: {} } } } } },
        },
      },
    }),
  );

  expect(draft.response_fields).toEqual([{ name: 'token', path: 'data.token', status: '200', envelope: 'data' }]);
});

it("keeps a drafted responseMap key as the field's own name, never a name a registered capability's schema declares instead", async () => {
  const draft = await generateConnectorConfigurationDraft({
    ...responsesOptions({ '200': { content: { 'application/json': { schema: { properties: { id: {} } } } } } }),
    capabilitiesReader: { readCapabilities: async () => [capabilityGranting(['identifier'])] },
  });

  expect(configurationOf(draft).responseMap).toEqual({ id: 'id' });
});

it('carries, whole, the response field shape the specification declares -- required name/path/status always present, and declared_type, declared_required and envelope present only where the schema declares them', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: {
          'application/json': {
            schema: {
              properties: { data: { type: 'object', properties: { rich: { type: 'string' } }, required: ['rich'] } },
            },
          },
        },
      },
      '201': { content: { 'application/json': { schema: { properties: { minimal: {} } } } } },
    }),
  );

  const byName = new Map(draft.response_fields.map((field) => [field.name, field]));
  expect(byName).toEqual(
    new Map([
      [
        'rich',
        { name: 'rich', path: 'data.rich', status: '200', declared_type: 'string', declared_required: true, envelope: 'data' },
      ],
      ['minimal', { name: 'minimal', path: 'minimal', status: '201' }],
    ]),
  );
});

it('omits the query, headers and body keys entirely when the operation declares no parameter or request-body field for any of them', async () => {
  const draft = await generateConnectorConfigurationDraft(options());

  const configuration = configurationOf(draft);
  expect('query' in configuration).toBe(false);
  expect('headers' in configuration).toBe(false);
  expect('body' in configuration).toBe(false);
});

it('leaves an unresolved parameter at its own position holding its own name in brace form', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { parameters: [{ name: 'limit', in: 'query' }] } } },
      }),
    }),
  );

  expect(configurationOf(draft).query).toEqual({ limit: '{limit}' });
});

function unresolvedMixOptions(): GenerateConnectorConfigurationDraftOptions {
  return options({
    documentFetcher: fetcherFor({
      openapi: '3.0.0',
      paths: {
        '/widgets': {
          get: {
            parameters: [
              { name: 'resolved_param', in: 'query' },
              { name: 'unresolved_param', in: 'header' },
            ],
            requestBody: {
              content: { 'application/json': { schema: { properties: { unresolved_field: { type: 'string' } } } } },
            },
            security: [{ NotReducible: [] }],
          },
        },
      },
      components: { securitySchemes: { NotReducible: { type: 'oauth2', flows: {} } } },
    }),
    capabilitiesReader: { readCapabilities: async () => [capabilityGranting(['resolved_param'])] },
  });
}

it('resolves every parameter and request-body field name to a placeholder once a capability is registered for the connector, whatever its own input schema names, while a security scheme that cannot reduce to a credential still lists unresolved', async () => {
  const draft = await generateConnectorConfigurationDraft(unresolvedMixOptions());

  const configuration = configurationOf(draft);
  expect(configuration.query).toEqual({ resolved_param: '${subject:resolved_param}' });
  const headers = configuration.headers as Record<string, string>;
  expect(headers.unresolved_param).toBe('${subject:unresolved_param}');
  expect(configuration.body).toEqual({ unresolved_field: '${subject:unresolved_field}' });

  const byName = new Map(draft.unresolved.map((item) => [item.name, item.reason]));
  expect(byName).toEqual(new Map([['NotReducible', 'security-scheme-not-reducible-to-a-credential']]));
  expect(draft.unresolved).toHaveLength(1);
});

it('embeds a header-located security-scheme credential at the header key the scheme declares', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { security: [{ ApiKeyAuth: [] }] } } },
        components: { securitySchemes: { ApiKeyAuth: { type: 'apiKey', name: 'X-Api-Key', in: 'header' } } },
      }),
    }),
  );

  const headers = configurationOf(draft).headers as Record<string, string>;
  expect(headers['X-Api-Key']).toBe('${credential:ERP_HTTP_APIKEYAUTH}');
});

it('embeds a query-located security-scheme credential at the query key the scheme declares', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { security: [{ ApiKeyAuth: [] }] } } },
        components: { securitySchemes: { ApiKeyAuth: { type: 'apiKey', name: 'api_key', in: 'query' } } },
      }),
    }),
  );

  expect(configurationOf(draft).query).toEqual({ api_key: '${credential:ERP_HTTP_APIKEYAUTH}' });
});

it('embeds a cookie-located security-scheme credential inside the Cookie header value even when no cookie parameter is declared', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { security: [{ ApiKeyAuth: [] }] } } },
        components: { securitySchemes: { ApiKeyAuth: { type: 'apiKey', name: 'session_id', in: 'cookie' } } },
      }),
    }),
  );

  const headers = configurationOf(draft).headers as Record<string, string>;
  expect(headers.Cookie).toBe('session_id=${credential:ERP_HTTP_APIKEYAUTH}');
});

it("holds every generated credential paired with its own security scheme's name, unmodified from the credential generation", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { security: [{ HeaderAuth: [], QueryAuth: [] }] } } },
        components: {
          securitySchemes: {
            HeaderAuth: { type: 'apiKey', name: 'X-Header-Key', in: 'header' },
            QueryAuth: { type: 'apiKey', name: 'api_key', in: 'query' },
          },
        },
      }),
    }),
  );

  expect(draft.generated_credentials).toEqual([
    { name: 'ERP_HTTP_HEADERAUTH', security_scheme: 'HeaderAuth' },
    { name: 'ERP_HTTP_QUERYAUTH', security_scheme: 'QueryAuth' },
  ]);
});

it("states a method_mismatch exactly as the method-comparison task computed it, when the operation's method differs from what is registered", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      method: 'post',
      documentFetcher: fetcherFor({ openapi: '3.0.0', paths: { '/widgets': { post: {} } } }),
      registry: {
        readConnectorConfiguration: async () => ({
          held: true,
          configuration: { connector: 'erp-http', configuration: JSON.stringify({ method: 'GET' }) },
        }),
      },
    }),
  );

  expect(draft.method_mismatch).toEqual({ registered: 'GET', operation: 'POST' });
});

it('states no method_mismatch field at all when nothing is registered for the connector', async () => {
  const draft = await generateConnectorConfigurationDraft(options());

  expect('method_mismatch' in draft).toBe(false);
});

it('names the connector it was generated for, exactly as passed in', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({ connector: 'a-different-connector', registry: unregisteredConnector('a-different-connector') }),
  );

  expect(draft.connector).toBe('a-different-connector');
});

it('generates and returns a draft, rather than refusing, when every parameter resolves to nothing and no security scheme reduces to a credential', async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: {
          '/widgets': { get: { parameters: [{ name: 'limit', in: 'query' }], security: [{ OAuthFlow: [] }] } },
        },
        components: { securitySchemes: { OAuthFlow: { type: 'oauth2', flows: {} } } },
      }),
    }),
  );

  const byName = new Map(draft.unresolved.map((item) => [item.name, item.reason]));
  expect(byName).toEqual(
    new Map([
      ['limit', 'no-capability-registered'],
      ['OAuthFlow', 'security-scheme-not-reducible-to-a-credential'],
    ]),
  );
  expect(draft.generated_credentials).toEqual([]);
});

it('leaves every connector configuration registered before a draft is generated byte-identical after it, issuing no register-connector call', async () => {
  const store = new SpyConnectorConfigurationStore();
  const registry = new ConnectorConfigurationRegistryService(store);
  await registry.registerConnector({ connector: 'erp-http', configuration: JSON.stringify({ method: 'GET' }) });
  const writeCallsBeforeDraft = store.writeCallCount;

  await generateConnectorConfigurationDraft(options({ registry }));

  expect(store.writeCallCount).toBe(writeCallsBeforeDraft);
  const stillRegistered = await registry.readConnectorConfiguration('erp-http');
  expect(stillRegistered).toEqual({
    held: true,
    configuration: { connector: 'erp-http', configuration: JSON.stringify({ method: 'GET' }) },
  });
});

it('creates no connector configuration record under any name -- registered or not -- merely by generating a draft', async () => {
  const store = new SpyConnectorConfigurationStore();
  const registry = new ConnectorConfigurationRegistryService(store);

  await generateConnectorConfigurationDraft(options({ connector: 'never-registered', registry }));

  const held = await store.readConnectorConfigurations();
  expect(held).toEqual([]);
  expect(store.writeCallCount).toBe(0);
});

it('propagates the fetch failure rather than generating a draft when the document link cannot be fetched', async () => {
  const failure = new OpenApiDocumentNotFetchedError('https://docs.example.test/openapi.json', {
    kind: 'network-failure',
  });

  const outcome = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: {
        fetchOpenApiDocument: async () => {
          throw failure;
        },
      },
    }),
  ).catch((error: unknown) => error);

  expect(outcome).toBe(failure);
});

it('propagates the document-reading failure rather than generating a draft when the fetched text does not parse as a well-formed OpenAPI 3.x document', async () => {
  const outcome = await generateConnectorConfigurationDraft(
    options({ documentFetcher: { fetchOpenApiDocument: async () => 'not a document at all' } }),
  ).catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(OpenApiDocumentNotReadableError);
});

it('propagates the operation-not-found failure rather than generating a draft when the document declares no operation at the requested path and method', async () => {
  const outcome = await generateConnectorConfigurationDraft(
    options({ path: '/absent', documentFetcher: fetcherFor({ openapi: '3.0.0', paths: {} }) }),
  ).catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(OpenApiOperationNotFoundError);
});

it("embeds a parameter reached only through the operation-reading task's own $ref resolution", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { parameters: [{ $ref: '#/components/parameters/ApiVersion' }] } } },
        components: { parameters: { ApiVersion: { name: 'X-Api-Version', in: 'header' } } },
      }),
      capabilitiesReader: { readCapabilities: async () => [capabilityGranting(['X-Api-Version'])] },
    }),
  );

  const headers = configurationOf(draft).headers as Record<string, string>;
  expect(headers['X-Api-Version']).toBe('${subject:X-Api-Version}');
});

function collisionOptions(): GenerateConnectorConfigurationDraftOptions {
  return options({
    documentFetcher: fetcherFor({
      openapi: '3.0.0',
      paths: {
        '/widgets': {
          get: {
            parameters: [
              { name: 'api_key', in: 'query' },
              { name: 'X-Tenant', in: 'header' },
            ],
            security: [{ ApiKeyScheme: [], TenantScheme: [] }],
          },
        },
      },
      components: {
        securitySchemes: {
          ApiKeyScheme: { type: 'apiKey', name: 'api_key', in: 'query' },
          TenantScheme: { type: 'apiKey', name: 'X-Tenant', in: 'header' },
        },
      },
    }),
    capabilitiesReader: { readCapabilities: async () => [capabilityGranting(['api_key'])] },
  });
}

it('resolves a security-scheme/parameter key collision by replacing whatever the subject resolution produced for that name -- a successful placeholder or an unresolved entry for a different reason -- with the drafted-key-occupied reason, never duplicating either entry', async () => {
  const draft = await generateConnectorConfigurationDraft(collisionOptions());

  const configuration = configurationOf(draft);
  expect(configuration.query).toEqual({ api_key: '${credential:ERP_HTTP_APIKEYSCHEME}' });
  const headers = configuration.headers as Record<string, string>;
  expect(headers['X-Tenant']).toBe('${credential:ERP_HTTP_TENANTSCHEME}');
  const byName = new Map(draft.unresolved.map((item) => [item.name, item.reason]));
  expect(byName).toEqual(
    new Map([
      ['api_key', 'drafted-key-occupied-by-another-security-scheme'],
      ['X-Tenant', 'drafted-key-occupied-by-another-security-scheme'],
    ]),
  );
  expect(draft.unresolved).toHaveLength(2);
});

it("rebuilds the joined Cookie header from the subject resolution's own segments, dropping only a displaced parameter's own segment and appending the credential's own segment", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: {
          '/widgets': {
            get: {
              parameters: [
                { name: 'session_id', in: 'cookie' },
                { name: 'tenant_id', in: 'cookie' },
              ],
              security: [{ TenantAuth: [] }],
            },
          },
        },
        components: { securitySchemes: { TenantAuth: { type: 'apiKey', name: 'tenant_id', in: 'cookie' } } },
      }),
      capabilitiesReader: { readCapabilities: async () => [capabilityGranting(['session_id', 'tenant_id'])] },
    }),
  );

  const headers = configurationOf(draft).headers as Record<string, string>;
  expect(headers.Cookie).toBe('session_id=${subject:session_id}; tenant_id=${credential:ERP_HTTP_TENANTAUTH}');
});

it('exports generateConnectorConfigurationDraft as a plain function taking one options object, not a class', () => {
  expect(typeof generateConnectorConfigurationDraft).toBe('function');
  expectTypeOf(generateConnectorConfigurationDraft).parameters.toEqualTypeOf<
    [GenerateConnectorConfigurationDraftOptions]
  >();
});

it('propagates a failure the injected capabilities reader raises, rather than swallowing it', async () => {
  const outcome = await generateConnectorConfigurationDraft(
    options({
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { parameters: [{ name: 'limit', in: 'query' }] } } },
      }),
      capabilitiesReader: {
        readCapabilities: async () => {
          throw new Error('the capability store is unavailable');
        },
      },
    }),
  ).catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect((outcome as Error).message).toBe('the capability store is unavailable');
});

it('propagates a failure the injected registry raises, rather than swallowing it', async () => {
  const outcome = await generateConnectorConfigurationDraft(
    options({
      registry: {
        readConnectorConfiguration: async () => {
          throw new Error('the registry is unavailable');
        },
      },
    }),
  ).catch((error: unknown) => error);

  expect(outcome).toBeInstanceOf(Error);
  expect((outcome as Error).message).toBe('the registry is unavailable');
});

it('drafts a default-response-not-drafted note naming the default key, alongside a valid success schema', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      default: {},
      '200': { content: { 'application/json': { schema: { properties: { id: {} } } } } },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'default-response-not-drafted', subject: 'default' }]);
});

it('drafts one status-range-not-drafted note per range key declared', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '4XX': {},
      '5XX': {},
      '200': { content: { 'application/json': { schema: { properties: { id: {} } } } } },
    }),
  );

  expect(draft.reading_notes).toEqual([
    { kind: 'status-range-not-drafted', subject: '4XX' },
    { kind: 'status-range-not-drafted', subject: '5XX' },
  ]);
});

it('reads a lower-case range key spelling as exhibiting status-range-not-drafted exactly as the upper-case wildcard would', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '2xx': {},
      '200': { content: { 'application/json': { schema: { properties: { id: {} } } } } },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'status-range-not-drafted', subject: '2xx' }]);
});

it('reads a purely numeric key outside the 100-through-599 status bound as exhibiting status-range-not-drafted', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '600': {},
      '200': { content: { 'application/json': { schema: { properties: { id: {} } } } } },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'status-range-not-drafted', subject: '600' }]);
});

it("names the response's own key as the subject of non-json-success-content-not-read, never its description or its media type", async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': { description: 'Widget list', content: { 'text/plain': {} } },
      '201': { content: { 'application/json': { schema: { properties: { ok: {} } } } } },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'non-json-success-content-not-read', subject: '200' }]);
});

it("names the response's own key as the subject of variants-united, never its description", async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': { content: { 'application/json': { schema: { properties: { ok: {} } } } } },
      '201': {
        description: 'Union response',
        content: {
          'application/json': { schema: { oneOf: [{ properties: { a: {} } }, { properties: { b: {} } }] } },
        },
      },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'variants-united', subject: '201' }]);
});

it('names the envelope property as the subject of envelope-read-through', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: {
          'application/json': { schema: { properties: { payload: { type: 'object', properties: { id: {} } } } } },
        },
      },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'envelope-read-through', subject: 'payload' }]);
});

it('carries exactly one envelope-read-through note when two success response schemas are read through an envelope property of the same name', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: {
          'application/json': { schema: { properties: { payload: { type: 'object', properties: { id: {} } } } } },
        },
      },
      '201': {
        content: {
          'application/json': { schema: { properties: { payload: { type: 'object', properties: { other: {} } } } } },
        },
      },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'envelope-read-through', subject: 'payload' }]);
});

it("names the response's own key as the subject of success-schema-declares-no-properties, at the top level, never leaving it absent", async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': { content: { 'application/json': { schema: { properties: { id: {} } } } } },
      '204': { description: 'No content', content: { 'application/json': { schema: { properties: {} } } } },
    }),
  );

  expect(draft.reading_notes).toEqual([{ kind: 'success-schema-declares-no-properties', subject: '204' }]);
});

it('drafts success-schema-declares-no-properties at the envelope inner level too, alongside the envelope-read-through note for that same response', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': {
        content: {
          'application/json': { schema: { properties: { payload: { type: 'object', properties: {} } } } },
        },
      },
    }),
  );

  expect(draft.reading_notes).toEqual([
    { kind: 'envelope-read-through', subject: 'payload' },
    { kind: 'success-schema-declares-no-properties', subject: '200' },
  ]);
});

it("names the operation's own method upper-cased followed by its path as the subject of no-responses-declared, never the connector's name, an operationId or a lower-cased method", async () => {
  const draft = await generateConnectorConfigurationDraft(
    options({
      method: 'get',
      documentFetcher: fetcherFor({
        openapi: '3.0.0',
        paths: { '/widgets': { get: { operationId: 'listWidgets' } } },
      }),
    }),
  );

  expect(draft.reading_notes).toHaveLength(1);
  const [note] = draft.reading_notes;
  expect(note.kind).toBe('no-responses-declared');
  expect(note.subject.startsWith('GET')).toBe(true);
  expect(note.subject.endsWith('/widgets')).toBe(true);
  expect(note.subject).not.toContain('erp-http');
  expect(note.subject).not.toContain('listWidgets');
  expect(note.subject).not.toContain('get /widgets');
});

it('drafts a no-success-response-schema note naming the operation itself when the responses declare no success response schema under application/json', async () => {
  const draft = await generateConnectorConfigurationDraft(responsesOptions({ '404': {} }));

  expect(draft.reading_notes).toHaveLength(1);
  const [note] = draft.reading_notes;
  expect(note.kind).toBe('no-success-response-schema');
  expect(note.subject.startsWith('GET')).toBe(true);
  expect(note.subject.endsWith('/widgets')).toBe(true);
});

it('names every not-drafted path for a repeated field name, each beside the ascending success status it was read from, none of them left out', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': { content: { 'application/json': { schema: { properties: { id: {} } } } } },
      '201': {
        content: {
          'application/json': { schema: { properties: { wrapA: { type: 'object', properties: { id: {} } } } } },
        },
      },
      '202': {
        content: {
          'application/json': { schema: { properties: { wrapB: { type: 'object', properties: { id: {} } } } } },
        },
      },
    }),
  );

  const repeatedNotes = draft.reading_notes.filter((note) => note.kind === 'repeated-field-name-path-not-taken');
  expect(repeatedNotes).toHaveLength(1);
  const [note] = repeatedNotes;
  expect(note.subject).toBe('id');
  const detail = note.detail ?? '';
  expect(detail).toContain('wrapA.id');
  expect(detail).toContain('wrapB.id');
  expect(detail.indexOf('wrapA.id')).toBeLessThan(detail.indexOf('wrapB.id'));
});

it('carries an empty reading-notes list for an operation exhibiting none of these conditions', async () => {
  const draft = await generateConnectorConfigurationDraft(
    responsesOptions({
      '200': { content: { 'application/json': { schema: { properties: { id: {}, name: {} } } } } },
    }),
  );

  expect(draft.reading_notes).toEqual([]);
});

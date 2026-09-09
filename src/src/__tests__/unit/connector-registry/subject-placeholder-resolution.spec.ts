import { expect, it } from 'vitest';
import type { RegisteredCapabilityForPlaceholderCheck } from '../../../connector-registry/capabilities-reader.port.js';
import {
  resolveSubjectPlaceholders,
  type ResolveSubjectPlaceholdersOptions,
} from '../../../connector-registry/subject-placeholder-resolution.js';

function capability(
  overrides: Partial<RegisteredCapabilityForPlaceholderCheck> = {},
): RegisteredCapabilityForPlaceholderCheck {
  return { connector: 'erp-http', input_schema: JSON.stringify({ properties: {} }), ...overrides };
}

function options(overrides: Partial<ResolveSubjectPlaceholdersOptions> = {}): ResolveSubjectPlaceholdersOptions {
  return {
    connector: 'erp-http',
    path: '/orders',
    parameters: [],
    requestBodyFieldNames: [],
    capabilitiesReader: { readCapabilities: async () => [] },
    ...overrides,
  };
}

it('names every parameter and request-body field name unresolved with no-capability-registered when no capability is registered at all', async () => {
  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [
        { name: 'order_id', location: 'query' },
        { name: 'contract_number', location: 'header' },
      ],
      requestBodyFieldNames: ['billing_address'],
      capabilitiesReader: { readCapabilities: async () => [] },
    }),
  );

  const byName = new Map(placement.unresolved.map((item) => [item.name, item.reason]));
  expect(byName).toEqual(
    new Map([
      ['order_id', 'no-capability-registered'],
      ['contract_number', 'no-capability-registered'],
      ['billing_address', 'no-capability-registered'],
    ]),
  );
});

it('names every name unresolved with no-capability-registered when only a capability naming a different connector is registered', async () => {
  const otherConnectorCapability = capability({
    connector: 'a-different-connector',
    input_schema: JSON.stringify({ properties: { order_id: {} } }),
  });

  const placement = await resolveSubjectPlaceholders(
    options({
      connector: 'erp-http',
      parameters: [{ name: 'order_id', location: 'query' }],
      capabilitiesReader: { readCapabilities: async () => [otherConnectorCapability] },
    }),
  );

  expect(placement.unresolved).toEqual([{ name: 'order_id', reason: 'no-capability-registered' }]);
});

it('generates no ${subject:...} placeholder text anywhere in the placement when no capability is registered', async () => {
  const placement = await resolveSubjectPlaceholders(
    options({
      path: '/orders/{order_id}',
      parameters: [
        { name: 'order_id', location: 'path' },
        { name: 'contract_number', location: 'query' },
        { name: 'session_id', location: 'cookie' },
      ],
      requestBodyFieldNames: ['billing_address'],
      capabilitiesReader: { readCapabilities: async () => [] },
    }),
  );

  const everyValue = [
    placement.path,
    ...Object.values(placement.query),
    ...Object.values(placement.headers),
    ...Object.values(placement.body),
  ];
  expect(everyValue.some((value) => value.includes('${subject:'))).toBe(false);
});

it("places \${subject:<name>} at a path parameter's own position inside the substituted path", async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { order_id: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      path: '/orders/{order_id}/detail',
      parameters: [{ name: 'order_id', location: 'path' }],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.path).toBe('/orders/${subject:order_id}/detail');
});

it("places \${subject:<name>} as a query parameter's own key value", async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { order_id: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [{ name: 'order_id', location: 'query' }],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.query).toEqual({ order_id: '${subject:order_id}' });
});

it("places \${subject:<name>} as a headers key value, with no Cookie key when no cookie parameter is present", async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [{ name: 'contract_number', location: 'header' }],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.headers).toEqual({ contract_number: '${subject:contract_number}' });
});

it("places \${subject:<name>} inside the Cookie header's own value for a single cookie parameter", async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { session_id: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [{ name: 'session_id', location: 'cookie' }],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.headers.Cookie).toBe('session_id=${subject:session_id}');
});

it("places \${subject:<name>} as a top-level request-body field's own key value", async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { billing_address: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      requestBodyFieldNames: ['billing_address'],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.body).toEqual({ billing_address: '${subject:billing_address}' });
});

it('joins two cookie-carried parameters into one Cookie header value separated by "; ", never dropping one of them or writing a second Cookie-like key', async () => {
  const registered = capability({
    input_schema: JSON.stringify({ properties: { session_id: {}, tenant_id: {} } }),
  });

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [
        { name: 'session_id', location: 'cookie' },
        { name: 'tenant_id', location: 'cookie' },
      ],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(Object.keys(placement.headers).filter((key) => key.toLowerCase() === 'cookie')).toEqual(['Cookie']);
  expect(placement.headers.Cookie).toBe('session_id=${subject:session_id}; tenant_id=${subject:tenant_id}');
});

it('names a name unresolved with no-matching-input-schema-property when the one registered capability does not declare that property', async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [{ name: 'order_id', location: 'query' }],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.unresolved).toEqual([{ name: 'order_id', reason: 'no-matching-input-schema-property' }]);
  expect(placement.query).toEqual({ order_id: '{order_id}' });
});

it('names a name unresolved with no-matching-input-schema-property when only one of two registered capabilities fails to declare it', async () => {
  const declares = capability({ input_schema: JSON.stringify({ properties: { order_id: {} } }) });
  const doesNotDeclare = capability({ input_schema: JSON.stringify({ properties: { unrelated: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [{ name: 'order_id', location: 'query' }],
      capabilitiesReader: { readCapabilities: async () => [declares, doesNotDeclare] },
    }),
  );

  expect(placement.unresolved).toEqual([{ name: 'order_id', reason: 'no-matching-input-schema-property' }]);
});

it("treats customerId as unresolved against a declared customer_id, generating no placeholder", async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { customer_id: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [{ name: 'customerId', location: 'query' }],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.unresolved).toEqual([{ name: 'customerId', reason: 'no-matching-input-schema-property' }]);
  expect(placement.query.customerId).toBe('{customerId}');
});

it('names a name occupying two positions exactly once in the unresolved list, holding the brace form at both of its positions', async () => {
  const placement = await resolveSubjectPlaceholders(
    options({
      path: '/orders/{orderId}',
      parameters: [
        { name: 'orderId', location: 'path' },
        { name: 'orderId', location: 'header' },
      ],
      capabilitiesReader: { readCapabilities: async () => [] },
    }),
  );

  expect(placement.unresolved).toEqual([{ name: 'orderId', reason: 'no-capability-registered' }]);
  expect(placement.path).toBe('/orders/{orderId}');
  expect(placement.headers).toEqual({ orderId: '{orderId}' });
});

it('resolves a name occupying two positions consistently, placing the same placeholder at both of its positions and naming it in neither unresolved entry', async () => {
  const registered = capability({ input_schema: JSON.stringify({ properties: { order_id: {} } }) });

  const placement = await resolveSubjectPlaceholders(
    options({
      path: '/orders/{order_id}',
      parameters: [{ name: 'order_id', location: 'path' }],
      requestBodyFieldNames: ['order_id'],
      capabilitiesReader: { readCapabilities: async () => [registered] },
    }),
  );

  expect(placement.path).toBe('/orders/${subject:order_id}');
  expect(placement.body).toEqual({ order_id: '${subject:order_id}' });
  expect(placement.unresolved).toEqual([]);
});

it('discloses none of the registered capabilities it read on the returned placement, whether one or several are registered', async () => {
  const capabilities = [
    capability({ input_schema: JSON.stringify({ properties: { order_id: {} } }) }),
    capability({ input_schema: JSON.stringify({ properties: { contract_number: {} } }) }),
  ];

  const placement = await resolveSubjectPlaceholders(
    options({
      parameters: [{ name: 'order_id', location: 'query' }],
      capabilitiesReader: { readCapabilities: async () => capabilities },
    }),
  );

  expect(Object.keys(placement).sort()).toEqual(['body', 'headers', 'path', 'query', 'unresolved']);
});

it('returns the operation path unchanged, empty (not absent) query, headers and body records, and an empty unresolved list when the operation declares no parameters and no request-body fields', async () => {
  const placement = await resolveSubjectPlaceholders(
    options({
      path: '/ping',
      parameters: [],
      requestBodyFieldNames: [],
      capabilitiesReader: { readCapabilities: async () => [capability()] },
    }),
  );

  expect(placement).toEqual({ path: '/ping', query: {}, headers: {}, body: {}, unresolved: [] });
});

it('propagates a failure the injected capabilities reader itself raises, rather than swallowing it', async () => {
  const failingReader = {
    readCapabilities: async (): Promise<readonly RegisteredCapabilityForPlaceholderCheck[]> => {
      throw new Error('the capability store is unavailable');
    },
  };

  await expect(
    resolveSubjectPlaceholders(
      options({ parameters: [{ name: 'order_id', location: 'query' }], capabilitiesReader: failingReader }),
    ),
  ).rejects.toThrow('the capability store is unavailable');
});

// Proof for task/http-observation-runtime/http-declarative-observation-source:
// HttpDeclarativeObservationSource resolves a concept's capability and its
// connector's own opaque HTTP configuration, issues exactly one call bounded
// by the capability's own declared timeout, and classifies the result into
// one of the four evidence-result endings, with the ok observation keyed by
// the capability's own output_schema.
//
// Three boundaries are stood in for (TST-03), never business logic: the
// capability registry (FakeCapabilityQuery), the connector-configuration
// registry (FakeConnectorConfigurationQuery) and the network itself — the
// adapter's own injectable httpClient, a vi.fn() never wired to a real
// fetch. No test below makes a real network call or reaches a real store,
// per this task's own stated testability expectation.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { ConnectorConfigurationResolution } from '../../../connector-registry/connector-configuration-registry.service.js';
import { CapabilityNotResolvedForObservationError } from '../../../errors/capability-not-resolved-for-observation.error.js';
import { ConnectorConfigurationNotRegisteredError } from '../../../errors/connector-configuration-not-registered.error.js';
import { MalformedHttpConnectorConfigurationError } from '../../../errors/malformed-http-connector-configuration.error.js';
import {
  HttpDeclarativeObservationSource,
  type IConnectorConfigurationQuery,
} from '../../../investigation/http-declarative-observation-source.adapter.js';
import type { IObservationSource, Subject } from '../../../investigation/observation-source.port.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** The subject and requester most tests reuse; neither is what any single test is about. */
const A_SUBJECT: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'a-subject-id' }] };
const A_REQUESTER = 'a-requester';

/** A capability registered for exactly one concept, every other attribute defaulted so a test states only what it is about. */
function aCapability(overrides: Partial<Capability> & { readonly concept: string }): Capability {
  return {
    name: `capability-for-${overrides.concept}`,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'input-schema',
    output_schema: JSON.stringify({ type: 'object', properties: { status: { type: 'string' } } }),
    timeout: 5_000,
    connector: `connector-for-${overrides.concept}`,
    ...overrides,
  };
}

/** A connector's own minimum HTTP-specific configuration, every field defaulted so a test states only what it is about. */
function anHttpConfiguration(overrides: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return {
    address: 'https://api.example.com/records',
    method: 'GET',
    responseMap: { status: 'status' },
    statusMap: { '200': 'ok' },
    ...overrides,
  };
}

/** A JSON response carrying the given body, the same shape the adapter's own injected httpClient answers with. */
function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

/** Holds whatever capabilities a test registers, resolving every other concept as unheld — the adapter's own upstream, standing in for the capability registry. */
class FakeCapabilityQuery implements ICapabilityQuery {
  private readonly held = new Map<string, Capability>();

  public hold(capability: Capability): void {
    this.held.set(capability.concept, capability);
  }

  public async readCapability(concept: string): Promise<CapabilityResolution> {
    const capability = this.held.get(concept);
    return capability === undefined ? { held: false, concept } : { held: true, capability };
  }
}

/** Holds whatever connector configurations a test registers, resolving every other connector as unheld — standing in for the connector-configuration registry. */
class FakeConnectorConfigurationQuery implements IConnectorConfigurationQuery {
  private readonly held = new Map<string, Readonly<Record<string, unknown>>>();

  public hold(connector: string, configuration: Readonly<Record<string, unknown>>): void {
    this.held.set(connector, configuration);
  }

  public async readConnectorConfiguration(connector: string): Promise<ConnectorConfigurationResolution> {
    const configuration = this.held.get(connector);
    return configuration === undefined ? { held: false, connector } : { held: true, configuration: { connector, configuration } };
  }
}

/** One fetch-shaped fake, never wired to a real network call, so a test may inspect exactly what the adapter sent it. */
function newHttpClient(): ReturnType<typeof vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>> {
  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
}

/** An httpClient that never settles on its own, resolving or rejecting only in reaction to the adapter's own AbortSignal firing — the shape a real fetch takes once its own AbortController aborts it. */
function newPendingUntilAbortedHttpClient(): ReturnType<typeof newHttpClient> {
  return newHttpClient().mockImplementation(
    (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
  );
}

/** Assembles one adapter from a single capability and its connector's own configuration — the shape most tests below need. */
function anAdapter(options: {
  readonly capability: Capability;
  readonly connectorConfiguration?: Readonly<Record<string, unknown>>;
  readonly httpClient?: ReturnType<typeof newHttpClient>;
}): HttpDeclarativeObservationSource {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(options.capability);
  const connectorConfigurations = new FakeConnectorConfigurationQuery();
  if (options.connectorConfiguration !== undefined) {
    connectorConfigurations.hold(options.capability.connector, options.connectorConfiguration);
  }
  return new HttpDeclarativeObservationSource({
    capabilities,
    connectorConfigurations,
    httpClient: options.httpClient as unknown as (typeof fetch | undefined),
  });
}

// ------------------------------------------------------------------ criterion 1

it('implements the existing IObservationSource port with an unmodified observeConcept(concept, subject, requester) signature', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }), connectorConfiguration: anHttpConfiguration(), httpClient });
  const port: IObservationSource = adapter;

  const outcome = await port.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'a-value' }) });
});

it('imports no HTTP client package, reaching the network only through the platform global fetch', async () => {
  const source = await readFile(
    fileURLToPath(new URL('../../../investigation/http-declarative-observation-source.adapter.ts', import.meta.url)),
    'utf8',
  );

  const forbidden = ['axios', 'node-fetch', 'got', 'undici', 'superagent', 'request'];
  const offenders = forbidden.filter((name) => source.includes(`'${name}'`) || source.includes(`"${name}"`));

  expect(offenders).toEqual([]);
});

it('defaults its own HTTP client to the platform global fetch when the caller injects none', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse({ status: 'a-value' }));
  try {
    const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }), connectorConfiguration: anHttpConfiguration() });

    await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  } finally {
    fetchSpy.mockRestore();
  }
});

// ------------------------------------------------------------------ criterion 2

it('issues exactly one outbound call per observeConcept invocation', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }), connectorConfiguration: anHttpConfiguration(), httpClient });

  await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(httpClient).toHaveBeenCalledTimes(1);
});

it("issues its own single call for each of two concurrent observeConcept invocations, settling each from its own connector's own response", async () => {
  const capabilities = new FakeCapabilityQuery();
  const capabilityOne = aCapability({ concept: 'concept-one' });
  const capabilityTwo = aCapability({ concept: 'concept-two' });
  capabilities.hold(capabilityOne);
  capabilities.hold(capabilityTwo);
  const connectorConfigurations = new FakeConnectorConfigurationQuery();
  connectorConfigurations.hold(capabilityOne.connector, anHttpConfiguration());
  connectorConfigurations.hold(capabilityTwo.connector, anHttpConfiguration());
  const httpClient = newHttpClient();
  httpClient.mockResolvedValueOnce(okResponse({ status: 'value-one' }));
  httpClient.mockResolvedValueOnce(okResponse({ status: 'value-two' }));
  const adapter = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations, httpClient: httpClient as unknown as typeof fetch });

  const [outcomeOne, outcomeTwo] = await Promise.all([
    adapter.observeConcept('concept-one', A_SUBJECT, A_REQUESTER),
    adapter.observeConcept('concept-two', A_SUBJECT, A_REQUESTER),
  ]);

  expect(httpClient).toHaveBeenCalledTimes(2);
  expect(outcomeOne).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'value-one' }) });
  expect(outcomeTwo).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'value-two' }) });
});

// ------------------------------------------------------------------ criterion 3

it("resolves which external system to reach entirely from the calling capability's own connector value, reaching a distinct host per registered connector", async () => {
  const capabilities = new FakeCapabilityQuery();
  const capabilityA = aCapability({ concept: 'concept-a', connector: 'connector-a' });
  const capabilityB = aCapability({ concept: 'concept-b', connector: 'connector-b' });
  capabilities.hold(capabilityA);
  capabilities.hold(capabilityB);
  const connectorConfigurations = new FakeConnectorConfigurationQuery();
  connectorConfigurations.hold('connector-a', anHttpConfiguration({ address: 'https://host-a.example.com/records' }));
  connectorConfigurations.hold('connector-b', anHttpConfiguration({ address: 'https://host-b.example.com/records' }));
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations, httpClient: httpClient as unknown as typeof fetch });

  await adapter.observeConcept('concept-a', A_SUBJECT, A_REQUESTER);
  await adapter.observeConcept('concept-b', A_SUBJECT, A_REQUESTER);

  expect(httpClient.mock.calls[0]?.[0]).toBe('https://host-a.example.com/records');
  expect(httpClient.mock.calls[1]?.[0]).toBe('https://host-b.example.com/records');
});

it("rejects with a typed ConnectorConfigurationNotRegisteredError, never one of the four endings, when the capability's own connector names no configuration currently registered", async () => {
  const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }) });

  await expect(adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER)).rejects.toBeInstanceOf(
    ConnectorConfigurationNotRegisteredError,
  );
});

// ------------------------------------------------------------------ criterion 4

it('carries an observation on the ok ending', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'operational' }));
  const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }), connectorConfiguration: anHttpConfiguration(), httpClient });

  const outcome = await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'operational' }) });
});

it('carries no observation field on a non-ok ending, resolving exactly to its own result', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response(null, { status: 403 }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ statusMap: { '403': 'denied' } }),
    httpClient,
  });

  const outcome = await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(outcome).toEqual({ result: 'denied' });
});

// ------------------------------------------------------------------ criterion 5

it("defaults an HTTP status absent from the connector's own status map to the unavailable ending, rather than leaving it unclassified", async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response(null, { status: 500 }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ statusMap: { '200': 'ok' } }),
    httpClient,
  });

  const outcome = await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(outcome).toEqual({ result: 'unavailable' });
});

it('never throws for a status its own connector configuration does not classify, answering one of the four endings instead', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response(null, { status: 599 }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ statusMap: { '200': 'ok' } }),
    httpClient,
  });

  await expect(adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER)).resolves.toEqual({ result: 'unavailable' });
});

// ------------------------------------------------------------------ criterion 6

it('resolves to the timeout ending, rather than throwing, once its own bound elapses before the call completes', async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 1_000 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });

  const outcomePromise = adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);
  await vi.advanceTimersByTimeAsync(1_000);

  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it('resolves to timeout immediately when the capability declares a zero-length timeout, the lower boundary', async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 0 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });

  const outcomePromise = adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);
  await vi.advanceTimersByTimeAsync(0);

  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it('propagates a genuine network failure unmodified, rather than degrading it to one of the four endings', async () => {
  const httpClient = newHttpClient().mockRejectedValueOnce(new Error('a genuine network failure'));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });

  await expect(adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER)).rejects.toThrow('a genuine network failure');
});

// ------------------------------------------------------------------ criterion 7, and the binder's carried-forward concern
//
// Neither test below inspects which internal timer call the adapter made: both observe only
// whether the call has settled at a given moment on the fake clock, which is the one externally
// visible trace of "how long is this adapter still willing to wait." Read together they are what
// this task's own Notes ask for: a small, capability-unrelated fixed timeout (e.g. 50ms) fails the
// first test below (a 300ms-declaring capability would already have settled well before 299ms), and
// a large, capability-unrelated fixed timeout (e.g. 300ms) fails the second (a 40ms-declaring
// capability would not yet have settled at 40ms). Only an adapter whose applied bound actually
// tracks each capability's own declared value passes both.

it("does not resolve before a capability's own longer declared timeout elapses, refuting a small fixed timeout unrelated to it", async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 300 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });
  let settled = false;
  const outcomePromise = adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER).then((outcome) => {
    settled = true;
    return outcome;
  });

  await vi.advanceTimersByTimeAsync(299);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it("resolves to timeout by the moment a different, shorter capability-declared timeout elapses, refuting a large fixed timeout unrelated to it", async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-different-concept', timeout: 40 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });
  let settled = false;
  const outcomePromise = adapter.observeConcept('a-different-concept', A_SUBJECT, A_REQUESTER).then((outcome) => {
    settled = true;
    return outcome;
  });

  await vi.advanceTimersByTimeAsync(39);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

// ------------------------------------------------------------------ criterion 8

it('carries the given requester into the assembled request unmodified, never a substituted service identity', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ address: 'https://api.example.com/${requester}/records' }),
    httpClient,
  });

  await adapter.observeConcept('a-concept', A_SUBJECT, 'the-marker-requester');

  expect(httpClient.mock.calls[0]?.[0]).toBe('https://api.example.com/the-marker-requester/records');
});

it('carries a different requester into a different call rather than reusing a fixed identity across calls', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ address: 'https://api.example.com/${requester}/records' }),
    httpClient,
  });

  await adapter.observeConcept('a-concept', A_SUBJECT, 'requester-one');
  await adapter.observeConcept('a-concept', A_SUBJECT, 'requester-two');

  expect(httpClient.mock.calls[0]?.[0]).toBe('https://api.example.com/requester-one/records');
  expect(httpClient.mock.calls[1]?.[0]).toBe('https://api.example.com/requester-two/records');
});

// ------------------------------------------------------------------ criteria 9 and 11

it("keys the ok observation by the capability's own output_schema property names, dropping a response-map field the schema does not declare, and never surfacing the response's own raw field name", async () => {
  const capability = aCapability({
    concept: 'a-concept',
    output_schema: JSON.stringify({ type: 'object', properties: { equipment_state: { type: 'string' } } }),
  });
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ raw_vendor_status: 'operational', raw_vendor_extra: 'noise' }));
  const adapter = anAdapter({
    capability,
    connectorConfiguration: anHttpConfiguration({
      responseMap: { equipment_state: 'raw_vendor_status', unwanted_extra: 'raw_vendor_extra' },
    }),
    httpClient,
  });

  const outcome = await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({ equipment_state: 'operational' }) });
  expect(outcome.result === 'ok' ? outcome.observation : '').not.toContain('raw_vendor');
});

// ------------------------------------------------------------------ inference: capability/connector-configuration lookup faults

it('rejects with a typed CapabilityNotResolvedForObservationError, never one of the four endings, when no capability currently answers the concept', async () => {
  const capabilities = new FakeCapabilityQuery();
  const connectorConfigurations = new FakeConnectorConfigurationQuery();
  const adapter = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations, httpClient: newHttpClient() as unknown as typeof fetch });

  await expect(adapter.observeConcept('an-unregistered-concept', A_SUBJECT, A_REQUESTER)).rejects.toBeInstanceOf(
    CapabilityNotResolvedForObservationError,
  );
});

it("refuses with a typed MalformedHttpConnectorConfigurationError, before any request is assembled, when the connector's own configuration does not declare a recognized method", async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ method: 'TRACE' }),
    httpClient,
  });

  await expect(adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER)).rejects.toBeInstanceOf(
    MalformedHttpConnectorConfigurationError,
  );
  expect(httpClient).not.toHaveBeenCalled();
});

// ------------------------------------------------------------------ inference: HTTP method not restricted to GET

it("issues the connector's own declared HTTP method rather than defaulting to GET, for a read-only capability whose own endpoint requires POST", async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ method: 'POST' }),
    httpClient,
  });

  await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(httpClient.mock.calls[0]?.[1]?.method).toBe('POST');
});

// ------------------------------------------------------------------ inference: request body serialization

it('serializes a non-string resolved request body as JSON before sending it', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ body: { subjectId: '${subject:id}' } }),
    httpClient,
  });

  await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(httpClient.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ subjectId: 'a-subject-id' }));
});

it('sends an already-string resolved request body verbatim, without double-encoding it', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ body: 'a-raw-string-body-for-${requester}' }),
    httpClient,
  });

  await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(httpClient.mock.calls[0]?.[1]?.body).toBe('a-raw-string-body-for-a-requester');
});

// ------------------------------------------------------------------ inference: an unparseable ok body is nothing found, never a thrown fault

it('treats a response body that is not valid JSON as nothing extracted, rather than throwing, on the ok path', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response('not-valid-json-at-all-{{{', { status: 200 }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });

  const outcome = await adapter.observeConcept('a-concept', A_SUBJECT, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({}) });
});

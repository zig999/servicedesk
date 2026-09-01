import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { ConnectorConfigurationResolution } from '../../../connector-registry/connector-configuration-registry.service.js';
import { CapabilityNotResolvedForObservationError } from '../../../errors/capability-not-resolved-for-observation.error.js';
import { ConnectorConfigurationNotRegisteredError } from '../../../errors/connector-configuration-not-registered.error.js';
import { ConnectorPlaceholderNotResolvedError } from '../../../errors/connector-placeholder-not-resolved.error.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import { IncompleteConnectorCallDescriptorError } from '../../../errors/incomplete-connector-call-descriptor.error.js';
import { MalformedHttpConnectorConfigurationError } from '../../../errors/malformed-http-connector-configuration.error.js';
import {
  asHttpConnectorCallConfiguration,
  HttpDeclarativeObservationSource,
  type IConnectorConfigurationQuery,
} from '../../../investigation/http-declarative-observation-source.adapter.js';
import type { Subject } from '../../../investigation/observation-source.port.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const A_SUBJECT: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'a-subject-id' }] };
const A_REQUESTER = 'a-requester';

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

function anHttpConfiguration(overrides: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return {
    address: 'https://api.example.com/records',
    method: 'GET',
    responseMap: { status: 'status' },
    statusMap: { '200': 'ok' },
    ...overrides,
  };
}

function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

class FakeCapabilityQuery implements ICapabilityQuery {
  private readonly held = new Map<string, Capability>();
  private readonly duplicated = new Set<string>();

  public hold(capability: Capability): void {
    this.held.set(capability.concept, capability);
  }

  public holdDuplicate(concept: string): void {
    this.duplicated.add(concept);
  }

  public async readCapability(concept: string): Promise<CapabilityResolution> {
    if (this.duplicated.has(concept)) {
      throw new DuplicateConceptAnswerError(concept, [
        { name: `capability-one-for-${concept}`, version: '1.0.0' },
        { name: `capability-two-for-${concept}`, version: '1.0.0' },
      ]);
    }
    const capability = this.held.get(concept);
    return capability === undefined ? { held: false, concept } : { held: true, capability };
  }

  public async listCapabilities(): Promise<never> {
    throw new Error('FakeCapabilityQuery.listCapabilities is not scripted for this file');
  }
}

class FakeConnectorConfigurationQuery implements IConnectorConfigurationQuery {
  private readonly held = new Map<string, Readonly<Record<string, unknown>>>();

  public hold(connector: string, configuration: Readonly<Record<string, unknown>>): void {
    this.held.set(connector, configuration);
  }

  public async readConnectorConfiguration(connector: string): Promise<ConnectorConfigurationResolution> {
    const configuration = this.held.get(connector);
    return configuration === undefined
      ? { held: false, connector }
      : { held: true, configuration: { connector, configuration: JSON.stringify(configuration) } };
  }
}

function newHttpClient(): ReturnType<typeof vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>> {
  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
}

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

    await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  } finally {
    fetchSpy.mockRestore();
  }
});

it('issues exactly one outbound call per observeConcept invocation', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }), connectorConfiguration: anHttpConfiguration(), httpClient });

  await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

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
    adapter.observeConcept({ concept: 'concept-one', subject: A_SUBJECT, requester: A_REQUESTER }),
    adapter.observeConcept({ concept: 'concept-two', subject: A_SUBJECT, requester: A_REQUESTER }),
  ]);

  expect(httpClient).toHaveBeenCalledTimes(2);
  expect(outcomeOne).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'value-one' }) });
  expect(outcomeTwo).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'value-two' }) });
});

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

  await adapter.observeConcept({ concept: 'concept-a', subject: A_SUBJECT, requester: A_REQUESTER });
  await adapter.observeConcept({ concept: 'concept-b', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(httpClient.mock.calls[0]?.[0]).toBe('https://host-a.example.com/records');
  expect(httpClient.mock.calls[1]?.[0]).toBe('https://host-b.example.com/records');
});

it('carries an observation on the ok ending', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'operational' }));
  const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }), connectorConfiguration: anHttpConfiguration(), httpClient });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'operational' }) });
});

it('carries no observation field on a non-ok ending, resolving exactly to its own result', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response(null, { status: 403 }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ statusMap: { '403': 'denied' } }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'denied' });
});

it("defaults an HTTP status absent from the connector's own status map to the unavailable ending, rather than leaving it unclassified", async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response(null, { status: 500 }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ statusMap: { '200': 'ok' } }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable' });
});

it('resolves to the timeout ending, rather than throwing, once its own bound elapses before the call completes', async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 1_000 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });

  const outcomePromise = adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });
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

  const outcomePromise = adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });
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

  await expect(adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER })).rejects.toThrow('a genuine network failure');
});

it("does not resolve before a capability's own longer declared timeout elapses, refuting a small fixed timeout unrelated to it", async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 300 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });
  let settled = false;
  const outcomePromise = adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER }).then((outcome) => {
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
  const outcomePromise = adapter.observeConcept({ concept: 'a-different-concept', subject: A_SUBJECT, requester: A_REQUESTER }).then((outcome) => {
    settled = true;
    return outcome;
  });

  await vi.advanceTimersByTimeAsync(39);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it("bounds its call by the caller's own smaller remaining-budget bound, settling to timeout before the capability's own longer declared timeout would have elapsed", async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 5_000 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });
  let settled = false;
  const outcomePromise = adapter
    .observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, remainingBudgetMs: 200 })
    .then((outcome) => {
      settled = true;
      return outcome;
    });

  await vi.advanceTimersByTimeAsync(199);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it("remains bounded by the capability's own declared timeout when the caller's given remaining-budget bound is larger, not waiting for that larger bound to elapse", async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 150 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });
  let settled = false;
  const outcomePromise = adapter
    .observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, remainingBudgetMs: 5_000 })
    .then((outcome) => {
      settled = true;
      return outcome;
    });

  await vi.advanceTimersByTimeAsync(149);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it("remains bounded by the capability's own declared timeout when the caller's given remaining-budget bound equals it exactly, the shared boundary 'at or above' names", async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 250 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });
  let settled = false;
  const outcomePromise = adapter
    .observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, remainingBudgetMs: 250 })
    .then((outcome) => {
      settled = true;
      return outcome;
    });

  await vi.advanceTimersByTimeAsync(249);
  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toBe(true);
  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it('resolves to timeout immediately when the remaining-budget bound is zero, the lower boundary, even though the capability declares a much longer timeout of its own', async () => {
  const httpClient = newPendingUntilAbortedHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept', timeout: 5_000 }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });

  const outcomePromise = adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER, remainingBudgetMs: 0 });
  await vi.advanceTimersByTimeAsync(0);

  await expect(outcomePromise).resolves.toEqual({ result: 'timeout' });
});

it('carries the given requester into the assembled request unmodified, never a substituted service identity', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ address: 'https://api.example.com/${requester}/records' }),
    httpClient,
  });

  await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: 'the-marker-requester' });

  expect(httpClient.mock.calls[0]?.[0]).toBe('https://api.example.com/the-marker-requester/records');
});

it('carries a different requester into a different call rather than reusing a fixed identity across calls', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ address: 'https://api.example.com/${requester}/records' }),
    httpClient,
  });

  await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: 'requester-one' });
  await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: 'requester-two' });

  expect(httpClient.mock.calls[0]?.[0]).toBe('https://api.example.com/requester-one/records');
  expect(httpClient.mock.calls[1]?.[0]).toBe('https://api.example.com/requester-two/records');
});

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

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({ equipment_state: 'operational' }) });
  expect(outcome.result === 'ok' ? outcome.observation : '').not.toContain('raw_vendor');
});

const ADAPTER_IMPORT_PATTERN = /(?:from|import)\s*\(?\s*['"][^'"]*http-declarative-observation-source\.adapter[^'"]*['"]/;

async function domainModuleFiles(): Promise<readonly string[]> {
  const files: string[] = [];
  for (const root of ['case', 'glossary', 'investigation']) {
    const directory = fileURLToPath(new URL(`../../../${root}/`, import.meta.url));
    for (const file of await readdir(directory)) {
      if (file.endsWith('.ts') && !file.endsWith('.adapter.ts')) {
        files.push(join(directory, file));
      }
    }
  }
  if (files.length === 0) {
    throw new Error('no domain module found to audit — the pass would be vacuous');
  }
  return files;
}

it('is imported by no domain module, so the domain layer reaches this adapter only through the IObservationSource port', async () => {
  const files = await domainModuleFiles();

  const offenders: string[] = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (ADAPTER_IMPORT_PATTERN.test(source)) {
      offenders.push(file);
    }
  }

  expect(offenders).toEqual([]);
});

it('answers unavailable naming CapabilityNotResolvedForObservationError, issuing no call, when no capability currently answers the concept', async () => {
  const capabilities = new FakeCapabilityQuery();
  const connectorConfigurations = new FakeConnectorConfigurationQuery();
  const httpClient = newHttpClient();
  const adapter = new HttpDeclarativeObservationSource({
    capabilities,
    connectorConfigurations,
    httpClient: httpClient as unknown as typeof fetch,
  });

  const outcome = await adapter.observeConcept({ concept: 'an-unregistered-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: CapabilityNotResolvedForObservationError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming DuplicateConceptAnswerError, issuing no call, when more than one registered capability currently answers the concept', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.holdDuplicate('a-duplicated-concept');
  const connectorConfigurations = new FakeConnectorConfigurationQuery();
  const httpClient = newHttpClient();
  const adapter = new HttpDeclarativeObservationSource({
    capabilities,
    connectorConfigurations,
    httpClient: httpClient as unknown as typeof fetch,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-duplicated-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: DuplicateConceptAnswerError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it("answers unavailable naming ConnectorConfigurationNotRegisteredError, issuing no call, when the capability's own connector names no configuration currently registered", async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({ capability: aCapability({ concept: 'a-concept' }), httpClient });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: ConnectorConfigurationNotRegisteredError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it("answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a recognized method", async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ method: 'TRACE' }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: MalformedHttpConnectorConfigurationError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it("answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a responseMap", async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ responseMap: undefined }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: MalformedHttpConnectorConfigurationError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it("answers unavailable naming MalformedHttpConnectorConfigurationError, issuing no call, when the connector's own configuration does not declare a statusMap", async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ statusMap: undefined }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: MalformedHttpConnectorConfigurationError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector call embeds a Subject-attribute placeholder the given Subject does not carry', async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({
      address: 'https://api.example.com/${subject:an-attribute-the-subject-does-not-carry}',
    }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: ConnectorPlaceholderNotResolvedError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming ConnectorPlaceholderNotResolvedError, issuing no call, when the connector call embeds a credential placeholder naming an environment variable that is not set', async () => {
  const envVarName = 'A_CREDENTIAL_ENV_VAR_THIS_TEST_NEVER_SETS';
  delete process.env[envVarName];
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ headers: { authorization: `\${credential:${envVarName}}` } }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: ConnectorPlaceholderNotResolvedError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration is missing its address', async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ address: undefined }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: IncompleteConnectorCallDescriptorError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration declares headers as an object whose own value is not a string', async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ headers: { 'x-count': 7 } }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: IncompleteConnectorCallDescriptorError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration declares query as something other than an object of string values', async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ query: 'not-an-object' }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: IncompleteConnectorCallDescriptorError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration embeds a placeholder naming a kind this connector does not recognize', async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ address: 'https://api.example.com/${an-unrecognized-kind:something}' }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: IncompleteConnectorCallDescriptorError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it('answers unavailable naming IncompleteConnectorCallDescriptorError, issuing no call, when the connector configuration embeds a subject placeholder naming no attribute at all', async () => {
  const httpClient = newHttpClient();
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ address: 'https://api.example.com/${subject}' }),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable', result_detail: IncompleteConnectorCallDescriptorError.name });
  expect(httpClient).not.toHaveBeenCalled();
});

it("proceeds with every other concept unaffected — settling to its own ok ending — when one concept collected in the same Promise.all batch degrades to unavailable through this catch", async () => {
  const capabilities = new FakeCapabilityQuery();
  const degradingCapability = aCapability({ concept: 'a-degrading-concept', connector: 'a-degrading-connector' });
  const healthyCapability = aCapability({ concept: 'a-healthy-concept', connector: 'a-healthy-connector' });
  capabilities.hold(degradingCapability);
  capabilities.hold(healthyCapability);
  const connectorConfigurations = new FakeConnectorConfigurationQuery();
  connectorConfigurations.hold(
    'a-degrading-connector',
    anHttpConfiguration({ address: 'https://api.example.com/${subject:an-attribute-the-subject-does-not-carry}' }),
  );
  connectorConfigurations.hold('a-healthy-connector', anHttpConfiguration());
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'operational' }));
  const adapter = new HttpDeclarativeObservationSource({
    capabilities,
    connectorConfigurations,
    httpClient: httpClient as unknown as typeof fetch,
  });

  const [degradingOutcome, healthyOutcome] = await Promise.all([
    adapter.observeConcept({ concept: 'a-degrading-concept', subject: A_SUBJECT, requester: A_REQUESTER }),
    adapter.observeConcept({ concept: 'a-healthy-concept', subject: A_SUBJECT, requester: A_REQUESTER }),
  ]);

  expect(degradingOutcome).toEqual({ result: 'unavailable', result_detail: ConnectorPlaceholderNotResolvedError.name });
  expect(healthyOutcome).toEqual({ result: 'ok', observation: JSON.stringify({ status: 'operational' }) });
  expect(httpClient).toHaveBeenCalledTimes(1);
});

it('still throws MalformedHttpConnectorConfigurationError from the exported asHttpConnectorCallConfiguration itself, unwrapped, for a caller that narrows a configuration directly rather than through observeConcept', () => {
  expect(() => asHttpConnectorCallConfiguration('a-connector', anHttpConfiguration({ method: 'TRACE' }))).toThrow(
    MalformedHttpConnectorConfigurationError,
  );
});

it("issues the connector's own declared HTTP method rather than defaulting to GET, for a read-only capability whose own endpoint requires POST", async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ method: 'POST' }),
    httpClient,
  });

  await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(httpClient.mock.calls[0]?.[1]?.method).toBe('POST');
});

it('serializes a non-string resolved request body as JSON before sending it', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ body: { subjectId: '${subject:id}' } }),
    httpClient,
  });

  await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(httpClient.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ subjectId: 'a-subject-id' }));
});

it('sends an already-string resolved request body verbatim, without double-encoding it', async () => {
  const httpClient = newHttpClient().mockResolvedValue(okResponse({ status: 'a-value' }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration({ body: 'a-raw-string-body-for-${requester}' }),
    httpClient,
  });

  await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(httpClient.mock.calls[0]?.[1]?.body).toBe('a-raw-string-body-for-a-requester');
});

it('treats a response body that is not valid JSON as nothing extracted, rather than throwing, on the ok path', async () => {
  const httpClient = newHttpClient().mockResolvedValue(new Response('not-valid-json-at-all-{{{', { status: 200 }));
  const adapter = anAdapter({
    capability: aCapability({ concept: 'a-concept' }),
    connectorConfiguration: anHttpConfiguration(),
    httpClient,
  });

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({}) });
});

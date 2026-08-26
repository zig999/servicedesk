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
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { ConnectorConfigurationResolution } from '../../../connector-registry/connector-configuration-registry.service.js';
import { CapabilityNotResolvedForObservationError } from '../../../errors/capability-not-resolved-for-observation.error.js';
import { ConnectorConfigurationNotRegisteredError } from '../../../errors/connector-configuration-not-registered.error.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
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
  private readonly duplicated = new Set<string>();

  public hold(capability: Capability): void {
    this.held.set(capability.concept, capability);
  }

  /**
   * Registers a concept as currently answered by more than one capability,
   * so readCapability throws DuplicateConceptAnswerError for it exactly as
   * CapabilityRegistryService's own readCapability does
   * (rules/integration/one-capability-answers-one-concept) — the one call
   * site this adapter's own resolveCapability catches that throw at.
   */
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

  // Minimal stub kept only to satisfy the widened ICapabilityQuery interface
  // (task/capability-registry-http/list-capabilities-query-extension): this
  // file's own scenarios never call listCapabilities.
  public async listCapabilities(): Promise<never> {
    throw new Error('FakeCapabilityQuery.listCapabilities is not scripted for this file');
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
    return configuration === undefined
      ? { held: false, connector }
      : { held: true, configuration: { connector, configuration: JSON.stringify(configuration) } };
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

// ------------------------------------------------------------------ criterion 2

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

  await adapter.observeConcept({ concept: 'concept-a', subject: A_SUBJECT, requester: A_REQUESTER });
  await adapter.observeConcept({ concept: 'concept-b', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(httpClient.mock.calls[0]?.[0]).toBe('https://host-a.example.com/records');
  expect(httpClient.mock.calls[1]?.[0]).toBe('https://host-b.example.com/records');
});

// ConnectorConfigurationNotRegisteredError no longer rejects here — see
// task/observation-endings-and-collection-budget/observation-port-unavailable-endings's
// own dedicated section below, which supersedes this file's own earlier
// reject-based test for this same condition.

// ------------------------------------------------------------------ criterion 4

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

// ------------------------------------------------------------------ criterion 5

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

// ------------------------------------------------------------------ criterion 6

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

// ------------------------------------------------------------------ task/observation-endings-and-collection-budget/observation-port-budget-clamp
//
// Each test below gives a capability's own declared timeout that differs sharply from the caller's
// own given remainingBudgetMs, precisely so a settle observed at one value and not the other rules
// out an adapter reading only one of the two fields: one that used capability.timeout alone would
// still be pending when the first test's clock reaches its own smaller remainingBudgetMs, and one
// that used remainingBudgetMs alone would already have settled before the second test's clock
// reaches the capability's own shorter declared timeout.

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

// ------------------------------------------------------------------ criterion 8

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

  const outcome = await adapter.observeConcept({ concept: 'a-concept', subject: A_SUBJECT, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: JSON.stringify({ equipment_state: 'operational' }) });
  expect(outcome.result === 'ok' ? outcome.observation : '').not.toContain('raw_vendor');
});

// ------------------------------------------------------------------ criterion 10

/** Matches a static import, re-export or dynamic import whose specifier names this task's adapter module. */
const ADAPTER_IMPORT_PATTERN = /(?:from|import)\s*\(?\s*['"][^'"]*http-declarative-observation-source\.adapter[^'"]*['"]/;

/**
 * Every .ts module of the domain layer as
 * constraints/the-domain-depends-on-no-infrastructure names it — case
 * behavior (src/case), vocabulary (src/glossary), and the investigation
 * modules that are not themselves adapters (the factory, the stages, the
 * evaluation, the ports). Refuses an empty set so the sweep cannot pass
 * vacuously over a directory that moved.
 */
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

// ------------------------------------------------------------------ task/observation-endings-and-collection-budget/observation-port-unavailable-endings
//
// Each of the four presently-unresolvable conditions this task adds answers
// 'unavailable' with a result_detail naming the condition's own error class
// — read off the raised error's own .name rather than a second hand-written
// literal, so a rename of the class cannot drift from what result_detail
// carries — instead of throwing, and issues no HTTP call: the httpClient
// fake stays uncalled in every one of the six tests below.

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

// ------------------------------------------------------------------ inference: asHttpConnectorCallConfiguration itself still throws

it('still throws MalformedHttpConnectorConfigurationError from the exported asHttpConnectorCallConfiguration itself, unwrapped, for a caller that narrows a configuration directly rather than through observeConcept', () => {
  expect(() => asHttpConnectorCallConfiguration('a-connector', anHttpConfiguration({ method: 'TRACE' }))).toThrow(
    MalformedHttpConnectorConfigurationError,
  );
});

// ------------------------------------------------------------------ inference: HTTP method not restricted to GET

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

// ------------------------------------------------------------------ inference: request body serialization

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

// ------------------------------------------------------------------ inference: an unparseable ok body is nothing found, never a thrown fault

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

// ------------------------------------------------------------------ task/stale-specification-citations/citations-corrected, criterion 7

it("DEFAULT_STATUS_ENDING's own comment cites rules/integration/an-unclassified-status-ends-unavailable as the specification's own decided default, quoting its 'claims the least' rationale, rather than claiming no node states one", async () => {
  const source = await readFile(
    fileURLToPath(new URL('../../../investigation/http-declarative-observation-source.adapter.ts', import.meta.url)),
    'utf8',
  );
  const prose = source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  expect(prose).not.toMatch(/no specification node states/i);
  expect(prose).toContain('rules/integration/an-unclassified-status-ends-unavailable');
  expect(prose).toContain('claims the least');
});

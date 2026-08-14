// The production HTTP adapter behind IObservationSource
// (task/http-observation-runtime/http-declarative-observation-source,
// contracts/investigation/observation-source,
// contracts/integration/concept-observation,
// contracts/system/corporate-records,
// contracts/integration/corporate-records-source): resolves the calling
// concept's capability (domain/integration/capability), reads its own
// connector's opaque call configuration from the connector-configuration
// registry, assembles one outbound HTTP request through
// connector-request-resolver.ts's own resolveConnectorRequest, issues
// exactly one call through the platform's own global fetch — the only HTTP
// client this module names, since no HTTP client package is authorized for
// this project and Node's own runtime already exposes one — bounded by the
// calling capability's own declared timeout
// (rules/investigation/collection-has-its-own-budget-within-the-total,
// scenarios/investigation/a-collection-timeout-degrades-to-no-data), and
// classifies the answer into exactly one of the four evidence-result
// endings (domain/investigation/evidence-result), extracting the ok
// observation through response-path-extractor.ts's own
// extractResponseFields and keying it by the capability's own output_schema
// property names (rules/integration/evidence-arrives-in-the-glossary-vocabulary,
// constraints/evidence-normalization-is-an-anticorruption-layer).
//
// Sits beside FakeObservationSource, its own sibling concrete port
// implementation, never imported by the domain layer itself
// (constraints/the-domain-depends-on-no-infrastructure): no domain module
// imports this file or the global fetch it calls through.
//
// Never throws for one of the four endings the port declares: a received
// status and this adapter's own applied timeout both resolve to one of the
// four. Only a genuine unexpected fault — a capability or connector
// configuration a race left unresolved, a malformed connector configuration,
// an unresolved request placeholder, or a network failure that is not this
// adapter's own timeout — propagates as a rejection, the same convention
// evidence-collection-stage.ts's own raceObservation already documents and
// lets through uncaught.

import type { Capability } from '../capability-registry/capability.js';
import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { ConnectorConfigurationResolution } from '../connector-registry/connector-configuration-registry.service.js';
import type { AssembledConnectorRequest } from '../http-connector/connector-call-descriptor.js';
import { resolveConnectorRequest } from '../http-connector/connector-request-resolver.js';
import {
  HTTP_METHODS,
  type HttpConnectorCallConfiguration,
  type HttpMethod,
  type StatusEndingMap,
} from '../http-connector/http-connector-call-configuration.js';
import { extractResponseFields, type ResponseFieldPaths } from '../http-connector/response-path-extractor.js';
import { CapabilityNotResolvedForObservationError } from '../errors/capability-not-resolved-for-observation.error.js';
import { ConnectorConfigurationNotRegisteredError } from '../errors/connector-configuration-not-registered.error.js';
import { MalformedHttpConnectorConfigurationError } from '../errors/malformed-http-connector-configuration.error.js';
import { declaredFieldsOf } from './citation-validation.js';
import { EVIDENCE_RESULTS, type EvidenceResult } from './evidence-result.js';
import type { IObservationSource, ObservationOutcome, Subject } from './observation-source.port.js';

/**
 * The read this adapter needs from the connector-configuration registry —
 * connector-configuration-registry.service.ts's own
 * ConnectorConfigurationRegistryService already satisfies this structurally,
 * and a test may substitute a fixture-backed fake instead, the same
 * fixture-driven testability ICapabilityQuery already gives the capability
 * side of this same call.
 */
export interface IConnectorConfigurationQuery {
  readConnectorConfiguration(connector: string): Promise<ConnectorConfigurationResolution>;
}

/**
 * The ending a received HTTP status resolves to where the connector's own
 * status map declares no entry for it, or declares one this adapter does
 * not recognize as one of the four — the implementer's own free technical
 * choice (this task's own Notes), since no specification node states a
 * default classification; chosen as the closest of the four to "the call
 * reached the system but nothing usable came back," the same reading
 * evidence-collection-stage.ts's own unavailableEvidence already gives an
 * unresolved capability.
 */
const DEFAULT_STATUS_ENDING: EvidenceResult = 'unavailable';

/**
 * What one HttpDeclarativeObservationSource needs to construct: the
 * capability and connector-configuration reads, and the HTTP client to
 * issue a call through — the platform's own global fetch when a caller
 * supplies none, so a test may substitute a fake that never reaches the
 * network (this task's own stated testability expectation).
 */
export type HttpDeclarativeObservationSourceOptions = {
  readonly capabilities: ICapabilityQuery;
  readonly connectorConfigurations: IConnectorConfigurationQuery;
  readonly httpClient?: typeof fetch;
};

/** What issuing one bounded HTTP call answers: the response it received, or a mark that this adapter's own timeout elapsed first. */
type CallResult = { readonly kind: 'response'; readonly response: Response } | { readonly kind: 'timed-out' };

/**
 * The one production adapter behind IObservationSource
 * (contracts/investigation/observation-source): a generic, data-driven HTTP
 * call for any capability whose connector is registered — no external
 * system's name, host or shape named anywhere in this file.
 */
export class HttpDeclarativeObservationSource implements IObservationSource {
  private readonly capabilities: ICapabilityQuery;
  private readonly connectorConfigurations: IConnectorConfigurationQuery;
  private readonly httpClient: typeof fetch;

  public constructor(options: HttpDeclarativeObservationSourceOptions) {
    this.capabilities = options.capabilities;
    this.connectorConfigurations = options.connectorConfigurations;
    this.httpClient = options.httpClient ?? fetch;
  }

  /**
   * observe-concept (contracts/integration/concept-observation): resolves
   * the concept's capability and its connector's own call configuration,
   * issues exactly one HTTP call within the capability's own declared
   * timeout, and answers one of the four evidence-result endings — never
   * throwing for any of them (domain/investigation/evidence-result). The
   * requester travels unchanged into the assembled request
   * (rules/investigation/collection-runs-in-the-requester-scope).
   */
  public async observeConcept(concept: string, subject: Subject, requester: string): Promise<ObservationOutcome> {
    const capability = await this.resolveCapability(concept);
    const rawConfiguration = await this.resolveConnectorConfiguration(capability.connector);
    const httpFields = asHttpConnectorCallConfiguration(capability.connector, rawConfiguration);
    const request = resolveConnectorRequest({ configuration: rawConfiguration, subject, requester });
    const call = await this.issueRequest(httpFields.method, request, capability.timeout);
    if (call.kind === 'timed-out') {
      return { result: 'timeout' };
    }
    return await outcomeFromResponse(capability, httpFields, call.response);
  }

  /**
   * Resolves the concept's capability, refusing with a typed error where
   * the registry no longer holds one — a race with whatever already
   * checked this before calling observe-concept, never one of the four
   * endings this port answers.
   */
  private async resolveCapability(concept: string): Promise<Capability> {
    const resolution = await this.capabilities.readCapability(concept);
    if (!resolution.held) {
      throw new CapabilityNotResolvedForObservationError(concept);
    }
    return resolution.capability;
  }

  /**
   * Resolves the connector's own opaque configuration payload, refusing
   * with a typed error where the connector-configuration registry holds
   * none for it — a registration bug, never one of the four endings this
   * port answers.
   */
  private async resolveConnectorConfiguration(connector: string): Promise<Readonly<Record<string, unknown>>> {
    const resolution = await this.connectorConfigurations.readConnectorConfiguration(connector);
    if (!resolution.held) {
      throw new ConnectorConfigurationNotRegisteredError(connector);
    }
    return resolution.configuration.configuration;
  }

  /**
   * Issues exactly one HTTP call (criterion 2), bounded by the capability's
   * own declared timeout and never a moment longer
   * (rules/investigation/collection-has-its-own-budget-within-the-total):
   * a client-side abort once that bound elapses is reported as timed-out
   * rather than propagated as a fault (criterion 6), and any other
   * rejection — a genuine network failure — propagates unmodified.
   */
  private async issueRequest(
    method: HttpMethod,
    request: AssembledConnectorRequest,
    timeoutMs: number,
  ): Promise<CallResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await this.httpClient(requestUrl(request), requestInit(method, request, controller.signal));
      return { kind: 'response', response };
    } catch (error) {
      if (controller.signal.aborted) {
        return { kind: 'timed-out' };
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

/** The URL one assembled request calls: the resolved address with every resolved query parameter appended. */
function requestUrl(request: AssembledConnectorRequest): string {
  const url = new URL(request.address);
  for (const [key, value] of Object.entries(request.query)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * The fetch call's own init: the connector's own declared method, its
 * resolved headers and its own AbortSignal, plus its resolved body where
 * the descriptor declared one — serialized as JSON text unless it already
 * is a plain string.
 */
function requestInit(method: HttpMethod, request: AssembledConnectorRequest, signal: AbortSignal): RequestInit {
  const init: RequestInit = { method, headers: { ...request.headers }, signal };
  if (request.body === undefined) {
    return init;
  }
  return { ...init, body: typeof request.body === 'string' ? request.body : JSON.stringify(request.body) };
}

/**
 * Classifies a received response by its own status, extracting and keying
 * the ok observation by the capability's own output_schema property names —
 * never by a field name taken from the response's own structure
 * (rules/integration/evidence-arrives-in-the-glossary-vocabulary,
 * constraints/evidence-normalization-is-an-anticorruption-layer). Every
 * status resolves to one of the four (criterion 5); only ok carries an
 * observation (criterion 4).
 */
async function outcomeFromResponse(
  capability: Capability,
  configuration: HttpConnectorCallConfiguration,
  response: Response,
): Promise<ObservationOutcome> {
  const ending = endingForStatus(configuration.statusMap, response.status);
  if (ending !== 'ok') {
    return { result: ending };
  }
  const body = await parsedBodyOrUndefined(response);
  const observation = observationOf(capability, configuration.responseMap, body);
  return { result: 'ok', observation: JSON.stringify(observation) };
}

/** The ending one HTTP status resolves to: the connector's own declared mapping where it names a value this adapter recognizes as one of the four, DEFAULT_STATUS_ENDING otherwise — never unclassified (criterion 5). */
function endingForStatus(statusMap: StatusEndingMap, status: number): EvidenceResult {
  const mapped = statusMap[String(status)];
  return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;
}

/**
 * Parses the response body as JSON, answering undefined rather than
 * throwing where it is not valid JSON — the same "absent is reported as
 * nothing found, never as a thrown fault" posture
 * response-path-extractor.ts's own extractResponseFields already keeps for
 * a path that does not resolve.
 */
async function parsedBodyOrUndefined(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/**
 * The ok observation: response-path-extractor.ts's own extraction over the
 * connector's own response map, filtered to exactly the calling
 * capability's own output_schema property names (citation-validation.ts's
 * own declaredFieldsOf, reused rather than re-derived per the inventory's
 * own must_not_duplicate entry for it) — never a field the response map
 * declared but the capability's own contract does not, and never one taken
 * verbatim from the response's own structure (criterion 9).
 */
function observationOf(capability: Capability, responseMap: ResponseFieldPaths, body: unknown): Record<string, unknown> {
  const extracted = extractResponseFields(responseMap, body);
  const declaredFields = declaredFieldsOf(capability.output_schema);
  return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));
}

/** A connector's own opaque call configuration, narrowed to the minimum HTTP-specific shape this adapter requires, as the type then knows it — the same "declared configuration" narrowing shape connector-request-resolver.ts's own DeclaredConnectorCallDescriptor already establishes for its own sibling refusal. */
type DeclaredHttpConnectorCallConfiguration = Readonly<Record<string, unknown>> & HttpConnectorCallConfiguration;

/** Narrows a connector's own opaque configuration payload to this adapter's own HttpConnectorCallConfiguration, refusing what departs from the minimum shape this adapter requires before any request is assembled. */
function asHttpConnectorCallConfiguration(
  connector: string,
  configuration: Readonly<Record<string, unknown>>,
): HttpConnectorCallConfiguration {
  refuseHttpConfigurationDepartures(connector, configuration);
  return { method: configuration.method, responseMap: configuration.responseMap, statusMap: configuration.statusMap };
}

/** Refuses a connector configuration that departs from the minimum HTTP-specific shape this adapter requires, narrowing it for every caller past this point. */
function refuseHttpConfigurationDepartures(
  connector: string,
  configuration: Readonly<Record<string, unknown>>,
): asserts configuration is DeclaredHttpConnectorCallConfiguration {
  const problems = httpConfigurationProblems(configuration);
  if (problems.length > 0) {
    throw new MalformedHttpConnectorConfigurationError(connector, problems);
  }
}

/** Every way one connector configuration departs from the minimum HTTP-specific shape, in terms a reader of the refusal can act on. */
function httpConfigurationProblems(configuration: Readonly<Record<string, unknown>>): string[] {
  const problems: string[] = [];
  if (!isHttpMethod(configuration.method)) {
    problems.push('method is not one of GET, POST, PUT, PATCH, DELETE');
  }
  if (!isStringRecord(configuration.responseMap)) {
    problems.push('responseMap is not a plain object of string values');
  }
  if (!isStatusEndingMap(configuration.statusMap)) {
    problems.push('statusMap is not a plain object mapping a status to one of ok, unavailable, denied, timeout');
  }
  return problems;
}

/** Whether a parsed value is one of the four evidence-result endings this adapter can produce. */
function isEvidenceResult(value: unknown): value is EvidenceResult {
  return typeof value === 'string' && (EVIDENCE_RESULTS as readonly string[]).includes(value);
}

/** Whether a parsed value is one of the HTTP methods this adapter is willing to issue. */
function isHttpMethod(value: unknown): value is HttpMethod {
  return typeof value === 'string' && (HTTP_METHODS as readonly string[]).includes(value);
}

/** Whether a parsed value is a non-null, non-array object — the only shape a declared responseMap or statusMap is read as. */
function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Whether a value is a plain object whose own values are all strings — the shape responseMap must take. */
function isStringRecord(value: unknown): value is Readonly<Record<string, string>> {
  return isPlainObject(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

/** Whether a value is a plain object whose own values are all one of the four evidence-result endings — the shape statusMap must take. */
function isStatusEndingMap(value: unknown): value is StatusEndingMap {
  return isPlainObject(value) && Object.values(value).every(isEvidenceResult);
}

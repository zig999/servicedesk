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
// four. Nor does it throw for any of the four presently-unresolvable
// conditions this task adds — a concept no registered capability currently
// answers, a concept more than one currently answers, a capability naming a
// connector no configuration is registered under, or a connector
// configuration that does not declare method, responseMap or statusMap
// (rules/integration/an-unresolvable-observation-ends-unavailable,
// rules/integration/an-http-connector-configuration-declares-its-call):
// each answers 'unavailable' with a result_detail naming the condition, and
// none of the four issues an HTTP call. Only a genuine unexpected fault — an
// unresolved request placeholder, or a network failure that is not this
// adapter's own timeout — still propagates as a rejection, the same
// convention evidence-collection-stage.ts's own raceObservation already
// documents and lets through uncaught.

import type { Capability } from '../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { ConnectorConfigurationResolution } from '../connector-registry/connector-configuration-registry.service.js';
import type { AssembledConnectorRequest } from '../http-connector/connector-call-descriptor.js';
import { issueConnectorHttpCall } from '../http-connector/connector-http-issuer.js';
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
import { DuplicateConceptAnswerError } from '../errors/duplicate-concept-answer.error.js';
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
 * What resolving one prerequisite step of observe-concept answers: the
 * value to proceed with, or the unavailable ObservationOutcome this adapter
 * answers in its place — never a thrown fault, for exactly the four
 * conditions this task names
 * (rules/integration/an-unresolvable-observation-ends-unavailable,
 * rules/integration/an-http-connector-configuration-declares-its-call).
 */
type Resolution<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly outcome: ObservationOutcome };

/**
 * The unavailable ending this adapter answers for one of its four
 * presently-unresolvable conditions, naming its cause by the raised error's
 * own class name — read from the error itself rather than restated as a
 * second literal, so result_detail can never drift from the class the
 * condition actually is
 * (rules/integration/an-unresolvable-observation-ends-unavailable,
 * rules/integration/an-http-connector-configuration-declares-its-call).
 */
function unavailableFor(error: Error): ObservationOutcome {
  return { result: 'unavailable', result_detail: error.name };
}

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
   * throwing for any of them (domain/investigation/evidence-result). Where
   * a concept resolves to no capability, to more than one, to a capability
   * naming an unregistered connector, or to a connector configuration that
   * does not declare method, responseMap or statusMap, this method answers
   * 'unavailable' with a result_detail naming the condition and issues no
   * call at all
   * (rules/integration/an-unresolvable-observation-ends-unavailable,
   * rules/integration/an-http-connector-configuration-declares-its-call).
   * The requester travels unchanged into the assembled request
   * (rules/investigation/collection-runs-in-the-requester-scope).
   */
  public async observeConcept(concept: string, subject: Subject, requester: string): Promise<ObservationOutcome> {
    const capabilityResolution = await this.resolveCapability(concept);
    if (!capabilityResolution.ok) {
      return capabilityResolution.outcome;
    }
    const capability = capabilityResolution.value;

    const configurationResolution = await this.resolveConnectorConfiguration(capability.connector);
    if (!configurationResolution.ok) {
      return configurationResolution.outcome;
    }
    const rawConfiguration = configurationResolution.value;

    const httpFieldsResolution = this.resolveHttpConnectorCallConfiguration(capability.connector, rawConfiguration);
    if (!httpFieldsResolution.ok) {
      return httpFieldsResolution.outcome;
    }
    const httpFields = httpFieldsResolution.value;

    const request = resolveConnectorRequest({ configuration: rawConfiguration, subject, requester });
    const call = await this.issueRequest(httpFields.method, request, capability.timeout);
    if (call.kind === 'timed-out') {
      return { result: 'timeout' };
    }
    return await outcomeFromResponse(capability, httpFields, call.response);
  }

  /**
   * Resolves the concept's capability: the unavailable ending naming
   * CapabilityNotResolvedForObservationError where the registry no longer
   * holds one for this concept — a race with whatever already checked this
   * before calling observe-concept — or naming DuplicateConceptAnswerError
   * where CapabilityRegistryService's own readCapability throws it for
   * answering the concept more than once
   * (rules/integration/one-capability-answers-one-concept). Neither reaches
   * the caller as a rejection here: this is the one call site of
   * readCapability that catches that throw and turns it into the ending
   * the port declares rather than letting it propagate
   * (rules/integration/an-unresolvable-observation-ends-unavailable).
   */
  private async resolveCapability(concept: string): Promise<Resolution<Capability>> {
    let resolution: CapabilityResolution;
    try {
      resolution = await this.capabilities.readCapability(concept);
    } catch (error) {
      if (error instanceof DuplicateConceptAnswerError) {
        return { ok: false, outcome: unavailableFor(error) };
      }
      throw error;
    }
    if (!resolution.held) {
      return { ok: false, outcome: unavailableFor(new CapabilityNotResolvedForObservationError(concept)) };
    }
    return { ok: true, value: resolution.capability };
  }

  /**
   * Resolves the connector's own opaque configuration payload: the
   * unavailable ending naming ConnectorConfigurationNotRegisteredError
   * where the connector-configuration registry holds none for it — a
   * registration bug, resolved as data rather than as a fault it raises
   * (rules/integration/an-unresolvable-observation-ends-unavailable).
   */
  private async resolveConnectorConfiguration(
    connector: string,
  ): Promise<Resolution<Readonly<Record<string, unknown>>>> {
    const resolution = await this.connectorConfigurations.readConnectorConfiguration(connector);
    if (!resolution.held) {
      return { ok: false, outcome: unavailableFor(new ConnectorConfigurationNotRegisteredError(connector)) };
    }
    return { ok: true, value: resolution.configuration.configuration };
  }

  /**
   * Narrows the connector's own opaque configuration to this adapter's own
   * HttpConnectorCallConfiguration through the module-level
   * asHttpConnectorCallConfiguration — unchanged and still thrown from,
   * since test-connector.controller.ts also calls it directly and still
   * needs its refusal to propagate — catching only the one throw this
   * method's own caller degrades to an ending: the unavailable ending
   * naming MalformedHttpConnectorConfigurationError
   * (rules/integration/an-http-connector-configuration-declares-its-call).
   */
  private resolveHttpConnectorCallConfiguration(
    connector: string,
    configuration: Readonly<Record<string, unknown>>,
  ): Resolution<HttpConnectorCallConfiguration> {
    try {
      return { ok: true, value: asHttpConnectorCallConfiguration(connector, configuration) };
    } catch (error) {
      if (error instanceof MalformedHttpConnectorConfigurationError) {
        return { ok: false, outcome: unavailableFor(error) };
      }
      throw error;
    }
  }

  /**
   * Issues exactly one HTTP call (criterion 2), bounded by the capability's
   * own declared timeout and never a moment longer
   * (rules/investigation/collection-has-its-own-budget-within-the-total):
   * a client-side abort once that bound elapses is reported as timed-out
   * rather than propagated as a fault (criterion 6), and any other
   * rejection — a genuine network failure — propagates unmodified. Delegates
   * to connector-http-issuer.ts's own issueConnectorHttpCall
   * (task/connector-diagnostics/test-connector-route), the same HTTP-issuance
   * mechanics this method always ran, extracted so the test-connector
   * diagnostic route can issue an identical call directly — this method's
   * own two-outcome CallResult and every behavior it produces are unchanged;
   * the elapsed time the extracted function additionally reports is simply
   * discarded here, since this adapter itself never reports timing.
   */
  private async issueRequest(
    method: HttpMethod,
    request: AssembledConnectorRequest,
    timeoutMs: number,
  ): Promise<CallResult> {
    const issued = await issueConnectorHttpCall({ method, request, timeoutMs, httpClient: this.httpClient });
    return issued.kind === 'timed-out' ? { kind: 'timed-out' } : { kind: 'response', response: issued.response };
  }
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

/**
 * Narrows a connector's own opaque configuration payload to this adapter's
 * own HttpConnectorCallConfiguration, refusing what departs from the
 * minimum shape this adapter requires before any request is assembled.
 * Exported (task/connector-diagnostics/test-connector-route) so the
 * test-connector diagnostic route can resolve the same HTTP method a real
 * observation would issue, from the same configuration, rather than
 * re-deriving this narrowing (MNT-03).
 */
export function asHttpConnectorCallConfiguration(
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

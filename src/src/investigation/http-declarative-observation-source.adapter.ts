import type { Capability } from '../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import {
  parsedConnectorConfiguration,
  type ConnectorConfigurationResolution,
} from '../connector-registry/connector-configuration-registry.service.js';
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
import { ConnectorPlaceholderNotResolvedError } from '../errors/connector-placeholder-not-resolved.error.js';
import { DuplicateConceptAnswerError } from '../errors/duplicate-concept-answer.error.js';
import { IncompleteConnectorCallDescriptorError } from '../errors/incomplete-connector-call-descriptor.error.js';
import { MalformedHttpConnectorConfigurationError } from '../errors/malformed-http-connector-configuration.error.js';
import { declaredFieldsOf } from './citation-validation.js';
import { EVIDENCE_RESULTS, type EvidenceResult } from './evidence-result.js';
import type { IObservationSource, ObservationOutcome, ObserveConceptOptions, Subject } from './observation-source.port.js';

export interface IConnectorConfigurationQuery {
  readConnectorConfiguration(connector: string): Promise<ConnectorConfigurationResolution>;
}

const DEFAULT_STATUS_ENDING: EvidenceResult = 'unavailable';

export type HttpDeclarativeObservationSourceOptions = {
  readonly capabilities: ICapabilityQuery;
  readonly connectorConfigurations: IConnectorConfigurationQuery;
  readonly httpClient?: typeof fetch;
};

type CallResult = { readonly kind: 'response'; readonly response: Response } | { readonly kind: 'timed-out' };

type Resolution<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly outcome: ObservationOutcome };

type PreparedCall = {
  readonly capability: Capability;
  readonly httpFields: HttpConnectorCallConfiguration;
  readonly request: AssembledConnectorRequest;
};

function unavailableFor(error: Error): ObservationOutcome {
  return { result: 'unavailable', result_detail: error.name };
}

function effectiveTimeoutMsFor(capability: Capability, remainingBudgetMs: number | undefined): number {
  return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout, remainingBudgetMs);
}

export class HttpDeclarativeObservationSource implements IObservationSource {
  private readonly capabilities: ICapabilityQuery;
  private readonly connectorConfigurations: IConnectorConfigurationQuery;
  private readonly httpClient: typeof fetch;

  public constructor(options: HttpDeclarativeObservationSourceOptions) {
    this.capabilities = options.capabilities;
    this.connectorConfigurations = options.connectorConfigurations;
    this.httpClient = options.httpClient ?? fetch;
  }

  public async observeConcept({ concept, subject, requester, remainingBudgetMs }: ObserveConceptOptions): Promise<ObservationOutcome> {
    const prepared = await this.resolvePreparedCall(concept, subject, requester);
    if (!prepared.ok) {
      return prepared.outcome;
    }
    const { capability, httpFields, request } = prepared.value;
    const timeoutMs = effectiveTimeoutMsFor(capability, remainingBudgetMs);
    const call = await this.issueRequest(httpFields.method, request, timeoutMs);
    if (call.kind === 'timed-out') {
      return { result: 'timeout' };
    }
    return await outcomeFromResponse(capability, httpFields, call.response);
  }

  private async resolvePreparedCall(
    concept: string,
    subject: Subject,
    requester: string,
  ): Promise<Resolution<PreparedCall>> {
    const capabilityResolution = await this.resolveCapability(concept);
    if (!capabilityResolution.ok) {
      return capabilityResolution;
    }
    const capability = capabilityResolution.value;

    const configurationResolution = await this.resolveConnectorConfiguration(capability.connector);
    if (!configurationResolution.ok) {
      return configurationResolution;
    }
    const rawConfiguration = configurationResolution.value;

    const httpFieldsResolution = this.resolveHttpConnectorCallConfiguration(capability.connector, rawConfiguration);
    if (!httpFieldsResolution.ok) {
      return httpFieldsResolution;
    }
    const httpFields = httpFieldsResolution.value;

    const requestResolution = this.resolveAssembledRequest(rawConfiguration, subject, requester);
    if (!requestResolution.ok) {
      return requestResolution;
    }
    return { ok: true, value: { capability, httpFields, request: requestResolution.value } };
  }

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

  private async resolveConnectorConfiguration(
    connector: string,
  ): Promise<Resolution<Readonly<Record<string, unknown>>>> {
    const resolution = await this.connectorConfigurations.readConnectorConfiguration(connector);
    if (!resolution.held) {
      return { ok: false, outcome: unavailableFor(new ConnectorConfigurationNotRegisteredError(connector)) };
    }
    return { ok: true, value: parsedConnectorConfiguration(resolution.configuration) };
  }

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

  private resolveAssembledRequest(
    configuration: Readonly<Record<string, unknown>>,
    subject: Subject,
    requester: string,
  ): Resolution<AssembledConnectorRequest> {
    try {
      return { ok: true, value: resolveConnectorRequest({ configuration, subject, requester }) };
    } catch (error) {
      if (error instanceof ConnectorPlaceholderNotResolvedError || error instanceof IncompleteConnectorCallDescriptorError) {
        return { ok: false, outcome: unavailableFor(error) };
      }
      throw error;
    }
  }

  private async issueRequest(
    method: HttpMethod,
    request: AssembledConnectorRequest,
    timeoutMs: number,
  ): Promise<CallResult> {
    const issued = await issueConnectorHttpCall({ method, request, timeoutMs, httpClient: this.httpClient });
    return issued.kind === 'timed-out' ? { kind: 'timed-out' } : { kind: 'response', response: issued.response };
  }
}

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

function endingForStatus(statusMap: StatusEndingMap, status: number): EvidenceResult {
  const mapped = statusMap[String(status)];
  return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;
}

async function parsedBodyOrUndefined(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function observationOf(capability: Capability, responseMap: ResponseFieldPaths, body: unknown): Record<string, unknown> {
  const extracted = extractResponseFields(responseMap, body);
  const declaredFields = declaredFieldsOf(capability.output_schema);
  return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));
}

type DeclaredHttpConnectorCallConfiguration = Readonly<Record<string, unknown>> & HttpConnectorCallConfiguration;

export function asHttpConnectorCallConfiguration(
  connector: string,
  configuration: Readonly<Record<string, unknown>>,
): HttpConnectorCallConfiguration {
  refuseHttpConfigurationDepartures(connector, configuration);
  return { method: configuration.method, responseMap: configuration.responseMap, statusMap: configuration.statusMap };
}

function refuseHttpConfigurationDepartures(
  connector: string,
  configuration: Readonly<Record<string, unknown>>,
): asserts configuration is DeclaredHttpConnectorCallConfiguration {
  const problems = httpConfigurationProblems(configuration);
  if (problems.length > 0) {
    throw new MalformedHttpConnectorConfigurationError(connector, problems);
  }
}

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

function isEvidenceResult(value: unknown): value is EvidenceResult {
  return typeof value === 'string' && (EVIDENCE_RESULTS as readonly string[]).includes(value);
}

function isHttpMethod(value: unknown): value is HttpMethod {
  return typeof value === 'string' && (HTTP_METHODS as readonly string[]).includes(value);
}

function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Readonly<Record<string, string>> {
  return isPlainObject(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

function isStatusEndingMap(value: unknown): value is StatusEndingMap {
  return isPlainObject(value) && Object.values(value).every(isEvidenceResult);
}

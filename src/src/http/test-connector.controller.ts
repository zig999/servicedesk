import type { Capability } from '../capability-registry/capability.js';
import type { CapabilityIdentityResolution } from '../capability-registry/capability-registry.service.js';
import {
  parsedConnectorConfiguration,
  type ConnectorConfigurationResolution,
} from '../connector-registry/connector-configuration-registry.service.js';
import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
import { orphanedPlaceholders } from '../connector-registry/connector-placeholder-declaration-check.js';
import type { AssembledConnectorRequest } from '../http-connector/connector-call-descriptor.js';
import { connectorRequestUrl, issueConnectorHttpCall } from '../http-connector/connector-http-issuer.js';
import { resolveConnectorRequest } from '../http-connector/connector-request-resolver.js';
import type { HttpMethod } from '../http-connector/http-connector-call-configuration.js';
import { CapabilityConnectorMismatchError } from '../errors/capability-connector-mismatch.error.js';
import { CapabilityNotRegisteredForTestError } from '../errors/capability-not-registered-for-test.error.js';
import { ConnectorCallAddressNotAbsoluteUrlError } from '../errors/connector-call-address-not-absolute-url.error.js';
import { ConnectorConfigurationNotFoundError } from '../errors/connector-configuration-not-found.error.js';
import { ConnectorUnreachableError } from '../errors/connector-unreachable.error.js';
import { asHttpConnectorCallConfiguration } from '../investigation/http-declarative-observation-source.adapter.js';
import { buildSubject, type Subject } from '../investigation/subject.js';
import type { TestConnectorRequestDto, TestConnectorResponseDto } from './dto/test-connector.dto.js';

const REDACTED_CREDENTIAL_MARKER = '***REDACTED***';

export type TestConnectorControllerDependencies = {
  readonly readCapabilityByIdentity: (name: string, version: string) => Promise<CapabilityIdentityResolution>;
  readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfigurationResolution>;
  readonly httpClient: typeof fetch;
};

export async function handleTestConnectorRequest(
  dependencies: TestConnectorControllerDependencies,
  body: TestConnectorRequestDto,
): Promise<TestConnectorResponseDto> {
  const capability = await resolveTestedCapability(dependencies, body);
  const configuration = await resolveTestedConnectorConfiguration(dependencies, body.connector);
  const httpFields = asHttpConnectorCallConfiguration(body.connector, configuration.parsed);
  const subject = buildSubject(body.subject.type, body.subject.attributes);
  const { issued, echoed } = resolveTestRequests(configuration.parsed, subject, body.requester);
  const response = await issueOutcome({
    httpClient: dependencies.httpClient,
    method: httpFields.method,
    request: issued,
    timeoutMs: capability.timeout,
    connector: body.connector,
  });
  const orphanedPlaceholderNames = orphanedPlaceholders(configuration.raw.configuration, capability.input_schema);
  return {
    request: requestEcho(httpFields.method, echoed),
    response,
    orphaned_placeholders: orphanedPlaceholderNames,
  };
}

type ResolvedTestRequests = {
  readonly issued: AssembledConnectorRequest;
  readonly echoed: AssembledConnectorRequest;
};

function resolveTestRequests(
  configuration: Readonly<Record<string, unknown>>,
  subject: Subject,
  requester: string,
): ResolvedTestRequests {
  const issued = resolveConnectorRequest({ configuration, subject, requester });
  const echoed = resolveConnectorRequest({ configuration, subject, requester, env: redactingEnv() });
  requireResolvedAddressIsAbsoluteUrl(echoed);
  return { issued, echoed };
}

function requireResolvedAddressIsAbsoluteUrl(request: AssembledConnectorRequest): void {
  try {
    connectorRequestUrl(request);
  } catch (error) {
    throw new ConnectorCallAddressNotAbsoluteUrlError(request.address, { cause: error });
  }
}

async function resolveTestedCapability(
  dependencies: TestConnectorControllerDependencies,
  body: TestConnectorRequestDto,
): Promise<Capability> {
  const resolution = await dependencies.readCapabilityByIdentity(body.capability.name, body.capability.version);
  if (!resolution.held) {
    throw new CapabilityNotRegisteredForTestError(resolution.name, resolution.version);
  }
  if (resolution.capability.connector !== body.connector) {
    throw new CapabilityConnectorMismatchError(resolution.capability.connector, body.connector);
  }
  return resolution.capability;
}

type ResolvedTestConnectorConfiguration = {
  readonly raw: ConnectorConfiguration;
  readonly parsed: Readonly<Record<string, unknown>>;
};

async function resolveTestedConnectorConfiguration(
  dependencies: TestConnectorControllerDependencies,
  connector: string,
): Promise<ResolvedTestConnectorConfiguration> {
  const resolution = await dependencies.readConnectorConfiguration(connector);
  if (!resolution.held) {
    throw new ConnectorConfigurationNotFoundError(connector);
  }
  return { raw: resolution.configuration, parsed: parsedConnectorConfiguration(resolution.configuration) };
}

function redactingEnv(): NodeJS.ProcessEnv {
  return new Proxy({} as NodeJS.ProcessEnv, { get: () => REDACTED_CREDENTIAL_MARKER });
}

type IssueOutcomeOptions = {
  readonly httpClient: typeof fetch;
  readonly method: HttpMethod;
  readonly request: AssembledConnectorRequest;
  readonly timeoutMs: number;
  readonly connector: string;
};

async function issueOutcome(options: IssueOutcomeOptions): Promise<TestConnectorResponseDto['response']> {
  const { httpClient, method, request, timeoutMs, connector } = options;
  const startedAt = Date.now();
  try {
    const issued = await issueConnectorHttpCall({ method, request, timeoutMs, httpClient });
    return issued.kind === 'timed-out'
      ? { kind: 'timed-out', elapsedMs: issued.elapsedMs }
      : await responseOutcome(issued.response, issued.elapsedMs);
  } catch (error) {
    return unreachableOutcome(connector, error, Date.now() - startedAt);
  }
}

function unreachableOutcome(connector: string, cause: unknown, elapsedMs: number): TestConnectorResponseDto['response'] {
  const error = new ConnectorUnreachableError(connector, { cause });
  return {
    kind: 'unreachable',
    error: { code: error.name, message: error.message, details: error.context },
    elapsedMs,
  };
}

async function responseOutcome(response: Response, elapsedMs: number): Promise<TestConnectorResponseDto['response']> {
  return {
    kind: 'response',
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await rawBody(response),
    elapsedMs,
  };
}

async function rawBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === '') {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function requestEcho(method: HttpMethod, request: AssembledConnectorRequest): TestConnectorResponseDto['request'] {
  return {
    method,
    address: connectorRequestUrl(request),
    headers: request.headers,
    body: request.body,
  };
}

// Maps one validated test-connector request to a direct exercise of a
// registered capability's own connector
// (task/connector-diagnostics/test-connector-route,
// contracts/integration/connector-diagnostics,
// rules/integration/a-connector-configuration-is-tested-through-a-registered-capability):
// resolves the named capability by its own identity, refusing one that is
// not registered (criterion 3) or whose own connector does not match the
// connector the request named (criterion 4); assembles the outbound request
// through connector-request-resolver.ts's own resolveConnectorRequest from
// the request's own subject and the named connector's own configuration —
// exactly the translation a real observation uses (criterion 2) — and
// issues it once through connector-http-issuer.ts's own
// issueConnectorHttpCall, the same HTTP-issuance mechanics
// http-declarative-observation-source.adapter.ts uses internally, extracted
// so this controller can call it directly rather than duplicating it
// (MNT-03). Writes nothing of its own: no store, no evidence, no citation
// (criterion 6) — every dependency this controller calls is a read, and the
// HTTP client issues one call that is never persisted anywhere by this
// module. Receives every dependency as an interface or a function value
// (ARC-01); constructs none of them itself (ARC-02) — build-app.factory.ts's
// own composeResources is where every one of them is built, reusing the
// same CapabilityRegistryService and ConnectorConfigurationRegistryService
// instances every sibling registry route already shares.
//
// The subject this operation examines is assembled from the request's own
// type and attribute-values alone, through subject.ts's own buildSubject —
// never read back from a store (criterion 5, contracts/integration/connector-diagnostics's
// own "never a stored subject read back, because nothing in this system
// stores one").
//
// The echoed request masks any value a `${credential:...}` placeholder
// resolved to: resolveConnectorRequest is called a second time with a
// redacting environment substitute, so the real secret a connector's own
// configuration would otherwise read from process.env never reaches this
// diagnostic operation's own response — this project's own standard (SEC-03,
// SEC-04) forbids a credential reaching a client response, and no
// specification node or task criterion states that this diagnostic
// operation's echoed request must carry the real credential value rather
// than a marker standing in for it, so this is this controller's own
// inference over an otherwise-silent point. The actual call this route
// issues still uses the real, unredacted resolution — the credential
// travels to the external system exactly as a real observation's would;
// only what is reported back is masked.

import type { Capability } from '../capability-registry/capability.js';
import type { CapabilityIdentityResolution } from '../capability-registry/capability-registry.service.js';
import type { ConnectorConfigurationResolution } from '../connector-registry/connector-configuration-registry.service.js';
import type { AssembledConnectorRequest } from '../http-connector/connector-call-descriptor.js';
import { connectorRequestUrl, issueConnectorHttpCall } from '../http-connector/connector-http-issuer.js';
import { resolveConnectorRequest } from '../http-connector/connector-request-resolver.js';
import type { HttpMethod } from '../http-connector/http-connector-call-configuration.js';
import { CapabilityConnectorMismatchError } from '../errors/capability-connector-mismatch.error.js';
import { CapabilityNotRegisteredForTestError } from '../errors/capability-not-registered-for-test.error.js';
import { ConnectorConfigurationNotFoundError } from '../errors/connector-configuration-not-found.error.js';
import { asHttpConnectorCallConfiguration } from '../investigation/http-declarative-observation-source.adapter.js';
import { buildSubject } from '../investigation/subject.js';
import type { TestConnectorRequestDto, TestConnectorResponseDto } from './dto/test-connector.dto.js';

/** The marker substituted for any resolved `${credential:...}` placeholder in the echoed request, never the real value (SEC-03, SEC-04). */
const REDACTED_CREDENTIAL_MARKER = '***REDACTED***';

/** Everything the controller needs beyond one request's own body: the two registry reads it resolves against, and the HTTP client to issue the real call through. */
export type TestConnectorControllerDependencies = {
  readonly readCapabilityByIdentity: (name: string, version: string) => Promise<CapabilityIdentityResolution>;
  readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfigurationResolution>;
  readonly httpClient: typeof fetch;
};

/**
 * Handles one test-connector request end to end (criteria 1, 2, 5, 6):
 * resolves and validates the named capability and connector (criteria 3,
 * 4), assembles the outbound request from the request's own subject, issues
 * it once, and answers the raw request sent (credential-redacted) and the
 * raw outcome received.
 */
export async function handleTestConnectorRequest(
  dependencies: TestConnectorControllerDependencies,
  body: TestConnectorRequestDto,
): Promise<TestConnectorResponseDto> {
  const capability = await resolveTestedCapability(dependencies, body);
  const configuration = await resolveTestedConnectorConfiguration(dependencies, body.connector);
  const httpFields = asHttpConnectorCallConfiguration(body.connector, configuration);
  const subject = buildSubject(body.subject.type, body.subject.attributes);
  const issuedRequest = resolveConnectorRequest({ configuration, subject, requester: body.requester });
  const echoedRequest = resolveConnectorRequest({ configuration, subject, requester: body.requester, env: redactingEnv() });
  const response = await issueOutcome({
    httpClient: dependencies.httpClient,
    method: httpFields.method,
    request: issuedRequest,
    timeoutMs: capability.timeout,
  });
  return { request: requestEcho(httpFields.method, echoedRequest), response };
}

/** Resolves the named capability by its own identity, refusing one that is not registered (criterion 3) or whose own connector does not match the connector the request named (criterion 4). */
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

/** Resolves the named connector's own opaque call configuration, refusing where the registry holds none for it. */
async function resolveTestedConnectorConfiguration(
  dependencies: TestConnectorControllerDependencies,
  connector: string,
): Promise<Readonly<Record<string, unknown>>> {
  const resolution = await dependencies.readConnectorConfiguration(connector);
  if (!resolution.held) {
    throw new ConnectorConfigurationNotFoundError(connector);
  }
  return resolution.configuration.configuration;
}

/** An env substitute answering every credential placeholder's own lookup with the redaction marker rather than a real secret value, so resolveConnectorRequest's own substitution mechanism produces a redacted echo without this module re-deriving it (MNT-03). */
function redactingEnv(): NodeJS.ProcessEnv {
  return new Proxy({} as NodeJS.ProcessEnv, { get: () => REDACTED_CREDENTIAL_MARKER });
}

/** What one issueOutcome call takes, bundled as an object (MNT-01's own parameter bound). */
type IssueOutcomeOptions = {
  readonly httpClient: typeof fetch;
  readonly method: HttpMethod;
  readonly request: AssembledConnectorRequest;
  readonly timeoutMs: number;
};

/** Issues the resolved request once, answering the raw response (criterion 1), a timeout, or the raw error — each carrying the elapsed time of the call actually made. */
async function issueOutcome(options: IssueOutcomeOptions): Promise<TestConnectorResponseDto['response']> {
  const { httpClient, method, request, timeoutMs } = options;
  const startedAt = Date.now();
  try {
    const issued = await issueConnectorHttpCall({ method, request, timeoutMs, httpClient });
    return issued.kind === 'timed-out'
      ? { kind: 'timed-out', elapsedMs: issued.elapsedMs }
      : await responseOutcome(issued.response, issued.elapsedMs);
  } catch (error) {
    return { kind: 'error', message: errorMessage(error), elapsedMs: Date.now() - startedAt };
  }
}

/** The raw outcome for a call that reached the network: its own status, headers and parsed-or-raw body, exactly as received (criterion 1) — never reclassified into an evidence-result ending. */
async function responseOutcome(response: Response, elapsedMs: number): Promise<TestConnectorResponseDto['response']> {
  return {
    kind: 'response',
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await rawBody(response),
    elapsedMs,
  };
}

/** The response body as received: parsed JSON where the text is syntactically valid JSON, its raw text otherwise — never thrown for an unparseable body, and undefined for an empty one. */
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

/** A thrown value's own message where it is an Error, its string form otherwise — never a stack trace or internal detail (SEC-04). */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The raw request actually assembled, credential-redacted: method, resolved address (query merged in, exactly as issued — connector-http-issuer.ts's own connectorRequestUrl, reused rather than re-derived, MNT-03), headers and body. */
function requestEcho(method: HttpMethod, request: AssembledConnectorRequest): TestConnectorResponseDto['request'] {
  return {
    method,
    address: connectorRequestUrl(request),
    headers: request.headers,
    body: request.body,
  };
}

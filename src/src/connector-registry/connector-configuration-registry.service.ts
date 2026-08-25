import { ConnectorConfigurationNotFoundError } from '../errors/connector-configuration-not-found.error.js';
import { ConnectorConfigurationNotWellFormedError } from '../errors/connector-configuration-not-well-formed.error.js';
import { IncompleteConnectorConfigurationError } from '../errors/incomplete-connector-configuration.error.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from './connector-configuration.js';
import type { IConnectorConfigurationStore } from './connector-configuration-store.port.js';

/**
 * What resolving a connector against the registry answers: its
 * configuration exactly as registered, or its absence stated as data —
 * never an invented configuration and never an error, since a connector no
 * registration has yet reached is an ordinary answer of a resolution, the
 * same shape capability-query.port.ts's own CapabilityResolution already
 * holds for the capability registry.
 */
export type ConnectorConfigurationResolution =
  | { readonly held: true; readonly configuration: ConnectorConfiguration }
  | { readonly held: false; readonly connector: string };

/**
 * The connector-configuration registry's two operations: register-connector
 * holds one connector's own call configuration — refusing a registration
 * that declares neither a connector identity nor a well-formed
 * configuration payload before anything is written — and
 * read-connector-configuration is the one lookup from a connector identity
 * to the configuration currently registered for it. Persistence reaches it
 * only through the store port
 * (constraints/the-domain-depends-on-no-infrastructure), so this module
 * stays importable without any infrastructure. Mirrors
 * capability-registry.service.ts's own shape — validate before write,
 * replace by identity — per the inventory's own must_not_duplicate entry
 * for that pattern.
 */
export class ConnectorConfigurationRegistryService {
  public constructor(private readonly store: IConnectorConfigurationStore) {}

  /**
   * register-connector: refuses a registration that departs from the
   * minimum shape this registry requires, or whose configuration text is
   * not well-formed
   * (rules/integration/a-connector-configuration-holds-a-well-formed-object,
   * task/connector-configuration-authoring/register-connector-route), before
   * any write. The rest is held — a re-registration under an already-held
   * connector identity replaces the row it holds, since one connector
   * configuration is identified by its connector value alone.
   */
  public async registerConnector(
    registration: ConnectorConfigurationRegistration,
  ): Promise<ConnectorConfiguration> {
    const configuration = heldConfiguration(registration);
    const held = await this.store.readConnectorConfigurations();
    const kept = held.filter((candidate) => candidate.connector !== configuration.connector);
    await this.store.writeConnectorConfigurations([...kept, configuration]);
    return configuration;
  }

  /**
   * read-connector-configuration: resolves one connector identity to the
   * configuration currently registered for it — read through the store on
   * every call, never remembered — answering the absence as data where no
   * held configuration answers that connector.
   */
  public async readConnectorConfiguration(connector: string): Promise<ConnectorConfigurationResolution> {
    const held = await this.store.readConnectorConfigurations();
    const configuration = held.find((candidate) => candidate.connector === connector);
    return configuration === undefined ? { held: false, connector } : { held: true, configuration };
  }

  /**
   * read-connector-configuration's own service-level wrapper
   * (rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused,
   * task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation):
   * resolves through readConnectorConfiguration above and raises
   * ConnectorConfigurationNotFoundError once it has read that method's own
   * `held: false` answer, rather than leaving that held-check-and-throw to
   * read-connector-configuration.controller.ts's own
   * handleReadConnectorConfigurationRequest. Called only from that one
   * route's own dependencies wiring (build-app.factory.ts's own
   * composeResources); readConnectorConfiguration above is unchanged in
   * signature and keeps answering the miss as ordinary data for every other
   * consumer that reads it directly — test-connector.controller.ts's own
   * resolveTestedConnectorConfiguration and
   * http-declarative-observation-source.adapter.ts's own
   * resolveConnectorConfiguration among them — so neither is forced through
   * this class.
   */
  public async readConnectorConfigurationOrThrow(connector: string): Promise<ConnectorConfiguration> {
    const resolution = await this.readConnectorConfiguration(connector);
    if (!resolution.held) {
      throw new ConnectorConfigurationNotFoundError(resolution.connector);
    }
    return resolution.configuration;
  }

  /**
   * list-connector-configurations
   * (contracts/integration/connector-configuration-registry): every
   * connector configuration currently registered, whole — read through the
   * store on every call, never remembered — paginated per
   * src/types/pagination.ts. The store answers every registration it holds
   * in one read with no pagination of its own
   * (connector-configuration-store.port.ts's own readConnectorConfigurations,
   * the same operation registerConnector and readConnectorConfiguration
   * already call above), so the offset/limit window and the total are both
   * computed here, in memory, over that full array — mirroring
   * capability-registry.service.ts's own listCapabilities exactly, which
   * takes the identical approach over its own store's identical
   * read-everything method rather than adding a second store-port method
   * that would answer the same question. A registry holding no
   * configurations answers the same way: slicing an empty array yields an
   * empty page (data: [], total: 0), never an error.
   */
  public async listConnectorConfigurations(
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<ConnectorConfiguration>> {
    const held = await this.store.readConnectorConfigurations();
    const total = held.length;
    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pageCountOf(total, pagination.limit),
    };
  }
}

/**
 * The page count this limit divides total into (API-03) — 0 for a
 * non-positive limit, since dividing by it would answer no page count a
 * caller could page through at all; neither this task's own criteria nor
 * src/types/pagination.ts states what a non-positive limit answers, so this
 * is this service's own defensive floor, the same inference
 * capability-registry.service.ts's own pageCountOf already made for its
 * identical listing shape.
 *
 * Restated here rather than imported (MNT-03 divergence, disclosed):
 * capability-registry.service.ts's own pageCountOf is a private, unexported
 * function of a sibling registry service, and that module's own header
 * comment already discloses making the identical choice for the identical
 * reason — exporting it across a service-to-service boundary, or lifting it
 * into a new shared module, is a change this task's own file set does not
 * reach and would widen it beyond what list-connector-configurations-route
 * was cut to do.
 */
function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

/** A registration that declared the minimum required shape, as the type then knows it. */
type DeclaredRegistration = ConnectorConfigurationRegistration & {
  readonly connector: string;
  readonly configuration: Readonly<Record<string, unknown>>;
};

/**
 * Holds one registration to the minimum shape this registry requires,
 * refusing what departs from it, and answers the configuration as the
 * registry will hold it. The well-formedness check runs first
 * (wellFormedConfiguration), since it is what turns this route's own
 * configuration text into the plain object the completeness check below,
 * and the registry itself, both expect.
 */
function heldConfiguration(registration: ConnectorConfigurationRegistration): ConnectorConfiguration {
  const resolved: ConnectorConfigurationRegistration = {
    connector: registration.connector,
    configuration: wellFormedConfiguration(registration.configuration),
  };
  refuseRegistrationDepartures(resolved);
  return { connector: resolved.connector, configuration: resolved.configuration };
}

/**
 * Resolves a registration's configuration to the plain object the
 * completeness check below and the registry both expect, before that check
 * ever runs. A value already given as an object — undeclared, null, an
 * array, or a genuine plain object — passes through unchanged, exactly as
 * this registry always held it. A value given as a string is this route's
 * own wire representation of configuration text
 * (task/connector-configuration-authoring/register-connector-route): parsed
 * as JSON here, refusing it before any write where it fails JSON.parse or
 * parses to something other than a plain object — not an array, not a
 * primitive
 * (rules/integration/a-connector-configuration-holds-a-well-formed-object)
 * — the same discipline capability-registry.service.ts's own
 * refuseMalformedSchemas holds for a capability's two schema strings,
 * extended here with the object-shape check this rule additionally
 * requires.
 */
function wellFormedConfiguration(configuration: unknown): unknown {
  if (typeof configuration !== 'string') {
    return configuration;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(configuration);
  } catch {
    throw new ConnectorConfigurationNotWellFormedError('configuration is not syntactically valid JSON');
  }
  if (!isPlainObject(parsed)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration does not parse to a JSON object');
  }
  return parsed;
}

/**
 * Refuses a registration that departs from the minimum shape this registry
 * requires: an undeclared connector identity, or a configuration payload
 * that is not a plain object. What that payload itself must contain to
 * reach any particular external system is left entirely to the connector it
 * names — domain/investigation/subject states a connector "resolves
 * internally ... which of the attributes it needs" — so nothing here reads
 * or constrains a key inside it.
 */
function refuseRegistrationDepartures(
  registration: ConnectorConfigurationRegistration,
): asserts registration is DeclaredRegistration {
  const problems = registrationProblems(registration);
  if (problems.length > 0) {
    throw new IncompleteConnectorConfigurationError(problems);
  }
}

/** Every way one registration departs from the minimum required shape, in terms a reader of the refusal can act on. */
function registrationProblems(registration: ConnectorConfigurationRegistration): string[] {
  const problems: string[] = [];
  if (isUndeclared(registration.connector)) {
    problems.push('connector is undeclared');
  }
  if (!isPlainObject(registration.configuration)) {
    problems.push('configuration is not a plain object');
  }
  return problems;
}

/** Whether the connector identity was left undeclared — absent and empty alike, since an empty identity names nothing. */
function isUndeclared(value: string | undefined): boolean {
  return value === undefined || value === '';
}

/** Whether a value is a plain, non-null, non-array object — the one shape a configuration payload must take (TYP-02's own narrowing-guard rule for the type assertion refuseRegistrationDepartures makes). */
function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

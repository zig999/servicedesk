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
  readonly configuration: string;
};

/**
 * Holds one registration to the minimum shape this registry requires,
 * refusing what departs from it, and answers the configuration as the
 * registry will hold it — JSON object text
 * (domain/integration/connector-configuration), never the parsed object.
 * The well-formedness check runs first (wellFormedConfiguration), since it
 * is what resolves this registration's own configuration — supplied as
 * that text or as the object it parses to — to the text form the
 * completeness check below, and the registry itself, both now expect.
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
 * Resolves a registration's configuration to the JSON object text the
 * completeness check below and the registry both now hold and answer it as
 * (domain/integration/connector-configuration, rules/integration/a-connector-configuration-holds-a-well-formed-object
 * — "a registration may supply the configuration as that text or as the
 * object it parses to, and the registry holds and answers it as text either
 * way"). A value given as a string is held exactly as supplied once it is
 * confirmed to parse to a plain object — not an array, not a primitive —
 * refusing it before any write where it fails JSON.parse or parses to
 * anything else. A value given as a genuine plain object is re-serialized to
 * that same text form (JSON.stringify) before being held. A value given
 * already as null or an array is refused here too
 * (task/connector-configuration-registration-conformance/malformed-object-classification):
 * the node's own statement that the configuration "must be ... a well-formed
 * JSON object" makes null and an array not-well-formed exactly as an
 * unparsable text is, never merely incomplete — and unlike text, JSON.parse
 * never runs over either to raise that refusal on its own, so this function
 * raises it directly. Undeclared and every other primitive (a number, a
 * boolean, a bare string once it has already failed the string branch above)
 * pass through unchanged for the completeness check below to catch, exactly
 * as this registry always did for a registration missing this shape — the
 * node does not clearly decide whether an entirely absent configuration is
 * malformed or incomplete, so that case is left exactly where it already
 * stood.
 */
function wellFormedConfiguration(configuration: unknown): unknown {
  if (typeof configuration === 'string') {
    return textConfigurationOrThrow(configuration);
  }
  if (isPlainObject(configuration)) {
    return JSON.stringify(configuration);
  }
  if (configuration === null || Array.isArray(configuration)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration is not a JSON object');
  }
  return configuration;
}

/** Parses one candidate configuration text to confirm it is syntactically valid JSON that parses to a plain object, refusing it otherwise, and answers the text itself unchanged once confirmed — never the parsed value, since the registry holds text (rules/integration/a-connector-configuration-holds-a-well-formed-object). */
function textConfigurationOrThrow(configuration: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configuration);
  } catch {
    throw new ConnectorConfigurationNotWellFormedError('configuration is not syntactically valid JSON');
  }
  if (!isPlainObject(parsed)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration does not parse to a JSON object');
  }
  return configuration;
}

/**
 * Parses one held connector configuration's own JSON object text back into
 * the plain object a connector's own call needs to derive its request — the
 * one seam between this registry's own text representation
 * (domain/integration/connector-configuration,
 * rules/integration/a-connector-configuration-holds-a-well-formed-object)
 * and every consumer that must derive an HTTP call from it rather than read
 * it back as is. Exported so http-declarative-observation-source.adapter.ts's
 * own resolveConnectorConfiguration and test-connector.controller.ts's own
 * resolveTestedConnectorConfiguration both call this rather than each
 * JSON.parse-ing the held text a second time (MNT-03). Never throws for a
 * configuration this registry itself holds: the text was already confirmed
 * to parse to a plain object before it was ever written
 * (textConfigurationOrThrow above). The isPlainObject guard below is a
 * defensive floor for a value this method's own invariant says can never
 * fail it (TYP-02's own narrowing-guard rule for the type assertion this
 * parse would otherwise be) — no specification node states what a corrupted
 * persisted row answers, so raising the same well-formedness error the write
 * side already raises is this function's own inference over that silence,
 * never a path a passing registration reaches.
 */
export function parsedConnectorConfiguration(
  configuration: ConnectorConfiguration,
): Readonly<Record<string, unknown>> {
  const parsed: unknown = JSON.parse(configuration.configuration);
  if (!isPlainObject(parsed)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration does not parse to a JSON object');
  }
  return parsed;
}

/**
 * Refuses a registration that departs from the minimum shape this registry
 * requires: an undeclared connector identity, or a configuration payload
 * that did not resolve to held JSON object text (wellFormedConfiguration
 * above — a value given as a string or a genuine plain object resolves to
 * that text; null and an array are already refused there as
 * ConnectorConfigurationNotWellFormedError and never reach this check;
 * undeclared and every other primitive reach this check unchanged and are
 * refused here as incomplete). What that payload itself must contain to
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
  if (typeof registration.configuration !== 'string') {
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

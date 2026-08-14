import { IncompleteConnectorConfigurationError } from '../errors/incomplete-connector-configuration.error.js';
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
   * minimum shape this registry requires, before any write. The rest is
   * held — a re-registration under an already-held connector identity
   * replaces the row it holds, since one connector configuration is
   * identified by its connector value alone.
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
}

/** A registration that declared the minimum required shape, as the type then knows it. */
type DeclaredRegistration = ConnectorConfigurationRegistration & {
  readonly connector: string;
  readonly configuration: Readonly<Record<string, unknown>>;
};

/**
 * Holds one registration to the minimum shape this registry requires,
 * refusing what departs from it, and answers the configuration as the
 * registry will hold it.
 */
function heldConfiguration(registration: ConnectorConfigurationRegistration): ConnectorConfiguration {
  refuseRegistrationDepartures(registration);
  return { connector: registration.connector, configuration: registration.configuration };
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

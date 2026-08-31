import type { ConnectorConfiguration } from './connector-configuration.js';

/**
 * The port through which the connector-configuration registry's
 * registrations reach their persistence. Nothing under the domain layer —
 * case behavior, investigation factory, evaluation, vocabulary — imports
 * this port, its persistence driver, or any HTTP client package directly
 * (constraints/the-domain-depends-on-no-infrastructure); infrastructure
 * implements it in persistence/, the same separation
 * capability-store.port.ts already holds for the capability registry.
 */
export interface IConnectorConfigurationStore {
  /** Answers every connector configuration the registry holds, exactly as persisted. */
  readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]>;

  /**
   * Upserts each given configuration into the registry's persisted store,
   * by its own connector identity: creates a connector fresh or replaces
   * whatever configuration already answered to it in place, never by
   * deleting a row (task/connector-configuration-write-upsert-hotfix) — a
   * connector this call does not name is left exactly as it stood.
   */
  writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>;
}

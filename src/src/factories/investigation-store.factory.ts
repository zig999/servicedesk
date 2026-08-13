import type { IInvestigationStore } from '../investigation/investigation-store.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../persistence/relational-investigation-store.repository.js';

/**
 * Wires the investigation store: the relational adapter behind the
 * investigation module's own port
 * (rules/investigation/an-investigation-is-written-once), built from the one
 * connection this composition shares (task/service-on-the-database/store-wiring)
 * rather than a data-directory path — the same convention createCaseStore
 * already keeps for its own store.
 */
export function createInvestigationStore(connection: DatabaseConnection): IInvestigationStore {
  return new RelationalInvestigationStore(connection);
}

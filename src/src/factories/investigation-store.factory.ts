import type { IInvestigationStore } from '../investigation/investigation-store.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../persistence/relational-investigation-store.repository.js';

export function createInvestigationStore(connection: DatabaseConnection): IInvestigationStore {
  return new RelationalInvestigationStore(connection);
}

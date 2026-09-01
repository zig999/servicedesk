import type { ICaseStore } from '../case/case-store.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalCaseStore } from '../persistence/relational-case-store.repository.js';

export function createCaseStore(connection: DatabaseConnection): ICaseStore {
  return new RelationalCaseStore(connection);
}

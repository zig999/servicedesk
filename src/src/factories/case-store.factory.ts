import type { ICaseStore } from '../case/case-store.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalCaseStore } from '../persistence/relational-case-store.repository.js';

/**
 * Wires the case store: the relational adapter behind the case module's own
 * port, built from the one connection every store of this composition
 * shares (task/service-on-the-database/store-wiring) rather than a
 * data-directory path — no directory of its own is read or written here.
 * No published query is wired here — composing this store with structural
 * and coherence validation into the knowledge context's published
 * read-case (contracts/knowledge/case-query) is case-query.factory.ts's own.
 */
export function createCaseStore(connection: DatabaseConnection): ICaseStore {
  return new RelationalCaseStore(connection);
}

import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { GlossaryService } from '../glossary/glossary.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalGlossaryStore } from '../persistence/relational-glossary-store.repository.js';

/**
 * Wires the glossary module: the relational adapter behind the domain's
 * port, built from the one connection this composition shares
 * (task/service-on-the-database/store-wiring) rather than a data-directory
 * path — no directory of its own is read or written here.
 */
export function createGlossary(connection: DatabaseConnection): GlossaryService {
  return new GlossaryService(new RelationalGlossaryStore(connection));
}

/**
 * Wires the published glossary-query contract
 * (contracts/glossary/glossary-query) over the same relational holding.
 * What the caller receives is the contract alone, so an in-process consumer
 * reads the glossary without depending on the service or the store behind it.
 */
export function createGlossaryQuery(connection: DatabaseConnection): IGlossaryQuery {
  return createGlossary(connection);
}

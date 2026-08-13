import type { IAuthorCaseVersion } from '../case/author-case-version.port.js';
import { AuthorCaseVersionService } from '../case/author-case-version.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createCaseStore } from './case-store.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

/**
 * Wires the knowledge context's published author-case-version
 * (contracts/knowledge/author-case-version): the relational case store,
 * composed with the published glossary-query and capability-query reads
 * (contracts/glossary/glossary-query,
 * contracts/integration/capability-registry) into the one service that
 * submits a case version whole, exactly the same three leaf factories
 * case-query.factory.ts's own createCaseQuery already composes for reading.
 * All three leaf factories this one composes are given the same connection
 * (task/service-on-the-database/store-wiring's own "every record ... comes
 * from the same connection"), never a data directory of their own, so this
 * factory's caller supplies one connection rather than three directories.
 */
export function createAuthorCaseVersion(connection: DatabaseConnection): IAuthorCaseVersion {
  return new AuthorCaseVersionService(
    createCaseStore(connection),
    createGlossaryQuery(connection),
    createCapabilityQuery(connection),
  );
}

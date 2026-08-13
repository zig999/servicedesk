import type { ICaseQuery } from '../case/case-query.port.js';
import { CaseQueryService } from '../case/case-query.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createCaseStore } from './case-store.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

/**
 * Wires the knowledge context's published read-case
 * (contracts/knowledge/case-query): the relational case store, composed
 * with the published glossary-query and capability-query reads
 * (contracts/glossary/glossary-query,
 * contracts/integration/capability-registry) into the one service that
 * answers a case validated whole at the moment of reading. All three leaf
 * factories this one composes are given the same connection
 * (task/service-on-the-database/store-wiring's own "every record ... comes
 * from the same connection"), never a data directory of their own, so this
 * factory's caller supplies one connection rather than three directories.
 */
export function createCaseQuery(connection: DatabaseConnection): ICaseQuery {
  return new CaseQueryService(
    createCaseStore(connection),
    createGlossaryQuery(connection),
    createCapabilityQuery(connection),
  );
}

import type { ICaseQuery } from '../case/case-query.port.js';
import { CaseQueryService } from '../case/case-query.service.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createCaseStore } from './case-store.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

/**
 * Wires the knowledge context's published read-case
 * (contracts/knowledge/case-query): the file-backed case store behind
 * constraints/a-case-is-stored-as-one-json-document, composed with the
 * published glossary-query and capability-query reads
 * (contracts/glossary/glossary-query,
 * contracts/integration/capability-registry) into the one service that
 * answers a case validated whole at the moment of reading. Each dependency
 * keeps its own data directory, the same way each of the three leaf
 * factories this one composes already does, so a deployment naming three
 * separate directories or the same one three times is this factory's
 * caller to decide, never this module's to assume.
 */
export function createCaseQuery(
  caseDataDirectory: string,
  glossaryDataDirectory: string,
  capabilityDataDirectory: string,
): ICaseQuery {
  return new CaseQueryService(
    createCaseStore(caseDataDirectory),
    createGlossaryQuery(glossaryDataDirectory),
    createCapabilityQuery(capabilityDataDirectory),
  );
}

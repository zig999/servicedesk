import type { ICaseInputRequirementsQuery } from '../case/case-input-requirements.port.js';
import { CaseQueryService } from '../case/case-query.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createCaseStore } from './case-store.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

export function createCaseInputRequirementsQuery(connection: DatabaseConnection): ICaseInputRequirementsQuery {
  return new CaseQueryService(
    createCaseStore(connection),
    createGlossaryQuery(connection),
    createCapabilityQuery(connection),
  );
}

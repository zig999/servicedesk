import type { IConceptUsageReader } from '../glossary/concept-usage-reader.port.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { GlossaryService } from '../glossary/glossary.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalGlossaryStore } from '../persistence/relational-glossary-store.repository.js';

const NO_CONCEPT_NAMED: IConceptUsageReader = {
  readConceptUsage: () => Promise.resolve({ named: false }),
};

export function createGlossary(
  connection: DatabaseConnection,
  conceptUsageReader: IConceptUsageReader = NO_CONCEPT_NAMED,
): GlossaryService {
  return new GlossaryService(new RelationalGlossaryStore(connection), conceptUsageReader);
}

export function createGlossaryQuery(connection: DatabaseConnection): IGlossaryQuery {
  return createGlossary(connection);
}

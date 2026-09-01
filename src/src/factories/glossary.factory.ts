import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { GlossaryService } from '../glossary/glossary.service.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalGlossaryStore } from '../persistence/relational-glossary-store.repository.js';

export function createGlossary(connection: DatabaseConnection): GlossaryService {
  return new GlossaryService(new RelationalGlossaryStore(connection));
}

export function createGlossaryQuery(connection: DatabaseConnection): IGlossaryQuery {
  return createGlossary(connection);
}

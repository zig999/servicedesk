import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { GlossaryService } from '../glossary/glossary.service.js';
import { FileGlossaryStore } from '../persistence/file-glossary-store.repository.js';

/**
 * Wires the glossary module: the file-backed store behind the domain's port.
 * The data directory is the caller's to choose, so no data path is written
 * in source.
 */
export function createGlossary(dataDirectory: string): GlossaryService {
  return new GlossaryService(new FileGlossaryStore(dataDirectory));
}

/**
 * Wires the published glossary-query contract
 * (contracts/glossary/glossary-query) over the same file-backed holding.
 * What the caller receives is the contract alone, so an in-process consumer
 * reads the glossary without depending on the service or the store behind it.
 */
export function createGlossaryQuery(dataDirectory: string): IGlossaryQuery {
  return createGlossary(dataDirectory);
}

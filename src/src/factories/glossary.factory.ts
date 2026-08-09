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

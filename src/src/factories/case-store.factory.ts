import type { ICaseStore } from '../case/case-store.port.js';
import { FileCaseStore } from '../persistence/file-case-store.repository.js';

/**
 * Wires the case store: the file-backed store behind the case module's
 * port. The data directory is the caller's to choose, so no data path is
 * written in source. No published query is wired here — composing this
 * store with structural and coherence validation into the knowledge
 * context's published read-case (contracts/knowledge/case-query) is a
 * later task's to build.
 */
export function createCaseStore(dataDirectory: string): ICaseStore {
  return new FileCaseStore(dataDirectory);
}

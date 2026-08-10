import type { IInvestigationStore } from '../investigation/investigation-store.port.js';
import { FileInvestigationStore } from '../persistence/file-investigation-store.repository.js';

/**
 * Wires the investigation store: the file-backed store behind the
 * investigation module's own port
 * (rules/investigation/an-investigation-is-written-once). The data
 * directory is the caller's to choose, so no data path is written in
 * source — the same convention createCaseStore already keeps for its own
 * store.
 */
export function createInvestigationStore(dataDirectory: string): IInvestigationStore {
  return new FileInvestigationStore(dataDirectory);
}

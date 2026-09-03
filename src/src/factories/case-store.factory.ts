import type { ICaseStore } from '../case/case-store.port.js';
import type { IHypothesisRevisionOverwrite } from '../case/hypothesis-revision-overwrite.port.js';
import type { IHighestRevisionReleaseStateQuery } from '../case/hypothesis-revision-release-state.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalCaseStore } from '../persistence/relational-case-store.repository.js';

export type CaseStore = ICaseStore & IHighestRevisionReleaseStateQuery & IHypothesisRevisionOverwrite;

export function createCaseStore(connection: DatabaseConnection): CaseStore {
  return new RelationalCaseStore(connection);
}

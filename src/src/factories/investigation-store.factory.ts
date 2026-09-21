import type { IEvidenceUsageReader } from '../capability-registry/evidence-usage-reader.port.js';
import type { IInvestigationStore } from '../investigation/investigation-store.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../persistence/relational-investigation-store.repository.js';

export function createInvestigationStore(connection: DatabaseConnection): IInvestigationStore {
  return new RelationalInvestigationStore(connection);
}

export function createEvidenceUsageReader(connection: DatabaseConnection): IEvidenceUsageReader {
  const store = new RelationalInvestigationStore(connection);
  return {
    isCapabilityNamedByEvidence: (identity) => store.isCapabilityNamedByEvidence(identity.name, identity.version),
  };
}

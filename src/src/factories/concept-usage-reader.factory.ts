import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { ConceptUsageResolution, IConceptUsageReader } from '../glossary/concept-usage-reader.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { RelationalCaseStore } from '../persistence/relational-case-store.repository.js';
import { RelationalInvestigationStore } from '../persistence/relational-investigation-store.repository.js';

type ConceptUsageSources = {
  readonly capabilityQuery: ICapabilityQuery;
  readonly investigationStore: RelationalInvestigationStore;
  readonly caseStore: RelationalCaseStore;
};

export function createConceptUsageReader(
  connection: DatabaseConnection,
  capabilityQuery: ICapabilityQuery,
): IConceptUsageReader {
  const sources: ConceptUsageSources = {
    capabilityQuery,
    investigationStore: new RelationalInvestigationStore(connection),
    caseStore: new RelationalCaseStore(connection),
  };
  return { readConceptUsage: (concept) => resolveConceptUsage(concept, sources) };
}

async function resolveConceptUsage(concept: string, sources: ConceptUsageSources): Promise<ConceptUsageResolution> {
  const capability = await sources.capabilityQuery.readCapability(concept);
  if (capability.held) {
    return { named: true, reference: 'capability' };
  }
  if (await sources.investigationStore.isConceptNamedByEvidence(concept)) {
    return { named: true, reference: 'evidence' };
  }
  if (await sources.investigationStore.isConceptNamedByCitation(concept)) {
    return { named: true, reference: 'citation' };
  }
  if (await sources.caseStore.isConceptCollectedByHypothesisRevision(concept)) {
    return { named: true, reference: 'hypothesis-revision-collects' };
  }
  return { named: false };
}

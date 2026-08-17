import type { CreatedDraft, ICreateDraft } from '../case/create-draft.operation.js';
import { CreateDraftOperation } from '../case/create-draft.operation.js';
import { discardCaseVersion } from '../case/discard.operation.js';
import {
  placeHypothesis,
  removeHypothesis,
  type RemoveHypothesisInput,
} from '../case/manifest-composition.operations.js';
import { ReleaseOperation } from '../case/release.operation.js';
import type { IRelease } from '../case/release.operation.js';
import type { RevisedHypothesis, ReviseHypothesisInput } from '../case/revise-hypothesis.operation.js';
import { ReviseHypothesisOperation } from '../case/revise-hypothesis.operation.js';
import type { CreateDraftInput, PlaceHypothesisInput } from '../case/case-store.port.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createCaseStore } from './case-store.factory.js';
import { createGlossaryQuery } from './glossary.factory.js';

/**
 * The one callable surface every case-lifecycle operation is reachable
 * through, the way author-case-version.factory.ts once exposed the one
 * retired command it replaced (contracts/knowledge/case-lifecycle,
 * task/case-lifecycle-operations/wire-and-retire-author-case-version's own
 * criterion 1) — six operations rather than one, since no single command
 * still stands for a curator to submit a case version whole.
 */
export type CaseLifecycleOperations = {
  readonly createDraft: (input: CreateDraftInput) => Promise<CreatedDraft>;
  readonly reviseHypothesis: (input: ReviseHypothesisInput) => Promise<RevisedHypothesis>;
  readonly placeHypothesis: (input: PlaceHypothesisInput) => Promise<void>;
  readonly removeHypothesis: (input: RemoveHypothesisInput) => Promise<void>;
  readonly release: (slug: string, version: number) => Promise<void>;
  readonly discard: (slug: string, version: number) => Promise<void>;
};

/**
 * Wires the knowledge context's six published case-lifecycle operations
 * (contracts/knowledge/case-lifecycle): the relational case store, composed
 * with the published glossary-query and capability-query reads
 * (contracts/glossary/glossary-query, contracts/integration/capability-registry)
 * exactly the way case-query.factory.ts and the retired
 * author-case-version.factory.ts already composed the same three leaf
 * factories, into the one callable surface a curator's caller constructs and
 * calls — no HTTP route is wired here, since the task's own scope excludes
 * one. Every leaf factory this one composes is given the same connection
 * (task/service-on-the-database/store-wiring's own "every record ... comes
 * from the same connection"), never a data directory of its own, and this
 * factory constructs nothing beyond wiring those already-built leaves and the
 * operations' own classes and functions (case-query.factory.ts's own "A
 * composition root ... constructs nothing on its own behalf beyond wiring
 * already-built leaf factories from one shared DatabaseConnection").
 */
export function createCaseLifecycle(connection: DatabaseConnection): CaseLifecycleOperations {
  const caseStore = createCaseStore(connection);
  const glossary = createGlossaryQuery(connection);
  const capabilities = createCapabilityQuery(connection);
  const createDraftOperation: ICreateDraft = new CreateDraftOperation(caseStore);
  const reviseHypothesisOperation = new ReviseHypothesisOperation(caseStore, glossary);
  const releaseOperation: IRelease = new ReleaseOperation(caseStore, glossary, capabilities);
  return {
    createDraft: (input) => createDraftOperation.createDraft(input),
    reviseHypothesis: (input) => reviseHypothesisOperation.reviseHypothesis(input),
    placeHypothesis: (input) => placeHypothesis(caseStore, input),
    removeHypothesis: (input) => removeHypothesis(caseStore, input),
    release: (slug, version) => releaseOperation.release(slug, version),
    discard: (slug, version) => discardCaseVersion(caseStore, slug, version),
  };
}

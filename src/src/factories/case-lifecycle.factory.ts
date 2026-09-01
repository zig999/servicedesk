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

export type CaseLifecycleOperations = {
  readonly createDraft: (input: CreateDraftInput) => Promise<CreatedDraft>;
  readonly reviseHypothesis: (input: ReviseHypothesisInput) => Promise<RevisedHypothesis>;
  readonly placeHypothesis: (input: PlaceHypothesisInput) => Promise<void>;
  readonly removeHypothesis: (input: RemoveHypothesisInput) => Promise<void>;
  readonly release: (slug: string, version: number) => Promise<void>;
  readonly discard: (slug: string, version: number) => Promise<void>;
};

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

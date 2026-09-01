import type { Investigation } from './investigation.js';

export type StoredInvestigation = {
  readonly document: unknown;
  readonly hash: string;
};

export interface IInvestigationStore {

  write(investigation: Investigation): Promise<void>;

  read(id: string): Promise<StoredInvestigation | undefined>;
}

import type { OverwriteHypothesisRevisionInput } from './case-store.port.js';

export interface IHypothesisRevisionOverwrite {

  overwriteHypothesisRevision(input: OverwriteHypothesisRevisionInput): Promise<void>;
}

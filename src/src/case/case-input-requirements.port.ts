import type { CaseInputRequirementsResult } from './case-input-requirements.js';

export interface ICaseInputRequirementsQuery {

  readCaseInputRequirements(slug: string, version: number): Promise<CaseInputRequirementsResult>;
}

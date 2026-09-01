import type { Referral } from '../case/case.js';
import type { ConsolidationRegister } from './consolidation-register.js';
import type { Usage } from './usage.js';

export type Assessment = {

  readonly outcome: string;

  readonly referral: Referral;

  readonly determining_hypothesis?: string;

  readonly text: string;

  readonly register: ConsolidationRegister;

  readonly usage: Usage;

  readonly elapsed_ms: number;

  readonly prompt: string;
};

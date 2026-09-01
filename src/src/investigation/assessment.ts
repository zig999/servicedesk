import type { Referral } from '../case/case.js';

export type Assessment = {

  readonly outcome: string;

  readonly referral: Referral;

  readonly determining_hypothesis?: string;

  readonly text: string;
};

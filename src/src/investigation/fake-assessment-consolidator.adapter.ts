import type { ConsolidationOutcome, IAssessmentConsolidator } from './assessment-consolidator.port.js';
import type { ConsolidationRegister } from './consolidation-register.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Usage } from './usage.js';

const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens: 0 };

const ZEROED_ELAPSED_MS = 0;

const PLACEHOLDER_PROMPT = '';

type ConsolidateCall = {
  readonly evaluations: readonly Evaluation[];
  readonly evidence: readonly Evidence[];
  readonly consolidationRegister: ConsolidationRegister;
};

export class FakeAssessmentConsolidator implements IAssessmentConsolidator {
  private readonly fixtures = new Map<string, string>();

  public seed(call: ConsolidateCall, text: string): void {
    this.fixtures.set(fixtureKey(call), text);
  }

  public async consolidate(
    evaluations: readonly Evaluation[],
    evidence: readonly Evidence[],
    consolidationRegister: ConsolidationRegister,
  ): Promise<ConsolidationOutcome> {
    const key = fixtureKey({ evaluations, evidence, consolidationRegister });
    const text = this.fixtures.get(key);
    if (text === undefined) {
      throw new Error(`FakeAssessmentConsolidator has no fixture seeded for this evaluations/evidence/register call: ${key}`);
    }
    return { text, register: consolidationRegister, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS, prompt: PLACEHOLDER_PROMPT };
  }
}

function fixtureKey(call: ConsolidateCall): string {
  return JSON.stringify(call);
}

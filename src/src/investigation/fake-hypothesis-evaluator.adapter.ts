import type {
  CaseContext,
  EvaluationOutcome,
  EvidenceItem,
  IHypothesisEvaluator,
} from './hypothesis-evaluator.port.js';
import type { Usage } from './usage.js';

const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens: 0 };

const ZEROED_ELAPSED_MS = 0;

export class FakeHypothesisEvaluator implements IHypothesisEvaluator {
  private readonly fixtures = new Map<string, EvaluationOutcome>();

  public seed(criterion: string, outcome: EvaluationOutcome): void {
    this.fixtures.set(criterion, outcome);
  }

  public async evaluate(
    criterion: string,
    _evidence: readonly EvidenceItem[],
    _caseContext: CaseContext,
  ): Promise<EvaluationOutcome> {
    const outcome = this.fixtures.get(criterion);
    if (outcome === undefined) {
      throw new Error(`FakeHypothesisEvaluator has no fixture seeded for criterion ${JSON.stringify(criterion)}`);
    }
    return { ...outcome, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS };
  }
}

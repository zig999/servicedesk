import type {
  CaseSimulationDetailPanelProps,
  SimulationEvaluation,
  SimulationEvidenceItem,
  SimulationHypothesisRevisionSummary,
  SimulationJudgmentCall,
} from "./case-simulation-detail-types";

export function testEvidenceItem(
  overrides: Partial<SimulationEvidenceItem> = {},
): SimulationEvidenceItem {
  return {
    concept: "Balance",
    result: "ok",
    elapsedMs: 120,
    observation: JSON.stringify({ balance: 42 }),
    capabilityName: "translate-text",
    capabilityVersion: "1.0.0",
    connector: "deepl-connector",
    ...overrides,
  };
}

export function testCalledJudgment(
  overrides: Partial<Extract<SimulationJudgmentCall, { called: true }>> = {},
): SimulationJudgmentCall {
  return {
    called: true,
    model: "gpt-4",
    promptVersion: "v2",
    usage: { inputTokens: 100, outputTokens: 50 },
    elapsedMs: 800,
    prompt: "SYSTEM: judge the hypothesis\nUSER: here is the evidence",
    ...overrides,
  };
}

export function testHypothesisRevision(
  overrides: Partial<SimulationHypothesisRevisionSummary> = {},
): SimulationHypothesisRevisionSummary {
  return {
    criterion: "The customer's balance is overdue by more than 30 days.",
    collects: ["Balance"],
    ...overrides,
  };
}

export function testEvaluation(
  overrides: Partial<SimulationEvaluation> = {},
): SimulationEvaluation {
  return {
    hypothesis: "Overdue balance",
    verdict: "confirmed",
    citations: [{ concept: "Balance", field: "amount" }],
    judgmentCall: testCalledJudgment(),
    ...overrides,
  };
}

export function testPanelProps(
  overrides: Partial<CaseSimulationDetailPanelProps> = {},
): CaseSimulationDetailPanelProps {
  return {
    hypothesisRevision: testHypothesisRevision(),
    evaluation: testEvaluation(),
    evidence: [testEvidenceItem()],
    rawResponse: { hypothesis: "Overdue balance", verdict: "confirmed" },
    ...overrides,
  };
}

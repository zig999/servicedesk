import type {
  CaseSimulationDetailPanelProps,
  SimulationEvaluation,
  SimulationEvidenceItem,
  SimulationHypothesisRevisionSummary,
  SimulationJudgmentCall,
} from "./case-simulation-detail-types";

/**
 * Shared fixtures for task/simulation-cockpit/detail-panel's own proof -- one full-fidelity
 * value per type this region reads, overridable per test, mirroring this app's own established
 * test-support convention (e.g. connector-test-panel.test-support.ts's own
 * testCapability/testConnectorResult).
 *
 * flatten-detail-evidence-capability-reference (a corrective increment): testEvidenceItem's own
 * capability/connector default now carries capabilityName, capabilityVersion and connector as
 * three flat fields, matching SimulationEvidenceItem's own corrected shape -- SimulationCapabilityReference
 * and the testCapability() helper that built it are both removed; neither has a nested slot left
 * to build for, since this type nests nothing.
 */

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

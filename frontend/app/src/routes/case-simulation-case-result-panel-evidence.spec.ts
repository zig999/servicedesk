import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import type { CaseResultRun } from "./case-simulation-case-result-types";
import type { SimulateEvidenceItem } from "../hooks/use-simulate-case";

function evidenceItem(overrides: Partial<SimulateEvidenceItem> = {}): SimulateEvidenceItem {
  return {
    concept: "balance",
    inputs: "{}",
    observation: "{}",
    observed_at: "2024-01-01T00:00:00.000Z",
    ttl: 60,
    origin: "live",
    result: "ok",
    capability_name: "get-balance",
    capability_version: "1",
    elapsed_ms: 10,
    capability_payload_notes: "",
    fields: [],
    concept_description: "",
    ...overrides,
  };
}

function makeRun(overrides: Partial<CaseResultRun> = {}): CaseResultRun {
  return {
    id: "run-1",
    ranAt: "2024-01-01T00:00:00.000Z",
    outcome: "resolved",
    referral: { action: "notify", recipient: "customer" },
    text: "Thanks for reaching out.",
    register: "formal",
    hypotheses: [],
    stale: false,
    durations: { collectionMs: 100, judgmentMs: 200, writingMs: 50, totalMs: 350 },
    cost: { calls: 1, inputTokens: 100, outputTokens: 50 },
    consolidationCall: {
      called: true,
      usage: { inputTokens: 100, outputTokens: 50 },
      elapsedMs: 50,
      prompt: "prompt",
    },
    rawResponse: { evidence: [] },
    ...overrides,
  };
}

describe("CaseSimulationCaseResultPanel -- the Evidence tab presents the shown run's own evidence (criteria 1 and 5)", () => {
  it("presents one entry for each evidence item the shown run's own record collected, and shows an earlier run's own evidence in place of it once that run is shown", () => {
    render(
      createElement(CaseSimulationCaseResultPanel, {
        runs: [
          makeRun({
            id: "run-1",
            rawResponse: { evidence: [evidenceItem({ concept: "earlier-run-concept" })] },
          }),
          makeRun({
            id: "run-2",
            rawResponse: {
              evidence: [
                evidenceItem({ concept: "later-run-concept-a" }),
                evidenceItem({ concept: "later-run-concept-b" }),
              ],
            },
          }),
        ],
      }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "Evidence" }));

    expect(screen.getByText("later-run-concept-a")).toBeTruthy();
    expect(screen.getByText("later-run-concept-b")).toBeTruthy();
    expect(screen.queryByText("earlier-run-concept")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show run #1" }));

    expect(screen.getByText("earlier-run-concept")).toBeTruthy();
    expect(screen.queryByText("later-run-concept-a")).toBeNull();
    expect(screen.queryByText("later-run-concept-b")).toBeNull();
  });
});

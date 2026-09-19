import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultJsonTab } from "./case-simulation-case-result-json-tab";
import type { SimulateCaseResult, SimulateEvidenceItem } from "../hooks/use-simulate-case";

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
    ...overrides,
  };
}

function caseResult(overrides: Partial<SimulateCaseResult> = {}): SimulateCaseResult {
  return {
    evidence: [evidenceItem()],
    evaluations: [
      {
        hypothesis: "hypothesis-a",
        verdict: "confirmed",
        citations: [{ concept: "balance", field: "balance" }],
      },
    ],
    assessment: {
      outcome: "resolved",
      referral: { action: "notify", recipient: "customer" },
      determining_hypothesis: "hypothesis-a",
      text: "The disputed charge was authorized.",
      register: "formal",
      usage: { input_tokens: 200, output_tokens: 90 },
      elapsed_ms: 950,
      prompt: "consolidate the assessment",
    },
    cost: { calls: 1, input_tokens: 200, output_tokens: 90 },
    durations: { collection: 1200, judgment: 800, writing: 300, total: 2300 },
    ...overrides,
  };
}

describe("CaseSimulationCaseResultJsonTab -- a raw, whole view of the shown run's payload (criteria 1, 2, 3)", () => {
  it("renders the whole simulate-case payload -- evidence, evaluations, assessment, cost and durations together -- exactly as received, with no field dropped or renamed", () => {
    const payload = caseResult();

    render(createElement(CaseSimulationCaseResultJsonTab, { rawResponse: payload }));

    expect(
      screen.getByText(JSON.stringify(payload, null, 2), { normalizer: (text) => text }),
    ).toBeTruthy();
  });
});

describe("CaseSimulationCaseResultJsonTab -- the consolidation prompt is carried whole and never masked (rules/investigation/a-presented-consolidation-prompt-is-shown-whole)", () => {
  it("shows assessment.prompt exactly as received even where it contains text shaped like the credential-placeholder pattern masked elsewhere in the payload", () => {
    const base = caseResult();
    const prompt =
      "SYSTEM: consolidate the case.\nNEVER echo a resolved secret, such as ${credential:api-key}, back to the caller.";
    const payload = { ...base, assessment: { ...base.assessment, prompt } };

    render(createElement(CaseSimulationCaseResultJsonTab, { rawResponse: payload }));

    expect(
      screen.getByText(JSON.stringify(payload, null, 2), { normalizer: (text) => text }),
    ).toBeTruthy();
  });
});

describe("CaseSimulationCaseResultJsonTab -- only a resolved credential's own value is masked, and nothing else (criteria 4, 5, 6; rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked)", () => {
  it("replaces every occurrence of a resolved credential value with the fixed text ***REDACTED***, whichever credential and however long, keeps the inputs field itself and leaves every other evidence item, field and payload section untouched -- including an item with no such value and one recorded with empty inputs", () => {
    const base = caseResult();
    const withRepeatedPlaceholder =
      '{"authorization":"Bearer ${credential:api-key}","retry":"${credential:api-key}"}';
    const withLongerPlaceholder = '{"token":"${credential:a-very-long-connector-secret-name}"}';
    const withoutPlaceholder = '{"account":"12345"}';

    const payload = {
      ...base,
      evidence: [
        evidenceItem({ concept: "billing", inputs: withRepeatedPlaceholder }),
        evidenceItem({ concept: "identity", inputs: withLongerPlaceholder }),
        evidenceItem({ concept: "balance", inputs: withoutPlaceholder }),
        evidenceItem({ concept: "history", inputs: "" }),
      ],
    };

    const expectedPayload = {
      ...payload,
      evidence: [
        {
          ...payload.evidence[0],
          inputs: '{"authorization":"Bearer ***REDACTED***","retry":"***REDACTED***"}',
        },
        { ...payload.evidence[1], inputs: '{"token":"***REDACTED***"}' },
        payload.evidence[2],
        payload.evidence[3],
      ],
    };

    render(createElement(CaseSimulationCaseResultJsonTab, { rawResponse: payload }));

    expect(
      screen.getByText(JSON.stringify(expectedPayload, null, 2), { normalizer: (text) => text }),
    ).toBeTruthy();
  });
});

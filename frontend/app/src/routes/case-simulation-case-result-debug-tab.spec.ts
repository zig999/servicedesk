import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultDebugTab } from "./case-simulation-case-result-debug-tab";
import type {
  CaseResultConsolidationCall,
  SimulationConsolidationRegister,
} from "./case-simulation-case-result-types";

function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function calledCall(
  overrides: Partial<Extract<CaseResultConsolidationCall, { called: true }>> = {},
): Extract<CaseResultConsolidationCall, { called: true }> {
  return {
    called: true as const,
    usage: { inputTokens: 1, outputTokens: 1 },
    elapsedMs: 1,
    prompt: "prompt",
    ...overrides,
  };
}

describe("CaseSimulationCaseResultDebugTab -- the consolidation prompt shown whole (criterion 2)", () => {
  it("renders the consolidation call's own prompt exactly as carried, with no masking or truncation", () => {
    const prompt =
      "SYSTEM: write the final answer.\nCASE REGISTER: formal\nCREDENTIAL=sk-not-a-real-secret-1234567890\nEVIDENCE: balance = 42.";

    render(
      createElement(CaseSimulationCaseResultDebugTab, {
        consolidationCall: calledCall({ prompt }),
        register: "formal",
      }),
    );

    const promptElement = screen.getByText(prompt, { normalizer: (text) => text });
    expect(promptElement.textContent).toBe(prompt);
  });
});

describe("CaseSimulationCaseResultDebugTab -- the consolidation call's own usage and duration (criteria 3, 4)", () => {
  it("renders exactly the consolidation call's own input token count, output token count and elapsed_ms", () => {
    render(
      createElement(CaseSimulationCaseResultDebugTab, {
        consolidationCall: calledCall({
          usage: { inputTokens: 123, outputTokens: 456 },
          elapsedMs: 789,
        }),
        register: "formal",
      }),
    );

    const line = normalized(screen.getByText(/tokens in/));
    expect(line).toContain("123 tokens in");
    expect(line).toContain("456 tokens out");
    expect(line).toContain("789 ms");
  });
});

describe("CaseSimulationCaseResultDebugTab -- the register the call actually used (criterion 5)", () => {
  it.each<SimulationConsolidationRegister>(["formal", "plain"])(
    "renders %s exactly when that is the register the call actually used",
    (register) => {
      render(
        createElement(CaseSimulationCaseResultDebugTab, {
          consolidationCall: calledCall(),
          register,
        }),
      );

      const line = normalized(screen.getByText(/^Register /));
      expect(line).toContain(`Register ${register}`);
    },
  );
});

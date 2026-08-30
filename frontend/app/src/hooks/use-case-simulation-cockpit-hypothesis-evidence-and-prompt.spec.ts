import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { useCaseSimulationCockpit } from "./use-case-simulation-cockpit";
import { CaseSimulationDetailPanel } from "../routes/case-simulation-detail-panel";
import {
  SIMULATE_CASE_PATH,
  confirmedCaseEvaluation,
  createWrapper,
  jsonResponse,
  makeSubjectReady,
  record,
  simulateCaseResult,
  simulateHypothesisPath,
  stubFetch,
} from "./use-case-simulation-cockpit.test-support";

// task/simulation-detail-hypothesis-hotfix/wire-hypothesis-evidence-and-prompt (a corrective
// increment): proves the fix through the real, composed hook -- the way a browser session
// actually reaches it -- rather than only through the pure adapters it calls. The first describe
// block below is this task's own reproduction, made concrete: a single-hypothesis simulation
// whose response carries real evidence and a real prompt previously left both the Evidence tab
// and the Prompt tab empty/placeholder; this test dispatches that exact kind of response and
// mounts the real CaseSimulationDetailPanel with what the hook now hands it, so a regression back
// to the old behavior fails here at the rendered tab, not only in a prop's shape.
//
// The second and third describe blocks prove criterion 6 (a full-case run's own evidence and raw
// response reach the Detail panel exactly as before) directly against the hook's own `detail`
// computation, since the branch that decides which evidence a case-sourced selection reads
// (use-case-simulation-cockpit.ts's own `selectedEvaluation.source === "case" && lastCaseResult`
// check) lives in this file, not in the panel or its tabs -- CaseSimulationDetailPanel itself
// cannot tell a case-sourced evaluation from a hypothesis-sourced one, so only a test against this
// hook can show that branch still picks the run's own evidence rather than the newly-added
// per-evaluation field.

const SLUG = "acme-widgets";
const VERSION = 7;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseSimulationCockpit -- this task's own reproduction: a single-hypothesis response carrying real evidence and a real prompt (criteria 1 and 3)", () => {
  it("reaches the Detail panel's Evidence tab and Prompt tab with that response's own real content, not the empty/placeholder state the bug left behind", async () => {
    const prompt = "SYSTEM: judge hypothesis-a\nUSER: here is the billing history";
    stubFetch({
      [simulateHypothesisPath(SLUG, VERSION)]: () =>
        jsonResponse({
          evidence: [
            {
              concept: "billing-history",
              inputs: "{}",
              observation: "the account shows one authorized charge",
              observed_at: "2026-08-01T00:00:00.000Z",
              ttl: 3600,
              origin: "billing-connector",
              result: "ok",
              capability_name: "fetch-billing-account",
              capability_version: "1",
              elapsed_ms: 120,
            },
          ],
          evaluation: {
            hypothesis: "hypothesis-a",
            verdict: "confirmed",
            citations: [{ concept: "billing-history", field: "observation" }],
            usage: { input_tokens: 12, output_tokens: 34 },
            elapsed_ms: 567,
            prompt,
          },
          durations: { collection: 400, judgment: 300, total: 700 },
        }),
    });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateHypothesis("hypothesis-a");
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSelectHypothesis("hypothesis-a");
    });

    const detail = result.current.detail;
    if (!detail) {
      throw new Error(
        "use-case-simulation-cockpit-hypothesis-evidence-and-prompt proof: expected a detail to be selected",
      );
    }

    render(createElement(CaseSimulationDetailPanel, detail));

    expect(screen.getByText("billing-history")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Prompt" }));
    expect(screen.getByText(prompt, { normalizer: (text) => text })).toBeTruthy();
    expect(screen.queryByText("Judgment was never called for this hypothesis.")).toBeNull();
  });
});

describe("useCaseSimulationCockpit -- a full-case run's own evidence still reaches a case-sourced selection unchanged (criterion 6, Evidence tab)", () => {
  it("keeps reading a case-sourced selection's Evidence tab data from the run's own evidence array, not the newly-added per-evaluation field", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSelectHypothesis("hypothesis-a");
    });

    expect(result.current.detail?.evidence).toEqual([
      {
        concept: "billing-history",
        result: "ok",
        resultDetail: undefined,
        elapsedMs: 120,
        observation: "the account shows one authorized charge",
        capabilityName: "fetch-billing-account",
        capabilityVersion: "1",
        connector: "billing-connector",
        fields: undefined,
        conceptDescription: undefined,
      },
    ]);
  });
});

describe("useCaseSimulationCockpit -- a full-case run's own raw response still reaches a case-sourced selection unchanged (criterion 6, JSON tab)", () => {
  it("keeps the selected evaluation's own raw wire object as the JSON tab's rawResponse, unaffected by the new evidence field this fix adds", async () => {
    stubFetch({ [SIMULATE_CASE_PATH]: () => jsonResponse(simulateCaseResult()) });
    const { result } = renderHook(() => useCaseSimulationCockpit(SLUG, VERSION, record()), {
      wrapper: createWrapper().Wrapper,
    });
    await makeSubjectReady(result);
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSimulateCase();
    });
    await waitFor(() => expect(result.current.canSimulateCase).toBe(true));

    act(() => {
      result.current.onSelectHypothesis("hypothesis-a");
    });

    expect(result.current.detail?.rawResponse).toEqual(confirmedCaseEvaluation("hypothesis-a"));
  });
});

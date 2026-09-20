import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useSimulateHypothesis,
  type Evidence,
  type SimulateHypothesisResult,
} from "./use-simulate-hypothesis";
import {
  REQUESTER,
  SIMULATE_PATH,
  SLUG,
  SUBJECT,
  VERSION,
  confirmedEvaluation,
  createWrapper,
  definedResult,
  hypothesisCost,
  hypothesisDurations,
  jsonResponse,
  stubFetch,
} from "./use-simulate-hypothesis.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseEvidenceItem(overrides: Partial<Evidence> = {}): Evidence {
  return {
    concept: "billing-account",
    inputs: "{}",
    observation: "the account is in good standing",
    observed_at: "2026-08-01T00:00:00.000Z",
    ttl: 3600,
    origin: "billing-connector",
    result: "ok",
    capability_name: "fetch-billing-account",
    capability_version: "1",
    elapsed_ms: 120,
    capability_payload_notes: "",
    fields: [],
    concept_description: "",
    ...overrides,
  };
}

function resultWithEvidence(evidence: Evidence): SimulateHypothesisResult {
  return {
    evidence: [evidence],
    evaluation: confirmedEvaluation(),
    cost: hypothesisCost(),
    durations: hypothesisDurations(),
  };
}

describe("The hypothesis-run Evidence type declares capability_payload_notes as a required string field (criterion 2)", () => {
  it("refuses an evidence item literal that omits capability_payload_notes or types it as anything but a string", () => {
    const complete = baseEvidenceItem({ capability_payload_notes: "some notes" });

    // @ts-expect-error -- capability_payload_notes is required, not optional (criterion 2).
    const missingNotes: Evidence = { ...complete, capability_payload_notes: undefined };
    void missingNotes;

    // @ts-expect-error -- capability_payload_notes is typed string, not number (criterion 2).
    const wrongType: Evidence = { ...complete, capability_payload_notes: 42 };
    void wrongType;

    expect(complete.capability_payload_notes).toBe("some notes");
  });
});

describe("Evidence (use-simulate-hypothesis) -- fields and concept_description are required members (evidence-semantics-always-present criterion 2)", () => {
  it("refuses an evidence item literal that assigns undefined to fields or concept_description", () => {
    const complete = baseEvidenceItem({
      fields: [{ name: "status" }],
      concept_description: "the account's status",
    });

    // @ts-expect-error -- fields is required, not optional (evidence-semantics-always-present criterion 2).
    const missingFields: Evidence = { ...complete, fields: undefined };
    void missingFields;

    // @ts-expect-error -- concept_description is required, not optional (evidence-semantics-always-present criterion 2).
    const missingConceptDescription: Evidence = { ...complete, concept_description: undefined };
    void missingConceptDescription;

    expect(complete.fields).toEqual([{ name: "status" }]);
    expect(complete.concept_description).toBe("the account's status");
  });
});

describe("useSimulateHypothesis -- observed_at and ttl reach the caller exactly as the response sent them (criterion 3, UNDERDETERMINED entry 1)", () => {
  it("carries observed_at as the exact UTC string sent -- never parsed into a Date -- and ttl as the exact seconds figure sent -- never converted to milliseconds", async () => {
    const fixture = resultWithEvidence(
      baseEvidenceItem({ observed_at: "2026-08-01T12:34:56.000Z", ttl: 1800 }),
    );
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const [item] = definedResult(result.current.result).evidence;
    expect(typeof item?.observed_at).toBe("string");
    expect(item?.observed_at).toBe("2026-08-01T12:34:56.000Z");
    expect(item?.ttl).toBe(1800);
  });
});

describe("useSimulateHypothesis -- an evidence item recorded with no inputs reaches the caller as the literal {} text (UNDERDETERMINED entry 2)", () => {
  it("carries inputs as the exact \"{}\" string the response sent, never a placeholder and never an absent field", async () => {
    const fixture = resultWithEvidence(baseEvidenceItem({ inputs: "{}" }));
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const [item] = definedResult(result.current.result).evidence;
    expect(item).toHaveProperty("inputs");
    expect(item?.inputs).toBe("{}");
  });
});

describe("useSimulateHypothesis -- an evidence item whose capability declared no payload notes reaches the caller as the empty string (criterion 5)", () => {
  it("carries capability_payload_notes as the empty string the response sent, not as an absent field and not as substituted text", async () => {
    const fixture = resultWithEvidence(baseEvidenceItem({ capability_payload_notes: "" }));
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const [item] = definedResult(result.current.result).evidence;
    expect(item).toHaveProperty("capability_payload_notes");
    expect(item?.capability_payload_notes).toBe("");
  });
});

describe("useSimulateHypothesis -- fields, concept_description and result_detail also cross the wire boundary through an actual response (UNDERDETERMINED entry 3)", () => {
  it("carries fields, concept_description and result_detail through unchanged when the response sends them, rather than stopping at the four attributes this task's own criteria name", async () => {
    const fixture = resultWithEvidence(
      baseEvidenceItem({
        result_detail: "cached",
        fields: [{ name: "status", type: "string", description: "account standing" }],
        concept_description: "whether the account is in good standing",
      }),
    );
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateHypothesis(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    act(() => {
      result.current.onSimulate("hypothesis-a", SUBJECT, REQUESTER);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const [item] = definedResult(result.current.result).evidence;
    expect(item?.result_detail).toBe("cached");
    expect(item?.fields).toEqual([{ name: "status", type: "string", description: "account standing" }]);
    expect(item?.concept_description).toBe("whether the account is in good standing");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulationSubject } from "./use-simulation-subject";
import {
  SLUG,
  SOURCE,
  VERSION_WITH_FIELD,
  createWrapper,
  inputRequirementsPath,
  jsonResponse,
  stubFetch,
} from "./use-simulation-subject.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulationSubject -- hold-the-simulate-dispatch-open-for-a-missing-requirement, criteria 1-2: a required requirement's own empty input never refuses readiness, the one value both the simulate-case and the simulate-hypothesis dispatch gate on", () => {
  it("stays ready with the required field's own input still empty, and stays ready once that same field is filled in afterwards too", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.onRequesterChange("someone");
      result.current.onAddAttribute();
    });
    const rowId = result.current.addedAttributes[0]?.id;
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "attribute", "escalation-flag");
    });
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "value", "urgent");
    });

    expect(result.current.requiredFields[0]?.value).toBe("");
    expect(result.current.isReady).toBe(true);

    act(() => {
      result.current.requiredFields[0]?.onChange("acct-1");
    });

    expect(result.current.isReady).toBe(true);
  });
});

describe("useSimulationSubject -- criterion 3: a requirement's mere presence in the derived set -- required or optional, empty or filled -- is never by itself a reason readiness is refused", () => {
  it("stays ready with two derived requirements, one required and one optional, both left completely empty", async () => {
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () =>
        jsonResponse({
          requirements: [
            { attribute: "account-id", required: true, capabilities: [] },
            { attribute: "case-priority", required: false, capabilities: [] },
          ],
          capabilities_with_malformed_input_schema: [],
        }),
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(2));

    act(() => {
      result.current.onRequesterChange("someone");
      result.current.onAddAttribute();
    });
    const rowId = result.current.addedAttributes[0]?.id;
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "attribute", "escalation-flag");
    });
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "value", "urgent");
    });

    expect(result.current.requiredFields.every((field) => field.value === "")).toBe(true);
    expect(result.current.isReady).toBe(true);
  });
});

describe("useSimulationSubject -- hold-the-simulate-dispatch-open-for-a-missing-requirement's own first UNDERDETERMINED note: a requirement's own required flag is still carried through on every entry this hook exposes, even though the gate stopped reading it", () => {
  it("still reports required: true for the one requirement the read names required, while that same field's own input stays empty and readiness is true (fails against an implementation that dropped the flag once it stopped gating dispatch)", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.onRequesterChange("someone");
      result.current.onAddAttribute();
    });
    const rowId = result.current.addedAttributes[0]?.id;
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "attribute", "escalation-flag");
    });
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "value", "urgent");
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.requiredFields[0]?.required).toBe(true);
    expect(result.current.requiredFields[0]?.value).toBe("");
  });
});

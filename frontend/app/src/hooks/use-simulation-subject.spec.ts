import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulationSubject } from "./use-simulation-subject";
import {
  CAPABILITIES_PATH,
  CONNECTOR_CONFIGURATION,
  CONNECTORS_PATH,
  VERSION_WITH_NO_REQUIRED_FIELDS,
  VERSION_WITH_REQUIRED_FIELD,
  createWrapper,
  jsonResponse,
  stubFetch,
} from "./use-simulation-subject.test-support";

// task/subject-derivation/use-simulation-subject-hook's own hook-level proof: the derivation
// itself (criteria 1-3) is proved directly, without React, in
// services/simulation-subject-derivation.spec.ts -- this file proves what this hook adds over
// that pure walk: curator-added attributes (criterion 4), readiness (criteria 5-6), the one
// shared subject/readiness pair D7 requires (criterion 7), and the registry-loading pass-through
// this hook's own delivery record discloses as an inference. Mirrors
// use-capability-detail-view.spec.ts's own established convention -- renderHook, real Response
// objects through a stubbed global fetch, assertions on nothing but what this hook itself
// returns (TST-01).

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulationSubject -- criterion 4: curator-added attributes alongside derived ones", () => {
  it("includes a curator-added attribute in the assembled subject, as one {attribute, value} pair beside the filled derived required field", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.requiredFields[0]?.onChange("acct-1");
    });
    act(() => {
      result.current.onAddAttribute();
    });
    const rowId = result.current.addedAttributes[0]?.id;
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "attribute", "case-priority");
    });
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "value", "high");
    });

    expect(result.current.subject.attributes).toEqual(
      expect.arrayContaining([
        { attribute: "account-id", value: "acct-1" },
        { attribute: "case-priority", value: "high" },
      ]),
    );
    expect(result.current.subject.attributes).toHaveLength(2);
  });

  it("lets a curator-added row sharing a derived field's own attribute name override that field's typed value, rather than the two coexisting as separate entries (this hook's own inference over an untied criterion)", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.requiredFields[0]?.onChange("acct-from-required-field");
    });
    act(() => {
      result.current.onAddAttribute();
    });
    const rowId = result.current.addedAttributes[0]?.id;
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "attribute", "account-id");
    });
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "value", "acct-from-curator-row");
    });

    expect(result.current.subject.attributes).toEqual([
      { attribute: "account-id", value: "acct-from-curator-row" },
    ]);
  });

  it("does not add an entry to the assembled subject for a curator-added row still holding an empty attribute name or an empty value", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_NO_REQUIRED_FIELDS), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.isLoadingRegistries).toBe(false));

    act(() => {
      result.current.onAddAttribute();
    });
    expect(result.current.subject.attributes).toEqual([]);

    const rowId = result.current.addedAttributes[0]?.id;
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "attribute", "case-priority");
    });
    expect(result.current.subject.attributes).toEqual([]);
  });
});

describe("useSimulationSubject -- criteria 5-6: readiness", () => {
  it("stays not-ready while the requester is empty, even once every derived required field holds a value", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.requiredFields[0]?.onChange("acct-1");
    });

    expect(result.current.isReady).toBe(false);
  });

  it("stays not-ready while a derived required field is empty, even once the requester holds a value", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.onRequesterChange("someone");
    });

    expect(result.current.isReady).toBe(false);
  });

  it("turns ready once every derived required field and the requester hold a non-empty value", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.requiredFields[0]?.onChange("acct-1");
    });
    act(() => {
      result.current.onRequesterChange("someone");
    });

    expect(result.current.isReady).toBe(true);
  });

  it("never turns ready for a subject holding zero attribute-values, even once the requester is filled, for a version whose collection plan derives no required field and to which the curator has added none (rules/investigation/a-subject-carries-at-least-one-attribute)", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_NO_REQUIRED_FIELDS), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.isLoadingRegistries).toBe(false));
    expect(result.current.requiredFields).toEqual([]);

    act(() => {
      result.current.onRequesterChange("someone");
    });

    expect(result.current.isReady).toBe(false);
    expect(result.current.subject.attributes).toEqual([]);
  });
});

describe("useSimulationSubject -- criterion 7: one subject and readiness, shared identically between a full-case and a single-hypothesis run (D7)", () => {
  it("computes the same subject and the same readiness from two independently mounted instances given the same version, registries and typed values -- the single instance a screen shares between both dispatches has nothing of its own that could make the two diverge", async () => {
    stubFetch();
    const wrapper = createWrapper().Wrapper;
    const { result: firstResult } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper,
    });
    const { result: secondResult } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper,
    });

    await waitFor(() => expect(firstResult.current.requiredFields).toHaveLength(1));
    await waitFor(() => expect(secondResult.current.requiredFields).toHaveLength(1));

    act(() => {
      firstResult.current.requiredFields[0]?.onChange("acct-1");
    });
    act(() => {
      firstResult.current.onRequesterChange("someone");
    });
    act(() => {
      secondResult.current.requiredFields[0]?.onChange("acct-1");
    });
    act(() => {
      secondResult.current.onRequesterChange("someone");
    });

    expect(secondResult.current.subject).toEqual(firstResult.current.subject);
    expect(secondResult.current.isReady).toBe(firstResult.current.isReady);
    expect(firstResult.current.isReady).toBe(true);
  });
});

describe("useSimulationSubject -- isLoadingRegistries/isRegistriesError pass-through (this hook's own inference, EDG-01/EDG-02)", () => {
  it("stays true while either composed registry read is still loading, even once the other one has already resolved", async () => {
    let connectorsResolved = false;
    stubFetch({
      [CAPABILITIES_PATH]: () => new Promise<Response>(() => {}),
      [CONNECTORS_PATH]: () => {
        connectorsResolved = true;
        return jsonResponse({ data: [CONNECTOR_CONFIGURATION] });
      },
    });
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    // Both conditions are asserted inside the same poll: an implementation that used `&&`
    // instead of `||` would show isLoadingRegistries flip to false the moment connectors
    // resolves while capabilities is still pending, so the two would never hold together and
    // this would time out instead of passing.
    await waitFor(() => {
      expect(connectorsResolved).toBe(true);
      expect(result.current.isLoadingRegistries).toBe(true);
    });
    expect(result.current.requiredFields).toEqual([]);
  });

  it("turns true when either composed registry read fails, without throwing out of the hook itself", async () => {
    stubFetch({
      [CONNECTORS_PATH]: () => {
        throw new Error("network down");
      },
    });
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_REQUIRED_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isRegistriesError).toBe(true));
  });
});

describe("useSimulationSubject -- MNT-04: a curator-added row is keyed by a stable id, not by its position", () => {
  it("keeps a remaining row's own id and typed values unchanged after an earlier row is removed", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(VERSION_WITH_NO_REQUIRED_FIELDS), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.isLoadingRegistries).toBe(false));

    act(() => {
      result.current.onAddAttribute();
    });
    act(() => {
      result.current.onAddAttribute();
    });
    const [firstRow, secondRow] = result.current.addedAttributes;
    expect(firstRow?.id).not.toBe(secondRow?.id);

    const secondId = secondRow?.id;
    act(() => {
      if (secondRow) result.current.onAttributeChange(secondRow.id, "attribute", "kept");
    });
    act(() => {
      if (firstRow) result.current.onRemoveAttribute(firstRow.id);
    });

    expect(result.current.addedAttributes).toHaveLength(1);
    expect(result.current.addedAttributes[0]?.id).toBe(secondId);
    expect(result.current.addedAttributes[0]?.attribute).toBe("kept");
  });
});

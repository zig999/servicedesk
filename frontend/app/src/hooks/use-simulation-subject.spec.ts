import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulationSubject } from "./use-simulation-subject";
import {
  CAPABILITIES_PATH,
  SLUG,
  SOURCE,
  VERSION_WITHOUT_FIELD,
  VERSION_WITH_FIELD,
  createWrapper,
  inputRequirementsPath,
  jsonResponse,
  stubFetch,
} from "./use-simulation-subject.test-support";

// task/subject-input-requirements/derive-subject-fields-from-input-requirements's own hook-level
// proof: the derivation itself (criteria 1-6 and the two UNDERDETERMINED notes) is proved
// directly, without React, in services/simulation-subject-derivation.spec.ts -- this file proves
// what this hook adds over that pure walk: the pinned slug/version threading (criterion 9), the
// registries this hook now composes and their loading/error pass-through (criterion 10), that a
// required attribute never embedded as a connector placeholder is still exposed (criterion 7,
// the same scenario services/simulation-subject-derivation.spec.ts cannot reach because that
// module never receives connector-configuration text at all -- criterion 8), plus the
// pre-existing curator-added-attribute, readiness, MNT-04 and D7 shared-instance behavior this
// task's own delivery record states is preserved unchanged. Mirrors
// use-capability-detail-view.spec.ts's own established convention -- renderHook, real Response
// objects through a stubbed global fetch, assertions on nothing but what this hook itself
// returns (TST-01).
//
// task/subject-input-requirements/expose-malformed-capability-identities's own three criteria and
// its UNDERDETERMINED note are proved in the sibling file
// use-simulation-subject-malformed-capabilities.spec.ts, split out of this file to stay under
// this project's own max-lines rule -- mirrors use-capability-detail.spec.ts's own established
// multi-file split for the same reason (its own header comment cites the same rule); TST-04's
// divergence is disclosed in this proof's own record.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulationSubject -- criterion 4: curator-added attributes alongside derived ones", () => {
  it("includes a curator-added attribute in the assembled subject, as one {attribute, value} pair beside the filled derived required field", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
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
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
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
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITHOUT_FIELD), {
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
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    act(() => {
      result.current.requiredFields[0]?.onChange("acct-1");
    });

    expect(result.current.isReady).toBe(false);
  });

  it("turns ready once the requester and a curator-added attribute-value are both present, even though the one derived required field's own input stays empty (task/subject-input-requirements/hold-the-simulate-dispatch-open-for-a-missing-requirement, criteria 1-2: readiness no longer refuses for a required requirement's own empty input -- this test replaces a pre-existing assertion of the opposite, which this task's own change makes wrong)", async () => {
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
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "attribute", "case-priority");
    });
    act(() => {
      if (rowId !== undefined) result.current.onAttributeChange(rowId, "value", "high");
    });

    expect(result.current.requiredFields[0]?.value).toBe("");
    expect(result.current.isReady).toBe(true);
  });

  it("turns ready once every derived required field and the requester hold a non-empty value", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
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

  it("never turns ready for a subject holding zero attribute-values, even once the requester is filled, for a version whose case-input-requirements read names no field and to which the curator has added none (rules/investigation/a-subject-carries-at-least-one-attribute)", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITHOUT_FIELD), {
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
  it("computes the same subject and the same readiness from two independently mounted instances given the same pinned case version, registries and typed values -- the single instance a screen shares between both dispatches has nothing of its own that could make the two diverge", async () => {
    stubFetch();
    const wrapper = createWrapper().Wrapper;
    const { result: firstResult } = renderHook(
      () => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD),
      { wrapper },
    );
    const { result: secondResult } = renderHook(
      () => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD),
      { wrapper },
    );

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

describe("useSimulationSubject -- criterion 9: the field set is derived for the pinned case slug and version", () => {
  it("derives a different field set once the pinned version changes, with the same source and the same registries", async () => {
    stubFetch();
    const wrapper = createWrapper().Wrapper;
    const { result, rerender } = renderHook(
      ({ version }: { version: number }) => useSimulationSubject(SOURCE, SLUG, version),
      { wrapper, initialProps: { version: VERSION_WITH_FIELD } },
    );
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    rerender({ version: VERSION_WITHOUT_FIELD });

    await waitFor(() => expect(result.current.requiredFields).toHaveLength(0));
  });
});

describe("useSimulationSubject -- criterion 7: an attribute the read names required is exposed even though no currently-registered capability's connector could ever have embedded it as a placeholder (scenario: an undetected required attribute)", () => {
  it("exposes a required field for an attribute the read names, with no capability resolving for it at all", async () => {
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () =>
        jsonResponse({
          requirements: [{ attribute: "user_id", required: true, capabilities: [] }],
          capabilities_with_malformed_input_schema: [],
        }),
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));
    expect(result.current.requiredFields[0]).toMatchObject({ attribute: "user_id", required: true });
  });
});

describe("useSimulationSubject -- criteria 8 and 10: the composed reads are exactly case-input-requirements and capabilities, never a connector-configuration read", () => {
  it("resolves cleanly, with its derived field intact, even though the stubbed backend answers nothing at all for a connector-configuration endpoint", async () => {
    // stubFetch's own default handlers (this file's own test-support) answer only the
    // case-input-requirements and capabilities paths -- no /v1/connectors entry exists at all.
    // If this hook still composed useConnectorConfigurations under the hood, that request would
    // hit no handler, the stub would throw, and isRegistriesError would read true (or the hook
    // would never settle) instead of the assertions below holding.
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isLoadingRegistries).toBe(false));
    expect(result.current.isRegistriesError).toBe(false);
    expect(result.current.requiredFields).toHaveLength(1);
  });

  it("stays true while the case-input-requirements read is still pending, even once the capabilities read has already resolved", async () => {
    let capabilitiesResolved = false;
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () => new Promise<Response>(() => {}),
      [CAPABILITIES_PATH]: () => {
        capabilitiesResolved = true;
        return jsonResponse({ data: [] });
      },
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    // Both conditions are asserted inside the same poll: an implementation that used `&&`
    // instead of `||` would show isLoadingRegistries flip to false the moment capabilities
    // resolves while case-input-requirements is still pending, so the two would never hold
    // together and this would time out instead of passing.
    await waitFor(() => {
      expect(capabilitiesResolved).toBe(true);
      expect(result.current.isLoadingRegistries).toBe(true);
    });
    expect(result.current.requiredFields).toEqual([]);
  });

  it("turns true when the case-input-requirements read fails, without throwing out of the hook itself", async () => {
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () => {
        throw new Error("network down");
      },
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isRegistriesError).toBe(true));
  });

  it("turns true when the capabilities read fails, without throwing out of the hook itself", async () => {
    stubFetch({
      [CAPABILITIES_PATH]: () => {
        throw new Error("network down");
      },
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isRegistriesError).toBe(true));
  });
});

describe("useSimulationSubject -- MNT-04: a curator-added row is keyed by a stable id, not by its position", () => {
  it("keeps a remaining row's own id and typed values unchanged after an earlier row is removed", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITHOUT_FIELD), {
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

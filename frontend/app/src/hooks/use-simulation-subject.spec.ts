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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulationSubject -- criterion 1: no curator-added attribute state is exposed", () => {
  it("exposes no addedAttributes, onAddAttribute, onRemoveAttribute or onAttributeChange member", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));

    expect(result.current).not.toHaveProperty("addedAttributes");
    expect(result.current).not.toHaveProperty("onAddAttribute");
    expect(result.current).not.toHaveProperty("onRemoveAttribute");
    expect(result.current).not.toHaveProperty("onAttributeChange");
  });
});

describe("useSimulationSubject -- criterion 2: the composed subject pairs each filled requirement input as its own attribute-value", () => {
  it("composes one {attribute, value} pair per filled requirement input, each holding that field's own typed value", async () => {
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
      result.current.requiredFields[0]?.onChange("acct-1");
    });
    act(() => {
      result.current.requiredFields[1]?.onChange("high");
    });

    expect(result.current.subject).toEqual({
      type: SOURCE.subject,
      attributes: [
        { attribute: "account-id", value: "acct-1" },
        { attribute: "case-priority", value: "high" },
      ],
    });
  });
});

describe("useSimulationSubject -- criterion 3: at most one attribute-value per attribute name", () => {
  it("carries only one attribute-value pair when two requirement inputs name the same attribute", async () => {
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () =>
        jsonResponse({
          requirements: [
            { attribute: "account-id", required: true, capabilities: [] },
            { attribute: "account-id", required: false, capabilities: [] },
          ],
          capabilities_with_malformed_input_schema: [],
        }),
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.requiredFields).toHaveLength(2));

    act(() => {
      result.current.requiredFields[0]?.onChange("acct-1");
    });

    expect(result.current.subject.attributes).toEqual([{ attribute: "account-id", value: "acct-1" }]);
  });
});

describe("useSimulationSubject -- criterion 4: an empty requirement input contributes no attribute-value pair", () => {
  it("omits the attribute for a requirement input left empty, while still pairing a sibling field that was filled", async () => {
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
      result.current.requiredFields[0]?.onChange("acct-1");
    });

    expect(result.current.subject.attributes).toEqual([{ attribute: "account-id", value: "acct-1" }]);
  });
});

describe("useSimulationSubject -- criterion 5: readiness", () => {
  it("stays not-ready while the requester is empty, even once the one derived required field holds a value", async () => {
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

  it("never turns ready for a subject holding zero attribute-values, even once the requester is filled, for a version whose case-input-requirements read names no field (rules/investigation/a-subject-carries-at-least-one-attribute)", async () => {
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

describe("useSimulationSubject -- one subject and readiness, shared identically between a full-case and a single-hypothesis run (D7)", () => {
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

describe("useSimulationSubject -- the field set is derived for the pinned case slug and version", () => {
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

describe("useSimulationSubject -- an attribute the read names required is exposed even though no currently-registered capability's connector could ever have embedded it as a placeholder (scenario: an undetected required attribute)", () => {
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

describe("useSimulationSubject -- the composed reads are exactly case-input-requirements and capabilities, never a connector-configuration read", () => {
  it("resolves cleanly, with its derived field intact, even though the stubbed backend answers nothing at all for a connector-configuration endpoint", async () => {
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

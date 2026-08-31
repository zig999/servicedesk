import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSimulationSubject } from "./use-simulation-subject";
import {
  CAPABILITY,
  REQUIRED_FIELD_RESPONSE,
  SLUG,
  SOURCE,
  VERSION_WITHOUT_FIELD,
  VERSION_WITH_FIELD,
  createWrapper,
  inputRequirementsPath,
  jsonResponse,
  stubFetch,
} from "./use-simulation-subject.test-support";

// task/subject-input-requirements/expose-malformed-capability-identities: this task's own three
// criteria and its UNDERDETERMINED note, split out of use-simulation-subject.spec.ts to stay
// under this project's own max-lines rule (that file's own header comment carries the full
// rationale and TST-04 divergence). A capability the read names apart from its requirements
// shares no identity with anything REQUIRED_FIELD_RESPONSE's own single requirement resolves
// (CAPABILITY, "fetch-billing-account"), so a test finding this identity leaking into
// requiredFields or a field's own capabilities array cannot be explained by coincidence -- it
// can only mean the hook stopped passing the two lists through independently.

afterEach(() => {
  vi.unstubAllGlobals();
});

const MALFORMED_CAPABILITY = { name: "stale-connector-capability", version: "9" };

describe("useSimulationSubject -- expose-malformed-capability-identities, criterion 1: every capability the read names apart from its requirements is carried on the subject state by its own name and version", () => {
  it("carries the read's own capabilities_with_malformed_input_schema entry through to capabilitiesWithMalformedInputSchema, unchanged", async () => {
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () =>
        jsonResponse({
          requirements: REQUIRED_FIELD_RESPONSE.requirements,
          capabilities_with_malformed_input_schema: [MALFORMED_CAPABILITY],
        }),
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() =>
      expect(result.current.capabilitiesWithMalformedInputSchema).toHaveLength(1),
    );
    expect(result.current.capabilitiesWithMalformedInputSchema).toEqual([MALFORMED_CAPABILITY]);
  });
});

describe("useSimulationSubject -- expose-malformed-capability-identities, criterion 2: no such capability appears among the state's exposed fields", () => {
  it("adds no field of its own for a malformed capability -- requiredFields stays exactly one entry, the one requirement the read names, whether or not any capability is reported malformed", async () => {
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () =>
        jsonResponse({
          requirements: REQUIRED_FIELD_RESPONSE.requirements,
          capabilities_with_malformed_input_schema: [MALFORMED_CAPABILITY],
        }),
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() =>
      expect(result.current.capabilitiesWithMalformedInputSchema).toHaveLength(1),
    );
    expect(result.current.requiredFields).toHaveLength(1);
    expect(result.current.requiredFields[0]?.attribute).toBe("account-id");
  });
});

describe("useSimulationSubject -- expose-malformed-capability-identities, criterion 2: no such capability appears in any field's own capability annotation", () => {
  it("keeps the malformed capability's identity out of every requiredField's own resolved capabilities array", async () => {
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () =>
        jsonResponse({
          requirements: REQUIRED_FIELD_RESPONSE.requirements,
          capabilities_with_malformed_input_schema: [MALFORMED_CAPABILITY],
        }),
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() =>
      expect(result.current.capabilitiesWithMalformedInputSchema).toHaveLength(1),
    );
    const resolvedCapabilities = result.current.requiredFields.flatMap((field) => field.capabilities);
    expect(
      resolvedCapabilities.some(
        (capability) =>
          capability.name === MALFORMED_CAPABILITY.name && capability.version === MALFORMED_CAPABILITY.version,
      ),
    ).toBe(false);
  });
});

describe("useSimulationSubject -- expose-malformed-capability-identities, criterion 3: a read naming no such capability leaves that list empty rather than absent", () => {
  it("resolves capabilitiesWithMalformedInputSchema to an empty array, never undefined, when the read names none", async () => {
    stubFetch();
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITHOUT_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isLoadingRegistries).toBe(false));
    expect(result.current.capabilitiesWithMalformedInputSchema).toEqual([]);
  });
});

describe("useSimulationSubject -- expose-malformed-capability-identities, UNDERDETERMINED note: the list is derived from the read's own capabilities_with_malformed_input_schema alone, never re-derived by inspecting each resolved capability's own stored input_schema client-side", () => {
  it("still names a capability the read itself flags as malformed even though that exact capability's own currently-registered input_schema parses as well-formed JSON -- an implementation that re-derived the list from the registered schema instead of the read would drop it here", async () => {
    // CAPABILITY (this file's own test-support fixture) carries input_schema:
    // '{"type":"object"}' -- well-formed JSON. The requirement below resolves it normally
    // (so it also appears, annotated, inside requiredFields[0].capabilities), while the read
    // itself separately names that same {name, version} identity as holding a malformed input
    // schema. An implementation deriving capabilitiesWithMalformedInputSchema by inspecting
    // each resolved capability's own stored input_schema (rather than passing the read's own
    // field straight through) would find this schema well-formed and answer an empty list
    // instead of the one entry the read itself names.
    const sameIdentityAsRegisteredCapability = { name: CAPABILITY.name, version: CAPABILITY.version };
    stubFetch({
      [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () =>
        jsonResponse({
          requirements: REQUIRED_FIELD_RESPONSE.requirements,
          capabilities_with_malformed_input_schema: [sameIdentityAsRegisteredCapability],
        }),
    });
    const { result } = renderHook(() => useSimulationSubject(SOURCE, SLUG, VERSION_WITH_FIELD), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.requiredFields).toHaveLength(1));
    expect(result.current.capabilitiesWithMalformedInputSchema).toEqual([sameIdentityAsRegisteredCapability]);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  baseState,
  buildCapability,
  buildRequiredField,
  renderPanel,
} from "./case-simulation-subject-panel.test-support";
import type { CapabilityReference } from "../hooks/use-case-input-requirements";

afterEach(() => {
  vi.unstubAllGlobals();
});

function malformedCapability(overrides: Partial<CapabilityReference> = {}): CapabilityReference {
  return { name: "legacy-lookup", version: "9.9.9", ...overrides };
}

describe("CaseSimulationSubjectPanel -- a capability the state carries apart from its field set is disclosed by its own name and version (criterion 1)", () => {
  it("shows a single malformed capability's own name and version", async () => {
    await renderPanel(baseState({ capabilitiesWithMalformedInputSchema: [malformedCapability()] }));

    expect(screen.getByText("legacy-lookup 9.9.9")).toBeTruthy();
  });

  it("shows every one of two malformed capabilities, each by its own name and version, never mixed", async () => {
    await renderPanel(
      baseState({
        capabilitiesWithMalformedInputSchema: [
          malformedCapability({ name: "legacy-lookup", version: "9.9.9" }),
          malformedCapability({ name: "stale-verify", version: "0.4.1" }),
        ],
      }),
    );

    expect(screen.getByText("legacy-lookup 9.9.9")).toBeTruthy();
    expect(screen.getByText("stale-verify 0.4.1")).toBeTruthy();
  });
});

describe("CaseSimulationSubjectPanel -- the disclosed identity carries nothing beside its own name and version (UNDERDETERMINED, from the specification -- domain/knowledge/case-input-requirement states identity alone is the whole of what reaches the person composing a subject about it; an implementation that also shows that capability's connector or answered concept beside its name and version satisfies criterion 1 as written but not this)", () => {
  it("renders the disclosed row's own full text as exactly its name and version -- an implementation appending a connector or a concept beside it would make this exact-text query fail to find it", async () => {
    await renderPanel(baseState({ capabilitiesWithMalformedInputSchema: [malformedCapability()] }));

    expect(screen.getByText("legacy-lookup 9.9.9")).toBeTruthy();
  });
});

describe("CaseSimulationSubjectPanel -- the disclosed set is read straight from state.capabilitiesWithMalformedInputSchema, never re-derived from a requirement's own resolved capabilities (UNDERDETERMINED, from the specification -- no criterion names where the disclosed set comes from; an implementation that instead treated a resolved capability carrying no input-schema hint as malformed would satisfy every criterion as written and disclose a set that disagrees with the dedicated state field the moment the two diverge)", () => {
  it("discloses nothing when capabilitiesWithMalformedInputSchema is empty, even where a requirement's own resolved capability carries no input-schema hint of its own", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({
            attribute: "account-id",
            capabilities: [buildCapability({ name: "check-balance", version: "1.0.0", inputSchemaHint: "" })],
          }),
        ],
        capabilitiesWithMalformedInputSchema: [],
      }),
    );

    expect(screen.queryByText("check-balance 1.0.0")).toBeNull();
    expect(screen.queryByText(/Asking for nothing at all/)).toBeNull();
  });
});

describe("CaseSimulationSubjectPanel -- the presence of a malformed capability removes no input from the presented requirement set (criterion 3)", () => {
  it("still renders every requirement's own input, each with its own required marking held independently, alongside a non-empty malformed-capability disclosure", async () => {
    await renderPanel(
      baseState({
        requiredFields: [
          buildRequiredField({ attribute: "account-id", required: true }),
          buildRequiredField({ attribute: "notes", required: false }),
        ],
        capabilitiesWithMalformedInputSchema: [malformedCapability()],
      }),
    );

    expect(screen.getByLabelText<HTMLInputElement>("account-id").required).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>("notes").required).toBe(false);
  });
});

describe("CaseSimulationSubjectPanel -- a read naming no such capability discloses nothing in its place (criterion 4)", () => {
  it("renders no disclosure text at all when capabilitiesWithMalformedInputSchema is empty", async () => {
    await renderPanel(baseState({ capabilitiesWithMalformedInputSchema: [] }));

    expect(screen.queryByText(/Asking for nothing at all/)).toBeNull();
  });
});

describe("CaseSimulationSubjectPanel -- the disclosure is gated on the same registry-loading/error flags the requirement list above already reads, so it does not surface a stale malformed list mid-load or mid-error (disclosed inference)", () => {
  it("discloses nothing while state.isLoadingRegistries is true, even though the array is non-empty", async () => {
    await renderPanel(
      baseState({ isLoadingRegistries: true, capabilitiesWithMalformedInputSchema: [malformedCapability()] }),
    );

    expect(screen.queryByText("legacy-lookup 9.9.9")).toBeNull();
  });

  it("discloses nothing while state.isRegistriesError is true, even though the array is non-empty", async () => {
    await renderPanel(
      baseState({ isRegistriesError: true, capabilitiesWithMalformedInputSchema: [malformedCapability()] }),
    );

    expect(screen.queryByText("legacy-lookup 9.9.9")).toBeNull();
  });
});

describe("CaseSimulationSubjectPanel -- two malformed capabilities sharing the same name and version are both disclosed, neither dropped as a duplicate (edge case)", () => {
  it("renders two separate entries for two identical identities", async () => {
    await renderPanel(
      baseState({ capabilitiesWithMalformedInputSchema: [malformedCapability(), malformedCapability()] }),
    );

    expect(screen.getAllByText("legacy-lookup 9.9.9")).toHaveLength(2);
  });
});

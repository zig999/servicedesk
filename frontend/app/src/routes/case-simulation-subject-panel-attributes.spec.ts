import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { baseState, renderPanel, SUBJECT_ATTRIBUTE_PATH } from "./case-simulation-subject-panel.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseSimulationSubjectPanel -- the add-attribute control no longer exists (criterion 1)", () => {
  it("renders no '+ attribute' control", async () => {
    await renderPanel(baseState());

    expect(screen.queryByRole("button", { name: "+ attribute" })).toBeNull();
  });
});

describe("CaseSimulationSubjectPanel -- no attribute row survives the control's removal (criterion 2)", () => {
  it("renders none of an attribute row's own Attribute select, Value input or Remove-attribute button", async () => {
    await renderPanel(baseState());

    expect(screen.queryByLabelText("Attribute")).toBeNull();
    expect(screen.queryByLabelText("Value")).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove attribute" })).toBeNull();
  });
});

describe("CaseSimulationSubjectPanel -- the subject-attribute glossary is never read, so neither of its own loading or load-error states is reachable (criterion 3)", () => {
  it("issues no fetch to the subject-attribute vocabulary and renders neither its loading nor its load-error message", async () => {
    const { fetchMock } = await renderPanel(baseState());

    expect(fetchMock.mock.calls.some((call) => call[0] === SUBJECT_ATTRIBUTE_PATH)).toBe(false);
    expect(screen.queryByText("Loading subject attributes…")).toBeNull();
    expect(screen.queryByText("Could not load the subject-attribute glossary.")).toBeNull();
  });
});

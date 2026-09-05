import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseState,
  buildRequiredField,
  renderPanel,
  SUBJECT_ATTRIBUTE_PATH,
  SUBJECT_TYPE_PATH,
} from "./case-simulation-subject-panel.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseSimulationSubjectPanel -- a pinned version whose read names no requirement at all renders an explicit empty state rather than a bare empty list (criterion 5, UNDERDETERMINED, from the specification -- the disclosure must state that the pinned case version's own case-input-requirements name no attribute, never a generic contentless placeholder)", () => {
  it("states, in the rule's own terms, that the pinned case version's own case-input-requirements name no attribute", async () => {
    await renderPanel(baseState({ requiredFields: [] }));

    expect(
      screen.getByText("The pinned case version's own case-input-requirements name no attribute."),
    ).toBeTruthy();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("CaseSimulationSubjectPanel -- loading and error states for the two glossary reads (disclosed inference, EDG-01/EDG-02)", () => {
  it("shows a loading message while the subject-type vocabulary is still loading", async () => {
    await renderPanel(baseState(), {
      handlers: { [SUBJECT_TYPE_PATH]: () => new Promise<Response>(() => {}) },
      awaitSettled: false,
    });

    expect(screen.getByText("Loading subject types…")).toBeTruthy();
  });

  it("shows a loading message while the subject-attribute vocabulary is still loading", async () => {
    await renderPanel(baseState(), {
      handlers: { [SUBJECT_ATTRIBUTE_PATH]: () => new Promise<Response>(() => {}) },
      awaitSettled: false,
    });

    expect(screen.getByText("Loading subject attributes…")).toBeTruthy();
  });

  it("shows a load-error message with a Retry control when the subject-type vocabulary fails to load, and Retry re-issues the request", async () => {
    const { fetchMock } = await renderPanel(baseState(), {
      handlers: {
        [SUBJECT_TYPE_PATH]: () => {
          throw new Error("network down");
        },
      },
    });

    expect(screen.getByText("Could not load the subject-type glossary.")).toBeTruthy();
    const callsBeforeRetry = fetchMock.mock.calls.filter((call) => call[0] === SUBJECT_TYPE_PATH).length;

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      const callsAfterRetry = fetchMock.mock.calls.filter((call) => call[0] === SUBJECT_TYPE_PATH).length;
      expect(callsAfterRetry).toBeGreaterThan(callsBeforeRetry);
    });
  });

  it("shows a load-error message with a Retry control when the subject-attribute vocabulary fails to load, and Retry re-issues the request", async () => {
    const { fetchMock } = await renderPanel(baseState(), {
      handlers: {
        [SUBJECT_ATTRIBUTE_PATH]: () => {
          throw new Error("network down");
        },
      },
    });

    expect(screen.getByText("Could not load the subject-attribute glossary.")).toBeTruthy();
    const callsBeforeRetry = fetchMock.mock.calls.filter((call) => call[0] === SUBJECT_ATTRIBUTE_PATH).length;

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      const callsAfterRetry = fetchMock.mock.calls.filter((call) => call[0] === SUBJECT_ATTRIBUTE_PATH).length;
      expect(callsAfterRetry).toBeGreaterThan(callsBeforeRetry);
    });
  });
});

describe("CaseSimulationSubjectPanel -- loading and error states passed through from the composed hook (disclosed inference, EDG-01/EDG-02)", () => {
  it("shows a loading message when state.isLoadingRegistries is true", async () => {
    await renderPanel(baseState({ isLoadingRegistries: true }));

    expect(screen.getByText("Loading the connectors and capabilities this version needs…")).toBeTruthy();
  });

  it("shows a load-error message when state.isRegistriesError is true", async () => {
    await renderPanel(baseState({ isRegistriesError: true }));

    expect(
      screen.getByText("Could not load the capability and connector registries this subject is derived from."),
    ).toBeTruthy();
  });

  it("does not render the required-fields list at all while the registries are still loading (edge case)", async () => {
    await renderPanel(
      baseState({ isLoadingRegistries: true, requiredFields: [buildRequiredField({ attribute: "account-id" })] }),
    );

    expect(screen.queryByText("account-id")).toBeNull();
    expect(
      screen.queryByText("The pinned case version's own case-input-requirements name no attribute."),
    ).toBeNull();
  });
});

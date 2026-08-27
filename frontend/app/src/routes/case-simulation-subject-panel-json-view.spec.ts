import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseState,
  buildRequiredField,
  renderPanel,
  SUBJECT_ATTRIBUTE_PATH,
  SUBJECT_TYPE_PATH,
} from "./case-simulation-subject-panel.test-support";

// Proof for task/subject-derivation/subject-panel's own criterion 6 (the "view subject JSON"
// control) and the disclosed inferences over an empty required-fields list (API-04) and the
// loading/error states for the two direct glossary reads and for the composed hook's own
// passed-through isLoadingRegistries/isRegistriesError (EDG-01/EDG-02), mounted directly against
// CaseSimulationSubjectPanel. Criteria 1-4 are proven in case-simulation-subject-panel.spec.ts
// and criterion 5 in case-simulation-subject-panel-attributes.spec.ts. Shared fixtures and the
// render helper live in case-simulation-subject-panel.test-support.ts, whose own header comment
// carries this proof's fixture and network-stubbing conventions.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseSimulationSubjectPanel -- the view subject JSON control (criterion 6)", () => {
  it("shows the currently assembled subject's type and its full set of attribute-values, exactly as domain/investigation/subject structures it, inside a collapsible details/summary block", async () => {
    const subject = {
      type: "billing-dispute",
      attributes: [
        { attribute: "account-id", value: "12345" },
        { attribute: "recipient-email", value: "ops@example.com" },
      ],
    };
    await renderPanel(baseState({ subject }));

    const summary = screen.getByText("View subject JSON");
    expect(summary.tagName).toBe("SUMMARY");
    // eslint-disable-next-line testing-library/no-node-access -- confirming the native disclosure element itself, mirroring case-simulation-detail-evidence-tab.spec.ts's own established convention.
    const disclosure = summary.closest("details");
    expect(disclosure).not.toBeNull();
    // eslint-disable-next-line testing-library/no-node-access -- reading the raw JSON text out of the collapsible block is the only way to confirm this criterion; parsed and compared structurally so this test does not pin the implementation's own chosen indentation.
    const rendered = disclosure?.querySelector("pre")?.textContent ?? "";
    expect(JSON.parse(rendered)).toEqual(subject);
  });
});

describe("CaseSimulationSubjectPanel -- an empty required-fields list renders its own explicit message (disclosed inference, API-04)", () => {
  it("shows 'No connector requires a subject field for this version.' rather than an empty list", async () => {
    await renderPanel(baseState({ requiredFields: [] }));

    expect(screen.getByText("No connector requires a subject field for this version.")).toBeTruthy();
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
    expect(screen.queryByText("No connector requires a subject field for this version.")).toBeNull();
  });
});

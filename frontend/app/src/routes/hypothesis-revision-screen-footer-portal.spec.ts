import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  fillValidForm,
  H1_REVISIONS,
  HYPOTHESES_PATH,
  jsonResponse,
  NEW_HYPOTHESIS_PATH,
  parsedPostBody,
  postCallCount,
  revisePath,
  revisionsPath,
  SLUG,
  SUBJECT_TYPE,
  VERSION_PATH,
} from "./hypothesis-revision-screen.test-support";
import {
  mountHypothesisFormWithFooterSlot,
  mountIsolatedReviseWithFooterSlot,
  mountRevisionFormWithHistoryAndFooterSlot,
} from "./hypothesis-revision-screen-footer-portal.test-support";
import { HYPOTHESIS_REVISION_FORM_ID } from "./hypothesis-revision-form-fields";

afterEach(() => {
  vi.unstubAllGlobals();
});

const SAVE_BUTTON = { name: "Save hypothesis" };
const CANCEL_BUTTON = { name: "Cancel" };
const MANIFEST_BUILDER_BUTTON = { name: "Open Manifest Builder" };

function caseVersionWithPin(hypothesisName: string, pinnedRevision: number) {
  return {
    subject: SUBJECT_TYPE,
    manifest: [
      { hypothesis_revision: { hypothesis: { name: hypothesisName }, revision: pinnedRevision } },
    ],
  };
}

describe("the save control's form owner survives the footer portal (criterion 1)", () => {
  it("keeps the screen's own form as the Save button's form owner even though the button renders outside that form's DOM subtree", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisFormWithFooterSlot(fetchMock);

    const saveButton = await screen.findByRole<HTMLButtonElement>("button", SAVE_BUTTON);
    const formOwner = saveButton.form;

    expect(formOwner?.id).toBe(HYPOTHESIS_REVISION_FORM_ID);
    expect(formOwner?.contains(saveButton)).toBe(false);
  });
});

describe("activating save with the footer slot present issues the revise request (criterion 2)", () => {
  it("issues POST /v1/cases/{slug}/hypotheses for the hypothesis the route names when every field is filled in", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 4 }, 201),
      }),
    );
    await mountIsolatedReviseWithFooterSlot(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });
    expect(parsedPostBody(fetchMock)).toMatchObject({ hypothesis_name: "H1" });
  });
});

describe("a revise answered with the footer slot present states the saved revision number (criterion 3)", () => {
  it("renders the sentence naming the hypothesis and the revision number the response answered", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 4 }, 201),
      }),
    );
    await mountIsolatedReviseWithFooterSlot(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    expect(await screen.findByText('Hypothesis "H1" saved as revision 4.')).toBeTruthy();
  });
});

describe("activating abandon with the footer slot present writes nothing (criterion 4)", () => {
  it("issues no POST to the hypotheses endpoint, even after every field was filled in", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisFormWithFooterSlot(fetchMock);
    await fillValidForm("New Name");

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    expect(postCallCount(fetchMock)).toBe(0);
  });
});

describe("activating abandon with the footer slot present returns to the opening screen (criterion 4)", () => {
  it("navigates back to the screen the composition was actually opened from, rather than a fixed destination", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS) }),
    );
    const openedFrom = `/cases/${SLUG}/simulation`;
    const router = await mountRevisionFormWithHistoryAndFooterSlot(fetchMock, [
      openedFrom,
      revisePath("H1"),
    ]);
    expect(router.state.location.pathname).toBe(revisePath("H1"));

    fireEvent.click(await screen.findByRole("button", CANCEL_BUTTON));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(openedFrom);
    });
  });
});

describe("a save with the footer slot present that moves the pin forward still offers the manifest-builder route", () => {
  it("renders the Open Manifest Builder control after answering a revision higher than the one previously pinned", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 3 }, 201),
      }),
    );
    await mountIsolatedReviseWithFooterSlot(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    expect(await screen.findByRole("button", MANIFEST_BUILDER_BUTTON)).toBeTruthy();
  });
});

describe("a save with the footer slot present of a hypothesis absent from the draft's manifest still offers the manifest-builder route", () => {
  it("renders the Open Manifest Builder control after answering a hypothesis the draft's manifest holds no entry for", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "Brand New", revision: 1 }, 201),
      }),
    );
    await mountHypothesisFormWithFooterSlot(fetchMock);
    await fillValidForm("Brand New");
    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    expect(await screen.findByRole("button", MANIFEST_BUILDER_BUTTON)).toBeTruthy();
  });
});

describe("abandon's availability with the footer slot present does not turn on how much of the composition was filled in", () => {
  it("stays present and enabled both on a freshly opened, blank form and once every field has been filled in", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisFormWithFooterSlot(fetchMock);

    const blank = await screen.findByRole("button", CANCEL_BUTTON);
    expect(blank.hasAttribute("disabled")).toBe(false);

    await fillValidForm("New Name");

    const filled = screen.getByRole("button", CANCEL_BUTTON);
    expect(filled.hasAttribute("disabled")).toBe(false);
  });
});

describe("abandon's availability with the footer slot present does not turn on which of the two routes opened the composition", () => {
  it("is present when the composition was opened to create a new hypothesis", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisFormWithFooterSlot(fetchMock, NEW_HYPOTHESIS_PATH);

    expect(await screen.findByRole("button", CANCEL_BUTTON)).toBeTruthy();
  });

  it("is present when the composition was opened to revise an existing hypothesis", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS) }),
    );
    await mountIsolatedReviseWithFooterSlot(fetchMock, revisePath("H1"));

    expect(await screen.findByRole("button", CANCEL_BUTTON)).toBeTruthy();
  });
});

describe("save with the footer slot present carries the filled composition's own content, not only the hypothesis name", () => {
  it("carries criterion, collects and resolution alongside hypothesis_name and the draft's subject in the POST body", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 4 }, 201),
      }),
    );
    await mountIsolatedReviseWithFooterSlot(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(await screen.findByRole("button", SAVE_BUTTON));

    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });
    expect(parsedPostBody(fetchMock)).toEqual({
      hypothesis_name: "H1",
      criterion: "Some criterion text",
      collects: ["ConceptB", "ConceptA"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
      subject: SUBJECT_TYPE,
    });
  });
});


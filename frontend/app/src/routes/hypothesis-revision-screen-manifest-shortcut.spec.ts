import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  ACTION_TERMS,
  baseHandlers,
  CONCEPT_TERMS,
  createFetchStub,
  fillValidForm,
  H1_REVISIONS,
  HYPOTHESES_PATH,
  jsonResponse,
  MANIFEST_PATH,
  mountHypothesisForm,
  mountIsolatedRevise,
  OUTCOME_TERMS,
  RECIPIENT_TERMS,
  revisePath,
  revisionsPath,
  SUBJECT_TYPE,
  VERSION_PATH,
} from "./hypothesis-revision-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const VIEW_MANIFEST_BUTTON = { name: "View Manifest" };
const MANIFEST_BUILDER_BUTTON = { name: "Open Manifest Builder" };
const SAVE_BUTTON = { name: "Save hypothesis" };

function caseVersionWithPin(hypothesisName: string, pinnedRevision: number) {
  return {
    subject: SUBJECT_TYPE,
    manifest: [
      { hypothesis_revision: { hypothesis: { name: hypothesisName }, revision: pinnedRevision } },
    ],
  };
}

describe("the always-visible manifest shortcut on the ready phase (criterion 1)", () => {
  it("navigates to the manifest of the case version the screen was opened on, before any save is made, when opened for a new hypothesis", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountHypothesisForm(fetchMock);

    fireEvent.click(await screen.findByRole("button", VIEW_MANIFEST_BUTTON));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(MANIFEST_PATH);
    });
  });

  it("also renders before a save when the screen was opened to revise an existing hypothesis", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
      }),
    );
    const router = await mountHypothesisForm(fetchMock, revisePath("H1"));

    fireEvent.click(await screen.findByRole("button", VIEW_MANIFEST_BUTTON));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(MANIFEST_PATH);
    });
  });
});

describe("the manifest shortcut's target is built from the slug and version the screen was opened on (criterion 2)", () => {
  it("navigates to the manifest of that same case version rather than a hardcoded one, when opened for a different slug and version", async () => {
    const customSlug = "another-case";
    const customVersion = 9;
    const customPath = `/cases/${customSlug}/versions/${customVersion}/manifest/hypotheses/new`;
    const fetchMock = createFetchStub({
      [`GET /v1/cases/${customSlug}/versions/${customVersion}`]: () =>
        jsonResponse({ subject: SUBJECT_TYPE, manifest: [] }),
      "GET /v1/glossary/concepts": () => jsonResponse(CONCEPT_TERMS),
      "GET /v1/glossary/outcome": () => jsonResponse(OUTCOME_TERMS),
      "GET /v1/glossary/action": () => jsonResponse(ACTION_TERMS),
      "GET /v1/glossary/recipient": () => jsonResponse(RECIPIENT_TERMS),
    });
    const router = await mountHypothesisForm(fetchMock, customPath);

    fireEvent.click(await screen.findByRole("button", VIEW_MANIFEST_BUTTON));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        `/cases/${customSlug}/versions/${customVersion}/manifest`,
      );
    });
  });
});

describe("the manifest shortcut's placement on the ready phase", () => {
  it("renders before the hypothesis-name field in reading and tab order, rather than after the form", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    const shortcutButton = await screen.findByRole("button", VIEW_MANIFEST_BUTTON);
    const nameInput = screen.getByLabelText("Hypothesis name");

    expect(
      (shortcutButton.compareDocumentPosition(nameInput) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    ).toBe(true);
  });
});

describe("the manifest shortcut is absent before the ready phase is reached", () => {
  it("renders no manifest shortcut while the draft and its glossary vocabularies are still loading", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountHypothesisForm(fetchMock);

    expect(screen.queryByRole("button", VIEW_MANIFEST_BUTTON)).toBeNull();
  });

  it("renders no manifest shortcut when loading the draft's own subject type fails", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
      }),
    );
    await mountHypothesisForm(fetchMock);

    expect(await screen.findByText("Unable to load this form right now.")).toBeTruthy();
    expect(screen.queryByRole("button", VIEW_MANIFEST_BUTTON)).toBeNull();
  });
});

describe("a save that answers the same revision the draft's manifest entry already pinned", () => {
  it("leaves the screen with no button offering any route to the manifest, not merely no \"Open Manifest Builder\" button", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 2 }, 201),
      }),
    );
    await mountIsolatedRevise(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(await screen.findByText('Hypothesis "H1" saved as revision 2.')).toBeTruthy();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("a save that answers a revision higher than the one pinned", () => {
  it("offers exactly one route to the manifest -- the post-save offer -- not the always-visible shortcut as well", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(caseVersionWithPin("H1", 2)),
        [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "H1", revision: 3 }, 201),
      }),
    );
    await mountIsolatedRevise(fetchMock, revisePath("H1"));
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(await screen.findByRole("button", MANIFEST_BUILDER_BUTTON)).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});

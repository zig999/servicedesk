import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  DRAFT_MANIFEST_HYPOTHESIS_NAME,
  DRAFT_RECORD,
  hypothesisRevisionsPage,
  hypothesisRevisionsPath,
  jsonResponse,
  mountCaseVersionEditor,
  releaseHandlers,
  VERSION_PATH,
} from "./case-version-editor-release.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CONDITIONS_REGION = { name: "Release conditions" };
const CONDITION_TEXT = "Every manifest entry references a released hypothesis revision";

describe("CaseVersionEditorScreen — the release conditions disclosure, before any release is attempted (criterion 6)", () => {
  it("states the manifest-pin condition as Met without the curator ever opening the Release dialog", async () => {
    const fetchMock = createFetchStub(releaseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const region = await screen.findByRole("region", CONDITIONS_REGION);
    expect(within(region).getByText(`Met: ${CONDITION_TEXT}`)).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("discloses exactly the one manifest-pin condition today, no other item (this task's own inference)", async () => {
    const fetchMock = createFetchStub(releaseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const region = await screen.findByRole("region", CONDITIONS_REGION);
    await waitFor(() => {
      expect(within(region).getAllByRole("listitem")).toHaveLength(1);
    });
  });

  it("states the manifest-pin condition as Not met once a manifested hypothesis revision reads back as still a draft (criterion 8)", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${hypothesisRevisionsPath(DRAFT_MANIFEST_HYPOTHESIS_NAME)}`]: () =>
          jsonResponse(hypothesisRevisionsPage("draft")),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const region = await screen.findByRole("region", CONDITIONS_REGION);
    await within(region).findByText(`Not met: ${CONDITION_TEXT}`);
  });

  it("states the manifest-pin condition as Met, vacuously, for a manifest holding no entry (this task's own inference)", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse({ ...DRAFT_RECORD, manifest: [] }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const region = await screen.findByRole("region", CONDITIONS_REGION);
    expect(within(region).getByText(`Met: ${CONDITION_TEXT}`)).toBeTruthy();
  });

  it("states Not met, never Not yet decided, once one manifested entry is confirmed unreleased even while a second entry's own read is still pending", async () => {
    const secondEntry = {
      position: 2,
      hypothesis_revision: {
        hypothesis: { name: "second-hypothesis" },
        revision: 1,
        criterion: "Some other criterion",
        collects: ["late-payment"],
      },
    };
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ ...DRAFT_RECORD, manifest: [...DRAFT_RECORD.manifest, secondEntry] }),
        [`GET ${hypothesisRevisionsPath(DRAFT_MANIFEST_HYPOTHESIS_NAME)}`]: () =>
          jsonResponse(hypothesisRevisionsPage("draft")),
        [`GET ${hypothesisRevisionsPath("second-hypothesis")}`]: () => new Promise(() => {}),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const region = await screen.findByRole("region", CONDITIONS_REGION);
    await within(region).findByText(`Not met: ${CONDITION_TEXT}`);
    expect(within(region).queryByText(`Not yet decided: ${CONDITION_TEXT}`)).toBeNull();
  });
});

describe("CaseVersionEditorScreen — a release condition whose inputs have not been read (criterion 7)", () => {
  it("states Not yet decided, neither Met nor Not met, while the manifested revision's own read is still pending", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${hypothesisRevisionsPath(DRAFT_MANIFEST_HYPOTHESIS_NAME)}`]: () =>
          new Promise(() => {}),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const region = await screen.findByRole("region", CONDITIONS_REGION);
    await within(region).findByText(`Not yet decided: ${CONDITION_TEXT}`);
    expect(within(region).queryByText(`Met: ${CONDITION_TEXT}`)).toBeNull();
    expect(within(region).queryByText(`Not met: ${CONDITION_TEXT}`)).toBeNull();
  });

  it("states Not yet decided rather than Not met when the manifested revision's own read fails outright (this task's own inference)", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`GET ${hypothesisRevisionsPath(DRAFT_MANIFEST_HYPOTHESIS_NAME)}`]: () => {
          throw new Error("network down");
        },
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const region = await screen.findByRole("region", CONDITIONS_REGION);
    await within(region).findByText(`Not yet decided: ${CONDITION_TEXT}`);
    expect(within(region).queryByText(`Not met: ${CONDITION_TEXT}`)).toBeNull();
  });
});

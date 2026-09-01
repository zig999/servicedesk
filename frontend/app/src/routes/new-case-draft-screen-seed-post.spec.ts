import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  CREATE_PATH,
  createFetchStub,
  fillValidForm,
  jsonResponse,
  mountNewCaseDraft,
  parsedPostBody,
  postCallCount,
  RELEASED_VERSION_RECORD,
  RELEASED_VERSION_RECORD_WITHOUT_REGISTER,
  SLUG,
  SUBJECT_TYPE_TERMS,
  VALID_FORM_INPUT,
  versionPath,
  VERSIONS_PATH,
} from "./new-case-draft-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewCaseDraftScreen — Save issues a widened POST once seeded from a released version", () => {
  it("issues POST /v1/cases with consolidation_register and source_version set to the released version's own number when Save is clicked on a form seeded from it", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 7, state: "released" }] }),
        [`GET ${versionPath(7)}`]: () => jsonResponse(RELEASED_VERSION_RECORD),
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 8 }, 201),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await screen.findByDisplayValue(RELEASED_VERSION_RECORD.title);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });

    expect(parsedPostBody(fetchMock)).toEqual({
      slug: SLUG,
      title: RELEASED_VERSION_RECORD.title,
      when_to_use: RELEASED_VERSION_RECORD.when_to_use,
      authored_at: expect.any(String),
      subject: RELEASED_VERSION_RECORD.subject,
      fallback: RELEASED_VERSION_RECORD.fallback,
      consolidation_register: RELEASED_VERSION_RECORD.consolidation_register,
      source_version: 7,
    });
  });

  it("omits consolidation_register from the POST body, while still sending source_version, when the seeded released version itself carries no consolidation_register", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 7, state: "released" }] }),
        [`GET ${versionPath(7)}`]: () => jsonResponse(RELEASED_VERSION_RECORD_WITHOUT_REGISTER),
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 8 }, 201),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await screen.findByDisplayValue(RELEASED_VERSION_RECORD_WITHOUT_REGISTER.title);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });

    expect(parsedPostBody(fetchMock)).toEqual({
      slug: SLUG,
      title: RELEASED_VERSION_RECORD_WITHOUT_REGISTER.title,
      when_to_use: RELEASED_VERSION_RECORD_WITHOUT_REGISTER.when_to_use,
      authored_at: expect.any(String),
      subject: RELEASED_VERSION_RECORD_WITHOUT_REGISTER.subject,
      fallback: RELEASED_VERSION_RECORD_WITHOUT_REGISTER.fallback,
      source_version: 7,
    });
  });

  it("issues POST /v1/cases with a body carrying neither consolidation_register nor source_version when Save is clicked on a first-ever draft's blank form", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSIONS_PATH}`]: () => jsonResponse({ data: [{ version: 3, state: "draft" }] }),
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 4 }, 201),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });
    expect(parsedPostBody(fetchMock)).toEqual({
      slug: SLUG,
      title: VALID_FORM_INPUT.title,
      when_to_use: VALID_FORM_INPUT.when_to_use,
      authored_at: expect.any(String),
      subject: SUBJECT_TYPE_TERMS.data[0].name,
      fallback: {
        outcome: VALID_FORM_INPUT.outcome,
        referral: { action: VALID_FORM_INPUT.action, recipient: VALID_FORM_INPUT.recipient },
      },
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  calledAnyUrlStartingWith,
  CREATE_PATH,
  createFetchStub,
  fillForm,
  jsonResponse,
  mountCaseCreationScreen,
  parsedPostBody,
  postCallCount,
  VALID_FORM_INPUT,
} from "./case-creation-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseCreationScreen — submitting a new case (task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route, criterion 3)", () => {
  it("creates the case via POST /v1/cases carrying the curator's own typed slug verbatim, and lands on /cases/{slug}/versions/{version} using the version the response names, without ever reading that slug beforehand", async () => {
    const typedSlug = "brand-new-case-nobody-has-yet";
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: typedSlug, version: 7 }, 201),
      }),
    );
    const router = await mountCaseCreationScreen(fetchMock);
    await fillForm({ slug: typedSlug });

    fireEvent.click(screen.getByRole("button", { name: "Create case" }));

    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });

    expect(parsedPostBody(fetchMock)).toMatchObject({
      slug: typedSlug,
      title: VALID_FORM_INPUT.title,
      when_to_use: VALID_FORM_INPUT.when_to_use,
      subject: VALID_FORM_INPUT.subject,
      fallback: {
        outcome: VALID_FORM_INPUT.outcome,
        referral: {
          action: VALID_FORM_INPUT.action,
          recipient: VALID_FORM_INPUT.recipient,
        },
      },
    });

    expect(
      calledAnyUrlStartingWith(fetchMock, `/v1/cases/${typedSlug}`),
      "expected no prior read of the typed slug before create-draft is submitted",
    ).toBe(false);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/cases/${typedSlug}/versions/7`);
    });
  });
});

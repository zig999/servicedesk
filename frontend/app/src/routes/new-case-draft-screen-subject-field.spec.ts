import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  CREATE_PATH,
  createFetchStub,
  fillValidForm,
  mountNewCaseDraft,
} from "./new-case-draft-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewCaseDraftScreen — subject field, blocked by the create Save in flight", () => {
  it("disables the subject input while the create POST is in flight", async () => {

    const postPromise = new Promise<Response>(() => {});
    const fetchMock = createFetchStub(
      baseHandlers({ [`POST ${CREATE_PATH}`]: () => postPromise }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();

    const subjectInput = await screen.findByLabelText<HTMLInputElement>("Subject type");
    expect(subjectInput.hasAttribute("disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(subjectInput.hasAttribute("disabled")).toBe(true);
    });
  });
});

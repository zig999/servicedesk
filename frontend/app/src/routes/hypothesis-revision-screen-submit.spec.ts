import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  checkConcept,
  createFetchStub,
  fillValidForm,
  HYPOTHESES_PATH,
  jsonResponse,
  MANIFEST_PATH,
  mountHypothesisForm,
  parsedPostBody,
  postCallCount,
  SUBJECT_TYPE,
  selectOption,
} from "./hypothesis-revision-screen.test-support";

// Client-side validation, submit-body and success-state coverage for
// task/manifest-hypothesis-authoring/revise-hypothesis-form (criteria 6, 7, 8, 9 and 10). Load/
// pre-population/dropdown coverage lives in hypothesis-revision-screen.spec.ts and the shared
// generic failure message lives in hypothesis-revision-screen-errors.spec.ts, split three ways
// to stay under this project's own max-lines rule; all three share the fixtures and mounting
// helpers in hypothesis-revision-screen.test-support.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

const SAVE_BUTTON = { name: "Save hypothesis" };

describe("client-side pre-checks (criteria 6, 7 and 8)", () => {
  it("refuses to submit before any request is sent when no concept is checked in Collects", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    fireEvent.change(await screen.findByLabelText("Hypothesis name"), {
      target: { value: "New Name" },
    });
    fireEvent.change(screen.getByLabelText("Criterion"), {
      target: { value: "Some criterion text" },
    });
    selectOption("Resolution outcome", "resolved");
    selectOption("Referral action", "escalate");
    selectOption("Referral recipient", "supervisor");
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() => {
      expect(screen.getAllByText("Array must contain at least 1 element(s)").length).toBe(1);
    });
    expect(postCallCount(fetchMock)).toBe(0);
  });

  it("refuses to submit before any request is sent when the criterion is left empty", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    fireEvent.change(await screen.findByLabelText("Hypothesis name"), {
      target: { value: "New Name" },
    });
    checkConcept("ConceptA");
    selectOption("Resolution outcome", "resolved");
    selectOption("Referral action", "escalate");
    selectOption("Referral recipient", "supervisor");
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() => {
      expect(screen.getAllByText("String must contain at least 1 character(s)").length).toBe(1);
    });
    expect(postCallCount(fetchMock)).toBe(0);
  });

  const RESOLUTION_FIELDS = [
    { label: "Resolution outcome", value: "resolved" },
    { label: "Referral action", value: "escalate" },
    { label: "Referral recipient", value: "supervisor" },
  ];

  it.each(RESOLUTION_FIELDS)(
    "refuses to submit before any request is sent when $label is left unselected",
    async ({ label }) => {
      const fetchMock = createFetchStub(baseHandlers());
      await mountHypothesisForm(fetchMock);

      fireEvent.change(await screen.findByLabelText("Hypothesis name"), {
        target: { value: "New Name" },
      });
      fireEvent.change(screen.getByLabelText("Criterion"), {
        target: { value: "Some criterion text" },
      });
      checkConcept("ConceptA");
      for (const field of RESOLUTION_FIELDS) {
        if (field.label !== label) {
          selectOption(field.label, field.value);
        }
      }
      fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

      await waitFor(() => {
        expect(screen.getAllByText("String must contain at least 1 character(s)").length).toBe(1);
      });
      expect(postCallCount(fetchMock)).toBe(0);
    },
  );
});

describe("submitting a valid form (criteria 9 and 10)", () => {
  it("issues POST /v1/cases/{slug}/hypotheses with a body of exactly { hypothesis_name, criterion, collects, resolution, subject } built from the form's own content and the draft's own subject type", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "New Name", revision: 4 }, 201),
      }),
    );
    await mountHypothesisForm(fetchMock);
    await fillValidForm("New Name");
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });
    expect(parsedPostBody(fetchMock)).toEqual({
      hypothesis_name: "New Name",
      criterion: "Some criterion text",
      collects: ["ConceptA"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
      subject: SUBJECT_TYPE,
    });
  });

  it("renders the returned hypothesis_name and revision on a 201, and navigates to the Manifest Builder for the current draft version when its own control is used", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${HYPOTHESES_PATH}`]: () =>
          jsonResponse({ hypothesis_name: "New Name", revision: 4 }, 201),
      }),
    );
    const router = await mountHypothesisForm(fetchMock);
    await fillValidForm("New Name");
    fireEvent.click(screen.getByRole("button", SAVE_BUTTON));

    expect(
      await screen.findByText('Hypothesis "New Name" saved as revision 4.'),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Open Manifest Builder" }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(MANIFEST_PATH);
    });
  });

  it("issues exactly one POST when Save is clicked twice in quick succession", async () => {
    let resolvePost: (response: Response) => void = () => {};
    const postPromise = new Promise<Response>((resolve) => {
      resolvePost = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({ [`POST ${HYPOTHESES_PATH}`]: () => postPromise }),
    );
    await mountHypothesisForm(fetchMock);
    await fillValidForm("New Name");
    const saveButton = screen.getByRole("button", SAVE_BUTTON);
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });

    await act(async () => {
      resolvePost(jsonResponse({ hypothesis_name: "New Name", revision: 1 }, 201));
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

// sonner is the network/DOM-adjacent boundary use-hypothesis-revision-form.ts's own onError
// handler calls into; mocking it here (mirroring new-case-draft-screen-conflict.spec.ts's own
// established convention) intercepts that call directly, so these assertions never depend on a
// real Toaster mounting anything -- this suite's own test router (hypothesis-revision-screen.
// test-support.ts) does not mount AppShell/Toaster at all.
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  apiErrorResponse,
  baseHandlers,
  createFetchStub,
  fillValidForm,
  HYPOTHESES_PATH,
  mountHypothesisForm,
} from "./hypothesis-revision-screen.test-support";

// Shared generic failure message coverage for task/manifest-hypothesis-authoring/
// revise-hypothesis-form's own criterion 11. Load/pre-population/dropdown coverage lives in
// hypothesis-revision-screen.spec.ts and validation/submit/success coverage lives in
// hypothesis-revision-screen-submit.spec.ts, split three ways to stay under this project's own
// max-lines rule; all three share the fixtures and mounting helpers in
// hypothesis-revision-screen.test-support.ts.

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

const GENERIC_MESSAGE = "Something went wrong while saving. Try again.";

// The four errors this task's own Notes name, plus one arbitrary, uncataloged error -- proving
// "any other error response" collapses to the identical message too, never a distinct one.
const ERROR_CODES = [
  "CaseHoldsNoDraftError",
  "HypothesisRevisionCollectsNoConceptError",
  "ConceptNotInGlossaryError",
  "ConceptRefusesSubjectTypeError",
  "SomeOtherUnmappedError",
];

describe("any domain error to POST /v1/cases/{slug}/hypotheses (criterion 11)", () => {
  it.each(ERROR_CODES)(
    "renders the one shared generic failure message for a %s response, with no per-concept highlight",
    async (code) => {
      const fetchMock = createFetchStub(
        baseHandlers({
          // 500 for every one of these, including the arbitrary, uncataloged code: this task's
          // own Notes state as a fact about the backend's real current behavior that all four
          // named domain errors "currently collapse to an indistinguishable 500".
          [`POST ${HYPOTHESES_PATH}`]: () => apiErrorResponse(code, 500, "a domain refusal"),
        }),
      );
      await mountHypothesisForm(fetchMock);
      await fillValidForm("New Name");
      fireEvent.click(screen.getByRole("button", { name: "Save hypothesis" }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(GENERIC_MESSAGE);
      });
      expect(toast.error).toHaveBeenCalledTimes(1);
      // No per-concept highlight: nothing renders an inline validation alert (the only
      // mechanism this form has for a field-scoped error), and the checked concept stays
      // exactly as the curator left it, unblocked.
      expect(screen.queryAllByRole("alert")).toHaveLength(0);
      expect(
        screen.getByRole<HTMLInputElement>("checkbox", { name: "ConceptA" }).checked,
      ).toBe(true);
      expect(
        screen.getByRole<HTMLInputElement>("checkbox", { name: "ConceptA" }).disabled,
      ).toBe(false);
    },
  );
});

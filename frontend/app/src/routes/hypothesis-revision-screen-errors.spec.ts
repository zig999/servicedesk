import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

const GENERIC_MESSAGE = "Something went wrong while saving. Try again.";

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

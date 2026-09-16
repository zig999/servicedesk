import { afterEach, describe, expect, it, vi } from "vitest";
// This loop mounts a fresh CaseCreationScreen per required-field case inside one test body;
// automatic cleanup only runs between separate it()s, not between renders inside one, so each
// iteration unmounts the prior render itself before the next mount.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  fillForm,
  mountCaseCreationScreen,
  postCallCount,
  type FormInputOverrides,
} from "./case-creation-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const REQUIRED_FIELD_CASES: readonly {
  readonly label: string;
  readonly overrides: FormInputOverrides;
}[] = [
  { label: "Slug", overrides: { slug: "" } },
  { label: "Title", overrides: { title: "" } },
  { label: "When to use", overrides: { when_to_use: "" } },
  { label: "Subject", overrides: { subject: "" } },
  { label: "Fallback outcome", overrides: { outcome: undefined } },
  { label: "Fallback referral action", overrides: { action: undefined } },
  { label: "Fallback referral recipient", overrides: { recipient: undefined } },
];

describe(
  "CaseCreationScreen — the required-content gate " +
    "(task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route, criterion 4; " +
    "rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent)",
  () => {
    it(
      "withholds the submit action while any single piece of create-draft's required content is " +
        "absent, naming exactly the field left blank, refuses to create a case while it is clicked " +
        "disabled, and enables the act once all seven are filled -- never gated by the optional " +
        "consolidation register left untouched (underdetermined entry 3)",
      async () => {
        for (const { label, overrides } of REQUIRED_FIELD_CASES) {
          const fetchMock = createFetchStub(baseHandlers());
          await mountCaseCreationScreen(fetchMock);
          await fillForm(overrides);

          const submit = screen.getByRole("button", { name: "Create case" });
          expect(submit.hasAttribute("disabled"), `expected disabled while ${label} is absent`).toBe(
            true,
          );
          const stillNeeded = screen.getByText(/^Still needed before this case can be created:/);
          expect(
            stillNeeded.textContent,
            `expected the still-needed statement to name ${label}`,
          ).toContain(label);

          fireEvent.click(submit);
          expect(postCallCount(fetchMock), `expected no case created while ${label} is absent`).toBe(
            0,
          );

          cleanup();
          vi.unstubAllGlobals();
        }

        const fetchMock = createFetchStub(baseHandlers());
        await mountCaseCreationScreen(fetchMock);
        await fillForm();

        const submit = screen.getByRole("button", { name: "Create case" });
        expect(submit.hasAttribute("disabled")).toBe(false);
        expect(screen.queryByText(/^Still needed before this case can be created:/)).toBeNull();
      },
      15000,
    );
  },
);

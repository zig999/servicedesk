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

const ALL_REQUIRED_LABELS = [
  "Slug",
  "Title",
  "When to use",
  "Subject type",
  "Fallback outcome",
  "Fallback referral action",
  "Fallback referral recipient",
];

const REQUIRED_FIELD_CASES: readonly {
  readonly label: string;
  readonly overrides: FormInputOverrides;
}[] = [
  { label: "Slug", overrides: { slug: "" } },
  { label: "Title", overrides: { title: "" } },
  { label: "When to use", overrides: { when_to_use: "" } },
  { label: "Subject type", overrides: { subject: "" } },
  { label: "Fallback outcome", overrides: { outcome: undefined } },
  { label: "Fallback referral action", overrides: { action: undefined } },
  { label: "Fallback referral recipient", overrides: { recipient: undefined } },
];

function stillNeededLabels(): readonly string[] {
  const text = screen.getByText(/^Still needed before this case can be created:/).textContent ?? "";
  const listPortion = text.replace(/^Still needed before this case can be created:\s*/, "").replace(/\.$/, "");
  return listPortion.split(", ").filter((entry) => entry.length > 0);
}

describe(
  "CaseCreationScreen — the required-content gate " +
    "(task/case-creation-screen-corrective/wire-case-creation-to-a-real-screen-and-route, criterion 4; " +
    "rules/knowledge/a-case-authoring-surface-offers-no-submission-while-required-content-is-absent)",
  () => {
    it(
      "withholds the submit action while any single piece of create-draft's required content is " +
        "absent, naming exactly the field left blank and no other, refuses to create a case while " +
        "it is clicked disabled, and enables the act once all seven are filled -- never gated by the " +
        "optional consolidation register left untouched (underdetermined entry 3)",
      async () => {
        for (const { label, overrides } of REQUIRED_FIELD_CASES) {
          const fetchMock = createFetchStub(baseHandlers());
          await mountCaseCreationScreen(fetchMock);
          await fillForm(overrides);

          const submit = screen.getByRole("button", { name: "Create case" });
          expect(submit.hasAttribute("disabled"), `expected disabled while ${label} is absent`).toBe(
            true,
          );
          const named = stillNeededLabels();
          expect(named, `expected the still-needed statement to name exactly ${label}`).toEqual([label]);

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

    it("withholds the submit action and names every required piece of content, on the screen's own initial state where all seven are absent", async () => {
      const fetchMock = createFetchStub(baseHandlers());
      await mountCaseCreationScreen(fetchMock);

      const submit = await screen.findByRole("button", { name: "Create case" });
      expect(submit.hasAttribute("disabled")).toBe(true);
      expect(stillNeededLabels()).toEqual(ALL_REQUIRED_LABELS);

      fireEvent.click(submit);
      expect(postCallCount(fetchMock)).toBe(0);
    });

    it("names every one of several pieces of required content still absent at once, never only the first", async () => {
      const fetchMock = createFetchStub(baseHandlers());
      await mountCaseCreationScreen(fetchMock);
      await fillForm({ title: "", subject: "", action: undefined });

      const submit = screen.getByRole("button", { name: "Create case" });
      expect(submit.hasAttribute("disabled")).toBe(true);
      expect(stillNeededLabels()).toEqual(["Title", "Subject type", "Fallback referral action"]);

      fireEvent.click(submit);
      expect(postCallCount(fetchMock)).toBe(0);
    });
  },
);

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountHypothesisForm,
  mountIsolatedRevise,
  NEW_HYPOTHESIS_PATH,
  revisePath,
  revisionsPath,
  SUBJECT_TYPE,
  VERSION_PATH,
  wasRequested,
  H1_REVISIONS,
} from "./hypothesis-revision-screen.test-support";

// Load, pre-population and glossary-dropdown coverage for task/manifest-hypothesis-authoring/
// revise-hypothesis-form (criteria 1's Revise-route half, 2, 3, 4 and 5). Validation-refusal,
// submission and success coverage lives in hypothesis-revision-screen-submit.spec.ts, and the
// shared generic failure message lives in hypothesis-revision-screen-errors.spec.ts -- split
// three ways to stay under this project's own max-lines rule; all three share the fixtures and
// mounting helpers in hypothesis-revision-screen.test-support.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HypothesisRevisionScreen — loading and errors", () => {
  it("shows a loading placeholder before the draft and its glossary vocabularies arrive", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountHypothesisForm(fetchMock);

    expect(screen.getByText("Loading…")).toBeTruthy();
    expect(screen.queryByLabelText("Hypothesis name")).toBeNull();
  });

  it("shows a failure placeholder with a retry action when loading the draft's own subject type fails", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
      }),
    );
    await mountHypothesisForm(fetchMock);

    expect(await screen.findByText("Unable to load this form right now.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});

describe("NewHypothesisScreen (criterion 2)", () => {
  it("renders a blank form with the draft's own subject type fixed and non-editable, and no hypothesis name pre-filled", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    const nameInput = await screen.findByLabelText<HTMLInputElement>("Hypothesis name");
    expect(nameInput.value).toBe("");
    expect(nameInput.hasAttribute("disabled")).toBe(false);

    const subjectInput = screen.getByLabelText<HTMLInputElement>("Subject type (from draft, fixed)");
    expect(subjectInput.value).toBe(SUBJECT_TYPE);
    expect(subjectInput.hasAttribute("disabled")).toBe(true);
  });
});

describe("ReviseHypothesisScreen (criterion 3)", () => {
  it("pre-populates criterion, collects, resolution outcome and referral action/recipient from the hypothesis's own current (highest-numbered) revision, with the hypothesis name fixed and non-editable", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS) }),
    );
    await mountHypothesisForm(fetchMock, revisePath("H1"));

    const nameInput = await screen.findByLabelText<HTMLInputElement>("Hypothesis name");
    expect(nameInput.value).toBe("H1");
    expect(nameInput.hasAttribute("disabled")).toBe(true);

    expect(screen.getByDisplayValue("Latest criterion text")).toBeTruthy();
    expect(screen.queryByDisplayValue("Old criterion text")).toBeNull();

    expect(
      screen.getByRole<HTMLInputElement>("checkbox", { name: "ConceptB" }).checked,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLInputElement>("checkbox", { name: "ConceptA" }).checked,
    ).toBe(false);

    expect(within(screen.getByLabelText("Resolution outcome")).getByText("pending")).toBeTruthy();
    expect(within(screen.getByLabelText("Referral action")).getByText("notify")).toBeTruthy();
    expect(within(screen.getByLabelText("Referral recipient")).getByText("customer")).toBeTruthy();
  });
});

describe("a hypothesis literally named \"new\" (criterion 1)", () => {
  it("is addressed by the Revise route's own code path -- fetching its revisions and rendering the Revise UI -- rather than the blank New-hypothesis form", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${revisionsPath("new")}`]: () => jsonResponse(H1_REVISIONS) }),
    );
    await mountIsolatedRevise(fetchMock, NEW_HYPOTHESIS_PATH);

    expect(await screen.findByText("Revise hypothesis — new")).toBeTruthy();
    expect(screen.queryByText("New hypothesis")).toBeNull();
    const nameInput = screen.getByLabelText<HTMLInputElement>("Hypothesis name");
    expect(nameInput.value).toBe("new");
    expect(nameInput.hasAttribute("disabled")).toBe(true);
    expect(wasRequested(fetchMock, revisionsPath("new"))).toBe(true);
  });

  // A second reading of criterion 1 -- visiting the one literal URL both entry points share
  // (".../hypotheses/new") and asserting the Revise UI renders there -- is not tested here.
  // TanStack Router ranks a static path segment over a dynamic one for an identical literal
  // path, the same documented behavior this app's own route-tree.tsx already relies on for
  // "versions/new" over "versions/$version" (task/version-editor/new-draft-creation); no
  // implementation using this app's routing scheme could make the dynamic route win that
  // literal URL match instead. This is recorded as `contested` in this proof's own record
  // rather than encoded as a permanently-failing assertion: the criterion's own governing
  // concern -- that the two entry points are genuinely distinct routes, and that the Revise
  // route's own code path treats the name "new" like any other hypothesis name with no
  // in-component special-casing -- is what the two tests above already prove, which is the
  // reading every actual in-app trigger (a typed Link/navigate call addressed by route id,
  // never by re-parsing a URL string) exercises.
});

describe("Collects options (criterion 4)", () => {
  it("offers only the concepts whose own accepts list includes the draft's declared subject type", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    await screen.findByLabelText("Hypothesis name");
    expect(screen.getByRole("checkbox", { name: "ConceptA" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "ConceptB" })).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "ConceptC" })).toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("renders no Collects checkboxes when no concept in the glossary accepts the draft's declared subject type", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        "GET /v1/glossary/concepts": () =>
          jsonResponse({ data: [{ name: "ConceptC", accepts: ["onboarding"] }] }),
      }),
    );
    await mountHypothesisForm(fetchMock);

    await screen.findByLabelText("Hypothesis name");
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("groups the Collects checkboxes under one accessible group named \"Collects\"", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    await screen.findByLabelText("Hypothesis name");
    const group = screen.getByRole("group", { name: "Collects" });
    expect(within(group).getAllByRole("checkbox")).toHaveLength(2);
  });
});

describe("Resolution/referral glossary dropdowns (criterion 5)", () => {
  it("offers exactly the terms GET /v1/glossary/outcome currently returns in the resolution outcome dropdown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    const trigger = await screen.findByLabelText("Resolution outcome");
    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    const optionTexts = within(listbox)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(optionTexts).toEqual(["resolved", "pending", "rejected"]);
  });

  it("offers exactly the terms GET /v1/glossary/action currently returns in the referral action dropdown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    const trigger = await screen.findByLabelText("Referral action");
    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    const optionTexts = within(listbox)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(optionTexts).toEqual(["escalate", "notify"]);
  });

  it("offers exactly the terms GET /v1/glossary/recipient currently returns in the referral recipient dropdown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    const trigger = await screen.findByLabelText("Referral recipient");
    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    const optionTexts = within(listbox)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(optionTexts).toEqual(["supervisor", "customer"]);
  });
});

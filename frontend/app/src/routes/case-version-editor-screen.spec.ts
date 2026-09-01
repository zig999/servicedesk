import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCaseVersionEditor,
  RECORD_WITHOUT_REGISTER,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen", () => {
  it("pre-populates title, when_to_use, subject, consolidation register and fallback outcome/referral from the loaded version, with subject enabled while the draft is not blocked", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    expect(await screen.findByDisplayValue("Original title")).toBeTruthy();
    expect(screen.getByDisplayValue("Use when the case needs manual review")).toBeTruthy();

    const subjectInput = screen.getByDisplayValue("billing-dispute");
    expect(subjectInput.hasAttribute("disabled")).toBe(false);

    expect(screen.getByText("formal")).toBeTruthy();
    expect(screen.getByText("resolved")).toBeTruthy();
    expect(screen.getByText("escalate")).toBeTruthy();
    expect(screen.getByText("supervisor")).toBeTruthy();
  });

  it("shows the consolidation register as 'Not set' rather than an invented value when the loaded version carries none", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${VERSION_PATH}`]: () => jsonResponse(RECORD_WITHOUT_REGISTER) }),
    );
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(RECORD_WITHOUT_REGISTER.title);
    expect(screen.getByText("Not set")).toBeTruthy();
  });

  it("offers exactly the terms GET /v1/glossary/outcome currently returns in the fallback outcome dropdown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const outcomeTrigger = await screen.findByLabelText("Fallback outcome");
    fireEvent.click(outcomeTrigger);

    const listbox = screen.getByRole("listbox");
    const optionTexts = within(listbox)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(optionTexts).toEqual(["resolved", "pending", "rejected"]);
  });

  it("renders no options in the fallback outcome dropdown when the glossary currently holds no outcome terms", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ "GET /v1/glossary/outcome": () => jsonResponse({ data: [] }) }),
    );
    await mountCaseVersionEditor(fetchMock);

    const outcomeTrigger = await screen.findByLabelText("Fallback outcome");
    fireEvent.click(outcomeTrigger);

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).queryAllByRole("option")).toHaveLength(0);
  });

  it("offers exactly the terms GET /v1/glossary/action currently returns in the fallback referral action dropdown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const actionTrigger = await screen.findByLabelText("Fallback referral (action)");
    fireEvent.click(actionTrigger);

    const listbox = screen.getByRole("listbox");
    const optionTexts = within(listbox)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(optionTexts).toEqual(["escalate", "notify"]);
  });

  it("offers exactly the terms GET /v1/glossary/recipient currently returns in the fallback referral recipient dropdown", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const recipientTrigger = await screen.findByLabelText("Fallback referral (recipient)");
    fireEvent.click(recipientTrigger);

    const listbox = screen.getByRole("listbox");
    const optionTexts = within(listbox)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(optionTexts).toEqual(["supervisor", "customer"]);
  });
});

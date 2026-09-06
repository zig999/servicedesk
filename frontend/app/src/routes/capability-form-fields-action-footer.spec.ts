import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  baseHandlers as createScreenBaseHandlers,
  createFetchStub as createCreateScreenFetchStub,
  mountCapabilityCreateScreen,
} from "./capability-create-screen.test-support";
import {
  baseHandlers as detailScreenBaseHandlers,
  createFetchStub as createDetailScreenFetchStub,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityFormFields -- the action row is one Actions group rather than a plain trailing row (criterion 1)", () => {
  it("renders Save inside a group named Actions", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
  });
});

describe("CapabilityFormFields -- whatever a screen passes through trailingActions renders beside Save, inside that same group (criterion 2)", () => {
  it("renders the create screen's own Cancel control beside Save, inside the Actions group", async () => {
    const fetchMock = createCreateScreenFetchStub(createScreenBaseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
    expect(within(footer).getByRole("link", { name: "Cancel" })).toBeTruthy();
  });

  it("renders the detail surface's own Discard and Cancel controls beside Save, inside the same Actions group", async () => {
    const fetchMock = createDetailScreenFetchStub(detailScreenBaseHandlers());
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Save" })).toBeTruthy();
    expect(within(footer).getByRole("button", { name: "Discard changes" })).toBeTruthy();
    expect(within(footer).getByRole("link", { name: "Cancel" })).toBeTruthy();
  });
});

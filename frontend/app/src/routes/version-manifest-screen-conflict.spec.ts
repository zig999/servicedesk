import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  clickRemoveTrigger,
  createFetchStub,
  dialogConfirmRemoveButton,
  findRow,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  THREE_ENTRY_MANIFEST,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function expectEveryControlDisabled(): void {
  for (const name of ["H1", "H2", "H3"]) {
    const row = findRow(name);
    expect(within(row).getByRole("button", { name: `Move ${name} up` }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(
      within(row).getByRole("button", { name: `Move ${name} down` }).hasAttribute("disabled"),
    ).toBe(true);
    expect(within(row).getByRole("button", { name: "Remove" }).hasAttribute("disabled")).toBe(
      true,
    );
  }
}

describe("VersionManifestScreen — a version no longer in draft (criterion 9)", () => {
  it("renders the conflict banner and disables every reorder and remove control when a reorder's own PUT answers 409 CaseVersionNotDraftError", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(THREE_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("CaseVersionNotDraftError", 409, "the version is no longer a draft"),
    });
    await mountManifestScreen(fetchMock);
    await screen.findByLabelText("H1");

    fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));

    expect(await screen.findByText("This version was released by someone else")).toBeTruthy();
    expect(
      screen.getByText(
        "Your changes were not saved. Reload to see the current state, or start a new draft.",
      ),
    ).toBeTruthy();
    expectEveryControlDisabled();
  });

  it("renders the conflict banner and disables every reorder and remove control when a removal's own DELETE answers 409 CaseVersionNotDraftError", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(THREE_ENTRY_MANIFEST),
      [`DELETE ${manifestPath("H1")}`]: () =>
        apiErrorResponse("CaseVersionNotDraftError", 409, "the version is no longer a draft"),
    });
    await mountManifestScreen(fetchMock);
    await screen.findByLabelText("H1");

    clickRemoveTrigger("H1");
    await screen.findByRole("dialog");
    fireEvent.click(dialogConfirmRemoveButton());

    expect(await screen.findByText("This version was released by someone else")).toBeTruthy();
    expect(
      screen.getByText(
        "Your changes were not saved. Reload to see the current state, or start a new draft.",
      ),
    ).toBeTruthy();
    await waitFor(() => expectEveryControlDisabled());
  });
});

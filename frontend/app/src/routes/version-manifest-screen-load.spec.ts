import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
  entry,
  findRow,
  jsonResponse,
  mountManifestScreen,
  NEW_HYPOTHESIS_PATH,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VersionManifestScreen — loading and load-error placeholders", () => {
  it("shows a loading placeholder before the draft version's own manifest arrives", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountManifestScreen(fetchMock);

    expect(screen.getByText("Loading manifest…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows a failure placeholder with a retry action when loading the manifest fails", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => {
        throw new Error("network down");
      },
    });
    await mountManifestScreen(fetchMock);

    expect(await screen.findByText("Unable to load this manifest right now.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});

describe("VersionManifestScreen — manifest ordering (criterion 1)", () => {
  it("renders every manifest entry ordered by its own declared position, with its own hypothesis name and revision number, regardless of the response's own array order", async () => {
    const fetchMock = createFetchStub({

      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ manifest: [entry(3, "H3", 9), entry(1, "H1", 2), entry(2, "H2", 5)] }),
    });
    await mountManifestScreen(fetchMock);

    const rowTexts = (await screen.findAllByText(/· rev/)).map((el) => el.textContent);
    expect(rowTexts).toEqual(["H1 · rev 2", "H2 · rev 5", "H3 · rev 9"]);
  });
});

describe("VersionManifestScreen — up/down boundary controls (criterion 2)", () => {
  it("disables the up control on the lowest-position entry and the down control on the highest-position entry, leaving the middle entry's both enabled", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ manifest: [entry(1, "H1", 2), entry(2, "H2", 5), entry(3, "H3", 9)] }),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    const h1 = findRow("H1");
    expect(within(h1).getByRole("button", { name: "Move H1 up" }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(
      within(h1).getByRole("button", { name: "Move H1 down" }).hasAttribute("disabled"),
    ).toBe(false);

    const h2 = findRow("H2");
    expect(
      within(h2).getByRole("button", { name: "Move H2 up" }).hasAttribute("disabled"),
    ).toBe(false);
    expect(
      within(h2).getByRole("button", { name: "Move H2 down" }).hasAttribute("disabled"),
    ).toBe(false);

    const h3 = findRow("H3");
    expect(
      within(h3).getByRole("button", { name: "Move H3 up" }).hasAttribute("disabled"),
    ).toBe(false);
    expect(
      within(h3).getByRole("button", { name: "Move H3 down" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe('VersionManifestScreen — "+ Add hypothesis" (criterion 10)', () => {
  it("renders + Add hypothesis as a router Link to the New Hypothesis route for the current case and draft version", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "Solo", 1)] }),
    });
    await mountManifestScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "+ Add hypothesis" });
    expect(link.getAttribute("href")).toBe(NEW_HYPOTHESIS_PATH);
  });

  it("actually navigates to the New Hypothesis route's own path when clicked", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "Solo", 1)] }),
    });
    const router = await mountManifestScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "+ Add hypothesis" });
    fireEvent.click(link);

    expect(router.state.location.pathname).toBe(NEW_HYPOTHESIS_PATH);
  });
});

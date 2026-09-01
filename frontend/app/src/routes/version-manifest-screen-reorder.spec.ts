import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  createFetchStub,
  entry,
  findRow,
  getCallCount,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  parsedPutBody,
  putCallCount,
  sequentialGetHandler,
  THREE_ENTRY_MANIFEST,
  TWO_ENTRY_MANIFEST,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VersionManifestScreen — reordering (criterion 3)", () => {
  it("issues one PUT naming the neighbor's own current position when an enabled up control is clicked, and a 204 re-renders the list in the new order", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        THREE_ENTRY_MANIFEST,
        { manifest: [entry(1, "H2", 5), entry(2, "H1", 2), entry(3, "H3", 9)] },
      ]),
      [`PUT ${manifestPath("H2")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));

    expect(parsedPutBody(fetchMock)).toEqual({ revision: 5, position: 1 });

    await waitFor(() => {
      expect(screen.getAllByText(/· rev/).map((el) => el.textContent)).toEqual([
        "H2 · rev 5",
        "H1 · rev 2",
        "H3 · rev 9",
      ]);
    });
  });
});

describe("VersionManifestScreen — free-position moves are never a client-side collision (criterion 4)", () => {
  it("succeeds when the target position currently belongs to a different entry, without any client-side pre-check or blocking", async () => {

    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        THREE_ENTRY_MANIFEST,
        { manifest: [entry(1, "H1", 2), entry(2, "H3", 9), entry(3, "H2", 5)] },
      ]),
      [`PUT ${manifestPath("H3")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    fireEvent.click(within(findRow("H3")).getByRole("button", { name: "Move H3 up" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({ revision: 9, position: 2 });
    await waitFor(() => {
      expect(screen.getAllByText(/· rev/).map((el) => el.textContent)).toEqual([
        "H1 · rev 2",
        "H3 · rev 9",
        "H2 · rev 5",
      ]);
    });
    expect(screen.queryByText(/holds that position/)).toBeNull();
  });
});

describe("VersionManifestScreen — a blocked swap (criterion 5)", () => {
  it("reverts the attempted move and renders an inline message on the affected row when the PUT answers 409 ManifestPositionOccupiedError, leaving the other rows unaffected", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("ManifestPositionOccupiedError", 409, "position already occupied"),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));

    expect(
      await within(findRow("H2")).findByText(
        "Another hypothesis already holds that position. Try again.",
      ),
    ).toBeTruthy();
    expect(
      within(findRow("H1")).queryByText("Another hypothesis already holds that position. Try again."),
    ).toBeNull();

    expect(getCallCount(fetchMock)).toBe(1);
    expect(screen.getAllByText(/· rev/).map((el) => el.textContent)).toEqual([
      "H1 · rev 2",
      "H2 · rev 5",
    ]);

    expect(
      within(findRow("H2")).getByRole("button", { name: "Move H2 up" }).hasAttribute("disabled"),
    ).toBe(false);
  });
});

describe("VersionManifestScreen — the reorder-error message is announced (ACC-07, criterion 3)", () => {
  it("renders the reorder-error message with role=\"alert\" when a reorder is rejected", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("ManifestPositionOccupiedError", 409, "position already occupied"),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));

    const alert = await within(findRow("H2")).findByRole("alert");
    expect(alert.textContent).toBe("Another hypothesis already holds that position. Try again.");
  });
});

describe("VersionManifestScreen — a move in flight (this hook's own isBusy inference)", () => {
  it("disables every row's controls while a move is pending, so a second click cannot fire a second request, and re-enables them once it resolves", async () => {
    let resolvePut: ((response: Response) => void) | undefined;
    const putPromise = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([TWO_ENTRY_MANIFEST, TWO_ENTRY_MANIFEST]),
      [`PUT ${manifestPath("H2")}`]: () => putPromise,
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));

    await waitFor(() => {
      expect(
        within(findRow("H1")).getByRole("button", { name: "Move H1 down" }).hasAttribute(
          "disabled",
        ),
      ).toBe(true);
    });

    fireEvent.click(within(findRow("H1")).getByRole("button", { name: "Move H1 down" }));
    expect(putCallCount(fetchMock)).toBe(1);

    resolvePut?.(noContentResponse());

    await waitFor(() => {
      expect(
        within(findRow("H1")).getByRole("button", { name: "Move H1 down" }).hasAttribute(
          "disabled",
        ),
      ).toBe(false);
    });
    expect(putCallCount(fetchMock)).toBe(1);
  });
});

describe("VersionManifestScreen — a move failing for an unnamed reason", () => {
  it("returns the controls to an interactive, unblocked state when the PUT fails for a reason none of this task's criteria name", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`PUT ${manifestPath("H2")}`]: () =>
        apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    fireEvent.click(within(findRow("H2")).getByRole("button", { name: "Move H2 up" }));

    await waitFor(() => {
      expect(
        within(findRow("H2")).getByRole("button", { name: "Move H2 up" }).hasAttribute(
          "disabled",
        ),
      ).toBe(false);
    });
    expect(screen.queryByText("This version was released by someone else")).toBeNull();
    expect(
      within(findRow("H2")).queryByText("Another hypothesis already holds that position. Try again."),
    ).toBeNull();
  });
});

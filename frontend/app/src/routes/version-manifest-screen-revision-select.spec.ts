import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  createFetchStub,
  entry,
  findRow,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  parsedPutBody,
  putCallCount,
  sequentialGetHandler,
  SLUG,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${hypothesisName}/revisions`;
}

function revisionsPage(revisions: readonly number[]): { data: { revision: number }[]; total: number } {
  return { data: revisions.map((revision) => ({ revision })), total: revisions.length };
}

describe("VersionManifestScreen — the Hypothesis cell's own Select options (criterion 1)", () => {
  it("renders one option per revision obtained for that row, each labelled by nothing but its own bare revision number, in the order the revisions were obtained", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([4, 1, 2])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    fireEvent.click(trigger);

    const options = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["4", "1", "2"]);
  });
});

describe("VersionManifestScreen — the Select's own initial value (criterion 2)", () => {
  it("shows the row's currently pinned revision as the Select's own value before any choice is made", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    expect(trigger.textContent).toBe("2");
  });
});

describe("VersionManifestScreen — repinning through the Select (criterion 3)", () => {
  it("invokes the row's own repin action with the chosen revision, PUTting that row's own manifest entry at its own unchanged position", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        { manifest: [entry(1, "H1", 2)] },
        { manifest: [entry(1, "H1", 4)] },
      ]),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
      [`PUT ${manifestPath("H1")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    fireEvent.click(trigger);
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "4" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({ revision: 4, position: 1 });
    await waitFor(() => expect(screen.getByLabelText("H1").textContent).toBe("4"));
  });
});

describe("VersionManifestScreen — choosing the already-pinned revision (criterion 4)", () => {
  it("issues no manifest request when the revision chosen is the one the row already pins", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    fireEvent.click(trigger);
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "2" }));

    expect(putCallCount(fetchMock)).toBe(0);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("VersionManifestScreen — the Select while a repin is in flight (criterion 5)", () => {
  it("disables the Select on every row while an earlier repin request is still pending, exactly like the row's own move and remove controls, and re-enables them once it resolves", async () => {
    let resolvePut: ((response: Response) => void) | undefined;
    const putPromise = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        { manifest: [entry(1, "H1", 2), entry(2, "H2", 5)] },
        { manifest: [entry(1, "H1", 4), entry(2, "H2", 5)] },
      ]),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
      [`GET ${revisionsPath("H2")}`]: () => jsonResponse(revisionsPage([5])),
      [`PUT ${manifestPath("H1")}`]: () => putPromise,
    });
    await mountManifestScreen(fetchMock);

    const h1Trigger = await screen.findByLabelText("H1");
    fireEvent.click(h1Trigger);
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "4" }));

    await waitFor(() => {
      expect(screen.getByLabelText("H1").hasAttribute("disabled")).toBe(true);
    });
    expect(screen.getByLabelText("H2").hasAttribute("disabled")).toBe(true);
    expect(
      within(findRow("H2")).getByRole("button", { name: "Move H2 up" }).hasAttribute("disabled"),
    ).toBe(true);

    resolvePut?.(noContentResponse());

    await waitFor(() => {
      expect(screen.getByLabelText("H1").hasAttribute("disabled")).toBe(false);
    });
    expect(screen.getByLabelText("H2").hasAttribute("disabled")).toBe(false);
  });
});

describe("VersionManifestScreen — the Select once the draft is blocked (criterion 5)", () => {
  it("disables the Select on every row once a repin's own PUT answers 409 CaseVersionNotDraftError, exactly like the row's own move and remove controls", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ manifest: [entry(1, "H1", 2), entry(2, "H2", 5)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
      [`GET ${revisionsPath("H2")}`]: () => jsonResponse(revisionsPage([5])),
      [`PUT ${manifestPath("H1")}`]: () =>
        apiErrorResponse("CaseVersionNotDraftError", 409, "the version is no longer a draft"),
    });
    await mountManifestScreen(fetchMock);

    const h1Trigger = await screen.findByLabelText("H1");
    fireEvent.click(h1Trigger);
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "4" }));

    expect(await screen.findByText("This version was released by someone else")).toBeTruthy();
    expect(screen.getByLabelText("H1").hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("H2").hasAttribute("disabled")).toBe(true);
    expect(
      within(findRow("H1")).getByRole("button", { name: "Remove" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});

describe("VersionManifestScreen — the Select's own combobox/listbox contract (criterion 6)", () => {
  it("opens a listbox of options on click and closes it on Escape, the same combobox contract @tui/ui/select's own trigger and keyboard handling expose", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(screen.queryByRole("listbox")).toBeNull();

    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeTruthy();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("VersionManifestScreen — repinning one row leaves every other row unchanged (criterion 7)", () => {
  it("leaves every other row's own shown revision unchanged, and issues no request for them, when one row is repinned", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        { manifest: [entry(1, "H1", 2), entry(2, "H2", 5)] },
        { manifest: [entry(1, "H1", 4), entry(2, "H2", 5)] },
      ]),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
      [`GET ${revisionsPath("H2")}`]: () => jsonResponse(revisionsPage([3, 5, 7])),
      [`PUT ${manifestPath("H1")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");
    expect(screen.getByLabelText("H2").textContent).toBe("5");

    fireEvent.click(screen.getByLabelText("H1"));
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "4" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await waitFor(() => expect(screen.getByLabelText("H1").textContent).toBe("4"));

    expect(screen.getByLabelText("H2").textContent).toBe("5");
    expect(putCallCount(fetchMock)).toBe(1);
  });
});

describe("VersionManifestScreen — the Select's own accessible name (this task's own inference)", () => {
  it("keeps the hypothesis's own name as the Select's caption and accessible name, rather than dropping it once the revision becomes a Select", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(within(findRow("H1")).getByText("H1")).toBeTruthy();
  });
});

describe("VersionManifestScreen — a repin failure's error message, linked to the Select (this task's own inference)", () => {
  it("marks the Select itself invalid and links the error message to it through aria-describedby when a repin fails for an unnamed reason", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
      [`PUT ${manifestPath("H1")}`]: () =>
        apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    fireEvent.click(trigger);
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "4" }));

    const alert = await within(findRow("H1")).findByRole("alert");
    expect(alert.textContent).toBe("Could not switch to that revision. Try again.");

    const invalidTrigger = screen.getByLabelText("H1");
    expect(invalidTrigger.getAttribute("aria-invalid")).toBe("true");
    expect(invalidTrigger.getAttribute("aria-describedby")).toBe(alert.id);
    expect(screen.queryByText("This version was released by someone else")).toBeNull();
  });
});

describe("VersionManifestScreen — the Select's disabled state for a possibly-already-released row (UNDERDETERMINED, from the specification)", () => {
  it("disables the Select before any repin is even attempted, rather than only once a repin later reveals the version is no longer a draft", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ state: "released", manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2, 4])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");

    expect(trigger.hasAttribute("disabled")).toBe(true);
  });
});

describe("VersionManifestScreen — the pinned revision absent from the answered page (UNDERDETERMINED, from the specification)", () => {
  it("still states the row's own pinned revision as the Select's shown value when that revision is absent from the page useManifestRowRevisions answered for the row", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 3, 4])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");

    expect(trigger.textContent).toBe("2");
  });
});

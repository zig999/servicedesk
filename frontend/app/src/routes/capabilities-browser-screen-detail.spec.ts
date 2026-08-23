import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  capabilitiesPage,
  capability,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";

// Row-selection detail-panel coverage for task/glossary-and-capabilities-browser/
// capabilities-browser-screen (criteria 2, 3, 4 and 5, plus the composite-key inference its
// own delivery record discloses). Listing/loading/error/empty-state/formatting coverage
// lives in the sibling capabilities-browser-screen.spec.ts, to stay under this project's own
// max-lines rule; both share capabilities-browser-screen.test-support.ts's own fixtures and
// mounting helper.
//
// The detail panel renders as a TUI Panel: a <section aria-labelledby="..."> whose heading
// carries the selected capability's own name -- a <section> with an accessible name carries
// the implicit ARIA role "region", the same convention toaster-mount.spec.ts's own comment
// already establishes for this codebase, so `getByRole("region", { name: ... })` is what
// tells apart "the detail panel for capability X is showing" from "some other element
// happens to render X's name".

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen — before selection (criterion 2)", () => {
  it("renders no capability's detail panel before any row is selected", async () => {
    const capabilities = [capability(), capability({ name: "resize-image", version: "2.0.0" })];
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage(capabilities)));
    await mountCapabilitiesScreen(fetchMock);

    await screen.findAllByRole("button");
    expect(screen.queryByRole("region")).toBeNull();
  });
});

describe("CapabilitiesBrowserScreen — selecting a row (criterion 3)", () => {
  it("renders a detail panel showing the clicked row's own version, input_schema and output_schema exactly as GET /v1/capabilities returned them", async () => {
    const target = capability({
      name: "translate-text",
      version: "3.2.1",
      input_schema: "TranslateTextInputV3",
      output_schema: "TranslateTextOutputV3",
    });
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage([target])));
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    fireEvent.click(rows[0]);

    const panel = await screen.findByRole("region", { name: "translate-text" });
    expect(within(panel).getByText("3.2.1")).toBeTruthy();
    expect(within(panel).getByText("TranslateTextInputV3")).toBeTruthy();
    expect(within(panel).getByText("TranslateTextOutputV3")).toBeTruthy();
  });
});

describe("CapabilitiesBrowserScreen — selecting a different row (criterion 4)", () => {
  it("swaps the detail panel to the newly clicked row's own version, input_schema and output_schema", async () => {
    const first = capability({
      name: "translate-text",
      version: "1.0.0",
      input_schema: "TranslateTextInput",
      output_schema: "TranslateTextOutput",
    });
    const second = capability({
      name: "resize-image",
      version: "2.0.0",
      input_schema: "ResizeImageInput",
      output_schema: "ResizeImageOutput",
    });
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage([first, second])));
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    fireEvent.click(rows[0]);
    await screen.findByRole("region", { name: "translate-text" });

    fireEvent.click(rows[1]);

    expect(screen.queryByRole("region", { name: "translate-text" })).toBeNull();
    const panel = await screen.findByRole("region", { name: "resize-image" });
    expect(within(panel).getByText("2.0.0")).toBeTruthy();
    expect(within(panel).getByText("ResizeImageInput")).toBeTruthy();
    expect(within(panel).getByText("ResizeImageOutput")).toBeTruthy();
    expect(screen.queryByText("TranslateTextInput")).toBeNull();
    expect(screen.queryByText("TranslateTextOutput")).toBeNull();
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });
});

describe("CapabilitiesBrowserScreen — no second network read on selection (criterion 5)", () => {
  it("issues no network request beyond the one GET /v1/capabilities call the table's own listing already made", async () => {
    const capabilities = [capability(), capability({ name: "resize-image", version: "2.0.0" })];
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage(capabilities)));
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(rows[0]);
    await screen.findByRole("region", { name: "translate-text" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(rows[1]);
    await screen.findByRole("region", { name: "resize-image" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("CapabilitiesBrowserScreen — the detail-panel mount point announces itself (ACC-07, criterion 4)", () => {
  it("renders an aria-live=\"polite\" mount point for the detail panel before any row is selected", async () => {
    const fetchMock = createCapabilitiesFetchStub(() =>
      jsonResponse(capabilitiesPage([capability()])),
    );
    await mountCapabilitiesScreen(fetchMock);

    await screen.findAllByRole("button");

    // The mount point is deliberately empty before a row is selected, so there is no
    // accessible content (no role, no text) that an RTL query could reach it by;
    // mirrors cases-list-screen.spec.ts's own precedent for a decorative/attribute-only
    // target.
    // eslint-disable-next-line testing-library/no-node-access
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });

  it("keeps the detail panel inside that same aria-live=\"polite\" mount point once a row is selected", async () => {
    const fetchMock = createCapabilitiesFetchStub(() =>
      jsonResponse(capabilitiesPage([capability()])),
    );
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    fireEvent.click(rows[0]);

    const panel = await screen.findByRole("region", { name: "translate-text" });
    // Confirming the panel's own aria-live ancestor is not itself surfaced through any
    // role/text RTL query.
    // eslint-disable-next-line testing-library/no-node-access
    expect(panel.closest('[aria-live="polite"]')).not.toBeNull();
  });
});

describe("CapabilitiesBrowserScreen — composite name::version selection key (disclosed inference)", () => {
  it("disambiguates two capabilities sharing the same name by their own version, so selecting one never shows the other's own detail", async () => {
    const v1 = capability({
      name: "resize-image",
      version: "1.0.0",
      input_schema: "ResizeImageInputV1",
      output_schema: "ResizeImageOutputV1",
    });
    const v2 = capability({
      name: "resize-image",
      version: "2.0.0",
      input_schema: "ResizeImageInputV2",
      output_schema: "ResizeImageOutputV2",
    });
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage([v1, v2])));
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(rows).toHaveLength(2);

    // Both rows share the same name; if selection matched by name alone (rather than
    // name::version), clicking the second row would still resolve to the first
    // registered capability sharing that name (Array.prototype.find returns the first
    // match), showing v1's own fields instead of v2's.
    fireEvent.click(rows[1]);

    const panels = await screen.findAllByRole("region", { name: "resize-image" });
    expect(panels).toHaveLength(1);
    expect(within(panels[0]).getByText("2.0.0")).toBeTruthy();
    expect(within(panels[0]).getByText("ResizeImageInputV2")).toBeTruthy();
    expect(within(panels[0]).getByText("ResizeImageOutputV2")).toBeTruthy();
    expect(within(panels[0]).queryByText("1.0.0")).toBeNull();
    expect(within(panels[0]).queryByText("ResizeImageInputV1")).toBeNull();
  });
});

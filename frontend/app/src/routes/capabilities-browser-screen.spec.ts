import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  capabilitiesPage,
  capability,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";

// Listing, loading, error, empty-state and per-column formatting coverage for
// task/glossary-and-capabilities-browser/capabilities-browser-screen (criteria 1 and 6, plus
// the timeout-suffix and nature-plain-text inferences its own delivery record discloses).
// Row-selection detail-panel coverage (criteria 2-5, plus the composite-key inference) lives
// in the sibling capabilities-browser-screen-detail.spec.ts, to stay under this project's own
// max-lines rule; both share capabilities-browser-screen.test-support.ts's own fixtures and
// mounting helper.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen — listing (criterion 1)", () => {
  it("renders one row per capability GET /v1/capabilities returns, each showing its own name, nature, connector, concept and timeout", async () => {
    const capabilities = [
      capability({
        name: "translate-text",
        nature: "read-only",
        connector: "deepl-connector",
        concept: "translation",
        timeout: 5000,
      }),
      capability({
        name: "resize-image",
        version: "2.0.0",
        nature: "mutating",
        connector: "imaging-connector",
        concept: "image-processing",
        timeout: 12000,
        input_schema: "ResizeImageInput",
        output_schema: "ResizeImageOutput",
      }),
    ];
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage(capabilities)));
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(rows).toHaveLength(2);

    expect(within(rows[0]).getByText("translate-text")).toBeTruthy();
    expect(within(rows[0]).getByText("read-only")).toBeTruthy();
    expect(within(rows[0]).getByText("deepl-connector")).toBeTruthy();
    expect(within(rows[0]).getByText("translation")).toBeTruthy();
    expect(within(rows[0]).getByText("5000 ms")).toBeTruthy();

    expect(within(rows[1]).getByText("resize-image")).toBeTruthy();
    expect(within(rows[1]).getByText("mutating")).toBeTruthy();
    expect(within(rows[1]).getByText("imaging-connector")).toBeTruthy();
    expect(within(rows[1]).getByText("image-processing")).toBeTruthy();
    expect(within(rows[1]).getByText("12000 ms")).toBeTruthy();
  });
});

describe("CapabilitiesBrowserScreen — loading and load-error placeholders", () => {
  it("shows a loading placeholder before GET /v1/capabilities responds", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountCapabilitiesScreen(fetchMock);

    expect(screen.getByText("Loading capabilities…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows a generic load-failure message when GET /v1/capabilities fails, rather than routing through a specific per-error message", async () => {
    const fetchMock = createCapabilitiesFetchStub(() => {
      throw new Error("network down");
    });
    await mountCapabilitiesScreen(fetchMock);

    expect(await screen.findByText("Capabilities could not be loaded.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("CapabilitiesBrowserScreen — empty state", () => {
  it("renders an explicit empty-state message and no table when GET /v1/capabilities returns zero capabilities", async () => {
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage([])));
    await mountCapabilitiesScreen(fetchMock);

    expect(await screen.findByText("No capabilities are currently registered.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("CapabilitiesBrowserScreen — timeout and nature formatting (disclosed inferences)", () => {
  it("renders a capability's timeout with an explicit ' ms' unit suffix rather than a bare number", async () => {
    const fetchMock = createCapabilitiesFetchStub(() =>
      jsonResponse(capabilitiesPage([capability({ timeout: 250 })])),
    );
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(within(rows[0]).getByText("250 ms")).toBeTruthy();
  });

  it("renders a capability's nature as plain text, never as a StatusTable {color,label} status cell", async () => {
    const fetchMock = createCapabilitiesFetchStub(() =>
      jsonResponse(capabilitiesPage([capability({ nature: "mutating" })])),
    );
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    // The Nature column is the second of the five declared columns (name, nature, connector,
    // concept, timeout). A {color,label} status cell would additionally render an
    // aria-hidden color dot beside the label text (status-table.tsx's own
    // renderCellContent); a plain string never does.
    // eslint-disable-next-line testing-library/no-node-access -- mirrors status-table.spec.ts's own precedent: a status cell's color dot is aria-hidden and decorative, so checking for its absence has no RTL role/text/label query to use.
    const natureCell = rows[0].querySelectorAll("td")[1];
    expect(natureCell.textContent).toBe("mutating");
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(natureCell.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe("CapabilitiesBrowserScreen — no mutating controls (criterion 6)", () => {
  it("renders no control that creates, edits or deletes a capability, or changes a capability's nature", async () => {
    const capabilities = [capability(), capability({ name: "resize-image", version: "2.0.0" })];
    const fetchMock = createCapabilitiesFetchStub(() => jsonResponse(capabilitiesPage(capabilities)));
    await mountCapabilitiesScreen(fetchMock);

    const rows = await screen.findAllByRole("button");
    expect(rows).toHaveLength(2);
    // The two row-selection buttons above are the only interactive controls this screen
    // renders at all: no separate Create/Edit/Delete action and no nature toggle exist for
    // onRowClick's own selection behavior to be mistaken for one.
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /create|edit|delete/i })).toBeNull();
  });
});

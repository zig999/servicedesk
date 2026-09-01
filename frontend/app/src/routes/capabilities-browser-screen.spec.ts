import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  capabilitiesPage,
  capability,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
} from "./capabilities-browser-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilitiesBrowserScreen — listing (criterion 1)", () => {
  it("renders one row per capability GET /v1/capabilities returns, each showing its own name, version, nature, connector, concept and timeout", async () => {
    const capabilities = [
      capability({
        name: "translate-text",
        version: "1.0.0",
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
        input_schema: '{"kind":"ResizeImageInput"}',
        output_schema: '{"kind":"ResizeImageOutput"}',
      }),
    ];
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage(capabilities)),
    });
    await mountCapabilitiesScreen(fetchMock);

    const table = await screen.findByRole("table");
    const dataRows = within(table).getAllByRole("button");
    expect(dataRows).toHaveLength(2);

    expect(within(dataRows[0]).getByText("translate-text")).toBeTruthy();
    expect(within(dataRows[0]).getByText("1.0.0")).toBeTruthy();
    expect(within(dataRows[0]).getByText("read-only")).toBeTruthy();
    expect(within(dataRows[0]).getByText("deepl-connector")).toBeTruthy();
    expect(within(dataRows[0]).getByText("translation")).toBeTruthy();
    expect(within(dataRows[0]).getByText("5000 ms")).toBeTruthy();

    expect(within(dataRows[1]).getByText("resize-image")).toBeTruthy();
    expect(within(dataRows[1]).getByText("2.0.0")).toBeTruthy();
    expect(within(dataRows[1]).getByText("mutating")).toBeTruthy();
    expect(within(dataRows[1]).getByText("imaging-connector")).toBeTruthy();
    expect(within(dataRows[1]).getByText("image-processing")).toBeTruthy();
    expect(within(dataRows[1]).getByText("12000 ms")).toBeTruthy();
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
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);

    expect(await screen.findByText("Capabilities could not be loaded.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("CapabilitiesBrowserScreen — empty state", () => {
  it("renders an explicit empty-state message and no table when GET /v1/capabilities returns zero capabilities, still offering the New capability action", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
    });
    await mountCapabilitiesScreen(fetchMock);

    expect(await screen.findByText("No capabilities are currently registered.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "New capability" })).toBeTruthy();
  });
});

describe("CapabilitiesBrowserScreen — timeout and nature formatting (disclosed inferences)", () => {
  it("renders a capability's timeout with an explicit ' ms' unit suffix rather than a bare number", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([capability({ timeout: 250 })])),
    });
    await mountCapabilitiesScreen(fetchMock);

    const table = await screen.findByRole("table");
    const dataRows = within(table).getAllByRole("button");
    expect(within(dataRows[0]).getByText("250 ms")).toBeTruthy();
  });

  it("renders a capability's nature as plain text, never as a StatusTable {color,label} status cell", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([capability({ nature: "mutating" })])),
    });
    await mountCapabilitiesScreen(fetchMock);

    const table = await screen.findByRole("table");
    const dataRow = within(table).getAllByRole("button")[0];

    // eslint-disable-next-line testing-library/no-node-access -- mirrors status-table.spec.ts's own precedent: a status cell's color dot is aria-hidden and decorative, so checking for its absence has no RTL role/text/label query to use.
    const natureCell = dataRow.querySelectorAll("td")[2];
    expect(natureCell.textContent).toBe("mutating");
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(natureCell.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe("CapabilitiesBrowserScreen's retry control (criterion 3)", () => {
  it("re-issues GET /v1/capabilities when Retry is clicked, rendering the capabilities once that retry succeeds", async () => {
    let callCount = 0;
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => {
        callCount += 1;
        if (callCount === 1) {
          throw new Error("network down");
        }
        return jsonResponse(capabilitiesPage([capability()]));
      },
    });
    await mountCapabilitiesScreen(fetchMock);

    expect(await screen.findByText("Capabilities could not be loaded.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("translate-text")).toBeTruthy();
    expect(screen.queryByText("Capabilities could not be loaded.")).toBeNull();
    expect(callCount).toBe(2);
  });
});

describe("CapabilitiesBrowserScreen's retry control (criterion 4)", () => {
  it("issues no request other than GET /v1/capabilities when Retry is clicked", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("Capabilities could not be loaded.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    for (const call of fetchMock.mock.calls) {
      const url = typeof call[0] === "string" ? call[0] : call[0].toString();
      expect(url).toBe(CAPABILITIES_PATH);
    }
  });
});

describe("CapabilitiesBrowserScreen's retry control -- exactly one more request", () => {
  it("issues exactly one more request per Retry click, never zero and never more than one", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("Capabilities could not be loaded.");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});

describe("CapabilitiesBrowserScreen's retry control -- repeated failure", () => {
  it("still shows the failure message and Retry control after a second failure following Retry, rather than getting stuck", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => {
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("Capabilities could not be loaded.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByText("Capabilities could not be loaded.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText("Loading capabilities…")).toBeNull();
  });
});

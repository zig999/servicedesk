import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailScreen -- the route to the listing stays available before the read answers (UNDERDETERMINED note: a-connector-configuration-surface-offers-a-route-to-the-listing owes it on every reading)", () => {
  it("renders the footer's Cancel link to /connectors while the read is still outstanding -- an implementation that withholds the route until the read answers would fail this", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub({ [CONFIGURATION_PATH]: () => pending });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByText(`Loading connector configuration ${CONNECTOR}…`);
    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("link", { name: "Cancel" }).getAttribute("href")).toBe(
      "/connectors",
    );

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));
  });
});

describe("ConnectorConfigurationDetailScreen -- the route does not turn on how the operator arrived (UNDERDETERMINED note: both route criteria are satisfiable by a reading that varies with arrival)", () => {
  it("renders the footer's Cancel link when the screen is loaded directly at its own address, carrying no navigation state recording arrival from the listing -- an implementation that renders the route only on an arrival-from-listing state would fail this", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock, `/connectors/${CONNECTOR}`);
    await screen.findByLabelText("Configuration");

    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("link", { name: "Cancel" })).toBeTruthy();
  });
});

describe("ConnectorConfigurationDetailScreen -- exactly one link renders while the read is outstanding or has failed (criterion 1, criterion 8)", () => {
  it("renders exactly one link, the footer's Cancel, during the loading phase", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub({ [CONFIGURATION_PATH]: () => pending });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByText(`Loading connector configuration ${CONNECTOR}…`);
    expect(screen.getAllByRole("link")).toHaveLength(1);

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));
  });

  it("renders exactly one link, the footer's Cancel, during the load-error phase", async () => {
    const fetchMock = createFetchStub({
      [CONFIGURATION_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByRole("button", { name: "Retry" });
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

describe("ConnectorConfigurationDetailScreen -- the loading phase states an outstanding read only (criteria 4, 6)", () => {
  it("states the configuration is still being read and presents no connector or configuration field", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub({ [CONFIGURATION_PATH]: () => pending });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByText(`Loading connector configuration ${CONNECTOR}…`);
    expect(screen.queryByLabelText("Connector")).toBeNull();
    expect(screen.queryByLabelText("Configuration")).toBeNull();

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));
  });

  it("offers no Retry control while the read is outstanding", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub({ [CONFIGURATION_PATH]: () => pending });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByText(`Loading connector configuration ${CONNECTOR}…`);
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));
  });
});

describe("ConnectorConfigurationDetailScreen -- the load-error phase states a failed read only (criterion 5)", () => {
  it("states the configuration could not be read and presents no connector or configuration field", async () => {
    const fetchMock = createFetchStub({
      [CONFIGURATION_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByText("Unable to load this connector configuration right now.");
    expect(screen.queryByLabelText("Connector")).toBeNull();
    expect(screen.queryByLabelText("Configuration")).toBeNull();
  });
});

describe("ConnectorConfigurationDetailScreen -- the discard control stays withheld before the read answers or once it fails (UNDERDETERMINED note: a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface withholds the act outside the ready phase)", () => {
  it("renders no Discard changes control while the read is still outstanding -- an implementation offering it in the loading window would fail this", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub({ [CONFIGURATION_PATH]: () => pending });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByText(`Loading connector configuration ${CONNECTOR}…`);
    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));
  });

  it("renders no Discard changes control once the read fails -- an implementation offering it in the load-error window would fail this", async () => {
    const fetchMock = createFetchStub({
      [CONFIGURATION_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByRole("button", { name: "Retry" });
    expect(screen.queryByRole("button", { name: "Discard changes" })).toBeNull();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailScreen -- the route to the listing stays available before the read answers (UNDERDETERMINED note: a-connector-configuration-surface-offers-a-route-to-the-listing owes it on every reading)", () => {
  it("renders 'Back to connector configurations' while the read is still outstanding -- an implementation that withholds the route until the read answers would fail this", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub({ [CONFIGURATION_PATH]: () => pending });
    await mountConnectorConfigurationDetailScreen(fetchMock);

    await screen.findByText(`Loading connector configuration ${CONNECTOR}…`);
    expect(screen.getByRole("link", { name: "Back to connector configurations" })).toBeTruthy();

    resolveGet(jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }));
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

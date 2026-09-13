import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";
import {
  HTTP_CONNECTOR_DEPARTURES_HEADING,
  httpConnectorMethodDepartureText,
  httpConnectorStatusMapEndingDepartureText,
} from "../services/connector-configuration-messages";
import {
  HTTP_CONNECTOR_METHODS,
  HTTP_CONNECTOR_STATUS_MAP_ENDINGS,
} from "../services/connector-configuration-http-departures";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function typeConfiguration(text: string): Promise<void> {
  const fetchMock = createFetchStub();
  await mountConnectorConfigurationCreateScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuração");
  fireEvent.change(configurationField, { target: { value: text } });
}

describe("ConnectorConfigurationFormFields -- a departure the pure judgment computes is stated on the surface (criterion 1 as rendered)", () => {
  it("renders the departures heading and the method departure's own text when the Configuration field holds an invalid method", async () => {
    await typeConfiguration(
      JSON.stringify({
        method: "get",
        statusMap: { "200": "ok" },
        responseMap: { id: "value" },
        address: "https://api.example.com",
      }),
    );

    expect(screen.getByText(HTTP_CONNECTOR_DEPARTURES_HEADING)).toBeTruthy();
    expect(
      screen.getByText(httpConnectorMethodDepartureText("get", HTTP_CONNECTOR_METHODS)),
    ).toBeTruthy();
  });
});

describe("ConnectorConfigurationFormFields -- no departure statement renders where the field's own judgment finds none (criterion 8 as rendered)", () => {
  it("renders no departures heading for a fully valid configuration", async () => {
    await typeConfiguration(
      JSON.stringify({
        method: "POST",
        statusMap: { "200": "ok" },
        responseMap: { id: "value" },
        address: "https://api.example.com",
      }),
    );

    expect(screen.queryByText(HTTP_CONNECTOR_DEPARTURES_HEADING)).toBeNull();
  });
});

describe("ConnectorConfigurationFormFields -- a statusMap ending outside the vocabulary is stated before the write, and the submission act stays offered (scenario: a-status-map-ending-outside-the-vocabulary-is-stated-before-the-write; the task's own resolved reading on Save)", () => {
  it("states the statusMap entry's own departure naming 200 and the four admitted endings, and leaves Save enabled while that departure stands", async () => {
    await typeConfiguration(
      JSON.stringify({
        method: "GET",
        statusMap: { "200": "OK" },
        responseMap: { id: "value" },
        address: "https://api.example.com",
      }),
    );

    expect(
      screen.getByText(
        httpConnectorStatusMapEndingDepartureText("200", "OK", HTTP_CONNECTOR_STATUS_MAP_ENDINGS),
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Salvar" }).hasAttribute("disabled")).toBe(false);
  });
});

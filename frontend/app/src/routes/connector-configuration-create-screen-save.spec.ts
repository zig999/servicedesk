import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  connectorPutPath,
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
  parsedPutBody,
  putCallCount,
} from "./connector-configuration-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

async function fillAndSave(connector: string, configuration: string): Promise<void> {
  const connectorInput = await screen.findByLabelText<HTMLInputElement>("Connector");
  fireEvent.change(connectorInput, { target: { value: connector } });
  const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");
  fireEvent.change(configurationField, { target: { value: configuration } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
}

describe("ConnectorConfigurationCreateScreen -- dispatches register-connector under the typed name (criterion 6)", () => {
  it("issues PUT /v1/connectors/{connector} with the typed connector name and the entered configuration", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse({ connector: "deepl-connector", configuration: "{}" }),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);

    await fillAndSave("deepl-connector", "{}");

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({ configuration: "{}" });
  });
});

describe("ConnectorConfigurationCreateScreen -- blocks dispatch while the connector name is empty (criterion 7)", () => {
  it("issues no PUT when Save is clicked with the connector name left blank", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");
    fireEvent.change(configurationField, { target: { value: "{}" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("String must contain at least 1 character(s)");
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationCreateScreen -- does not refuse a present, non-empty connector name (criterion 8)", () => {
  it("dispatches with no validation error for a single-character connector name", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("x")]: () => jsonResponse({ connector: "x", configuration: "{}" }),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);

    await fillAndSave("x", "{}");

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(screen.queryByText("String must contain at least 1 character(s)")).toBeNull();
  });
});

describe("ConnectorConfigurationCreateScreen -- blocks dispatch while the configuration text is not valid JSON (criterion 9)", () => {
  it("issues no PUT when Save is clicked with unparsable configuration text", async () => {
    const fetchMock = createFetchStub();
    await mountConnectorConfigurationCreateScreen(fetchMock);

    await fillAndSave("deepl-connector", "{not valid json");

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(putCallCount(fetchMock)).toBe(0);
  });
});

describe.each([
  { label: "a syntactically valid JSON array", text: "[1,2,3]" },
  { label: "syntactically valid JSON null", text: "null" },
])(
  "ConnectorConfigurationCreateScreen -- the configuration guard the specification actually requires, for $label (UNDERDETERMINED note: rules/integration/a-connector-configuration-holds-a-well-formed-object)",
  ({ text }) => {
    it("does not dispatch register-connector, since the value is valid JSON but not a well-formed object", async () => {
      const fetchMock = createFetchStub({
        [connectorPutPath("deepl-connector")]: () =>
          jsonResponse({ connector: "deepl-connector", configuration: text }),
      });
      await mountConnectorConfigurationCreateScreen(fetchMock);

      await fillAndSave("deepl-connector", text);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(putCallCount(fetchMock)).toBe(0);
    });
  },
);

describe("ConnectorConfigurationCreateScreen -- a registry refusal reaches the operator as a distinguishable message (criterion 10)", () => {
  it("shows ConnectorConfigurationNotWellFormedError's own message via toast, rather than swallowing the refusal", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse(
          {
            error: {
              code: "ConnectorConfigurationNotWellFormedError",
              message: "configuration must be well-formed",
            },
          },
          422,
        ),
    });
    await mountConnectorConfigurationCreateScreen(fetchMock);

    await fillAndSave("deepl-connector", "{}");

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This configuration is not syntactically valid JSON.",
      ),
    );
  });
});

describe("ConnectorConfigurationCreateScreen -- a successful save lands on the created record's own detail route (criterion 11)", () => {
  it("navigates to /connectors/{connector} after a successful save, not staying on /connectors/new", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse({ connector: "deepl-connector", configuration: "{}" }),
    });
    const router = await mountConnectorConfigurationCreateScreen(fetchMock);

    await fillAndSave("deepl-connector", "{}");

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/connectors/deepl-connector"),
    );
    expect(await screen.findByText("Connector Detail Placeholder")).toBeTruthy();
  });
});

describe("ConnectorConfigurationCreateScreen -- navigates using the submitted connector name, not the response body's own value (disclosed inference)", () => {
  it("navigates to /connectors/{typed-name} even when the PUT response echoes back a different connector value", async () => {
    const fetchMock = createFetchStub({
      [connectorPutPath("deepl-connector")]: () =>
        jsonResponse({ connector: "some-other-name", configuration: "{}" }),
    });
    const router = await mountConnectorConfigurationCreateScreen(fetchMock);

    await fillAndSave("deepl-connector", "{}");

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/connectors/deepl-connector"),
    );
    expect(router.state.location.pathname).not.toBe("/connectors/some-other-name");
  });
});

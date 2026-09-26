import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITIES_PATH,
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationDetailScreen,
  prettyPrinted,
} from "./connector-configuration-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function deleteCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "DELETE",
  ).length;
}

function deleteCallUrl(fetchMock: ReturnType<typeof createFetchStub>): string | undefined {
  const [call] = fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "DELETE",
  );
  const [input] = call ?? [];
  return typeof input === "string" ? input : undefined;
}

function removableHandlers(): ReturnType<typeof baseHandlers> {
  return baseHandlers(LOADED_CONFIGURATION, {
    [CONFIGURATION_PATH]: (method) =>
      method === "DELETE"
        ? new Response(null, { status: 204 })
        : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
  });
}

async function mountReady(): Promise<{
  fetchMock: ReturnType<typeof createFetchStub>;
  configurationField: HTMLTextAreaElement;
}> {
  const fetchMock = createFetchStub(removableHandlers());
  await mountConnectorConfigurationDetailScreen(fetchMock);
  const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuração");
  await waitFor(() => expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION)));
  return { fetchMock, configurationField };
}

function removeControlButton(): HTMLElement {
  return screen.getByRole("button", { name: "Remove connector configuration" });
}

async function openRemoveDialog(): Promise<void> {
  fireEvent.click(removeControlButton());
  await screen.findByRole("dialog");
}

function confirmRemoveButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", {
    name: "Remove connector configuration",
  });
}

function keepConfigurationButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Keep configuration" });
}

describe("ConnectorConfigurationDetailScreen -- offering a removal control (criterion 1)", () => {
  it("offers a Remove connector configuration control alongside the presented configuration", async () => {
    await mountReady();

    expect(removeControlButton()).toBeTruthy();
  });
});

describe("ConnectorConfigurationDetailScreen -- taking the removal control asks for confirmation (criterion 2)", () => {
  it("opens a confirmation dialog stating what taking the control would do, rather than acting immediately", async () => {
    await mountReady();

    await openRemoveDialog();

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByText("Removing this connector configuration cannot be undone."),
    ).toBeTruthy();
  });
});

describe("ConnectorConfigurationDetailScreen -- taking the removal control alone issues no DELETE (criterion 3)", () => {
  it("issues no DELETE request merely from opening the confirmation dialog", async () => {
    const { fetchMock } = await mountReady();

    await openRemoveDialog();

    expect(deleteCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationDetailScreen -- confirming removal issues the DELETE request (criterion 4)", () => {
  it("issues exactly one DELETE request to /v1/connectors/:connector, carrying the presented connector name, once the further act confirms", async () => {
    const { fetchMock } = await mountReady();

    await openRemoveDialog();
    fireEvent.click(confirmRemoveButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
    expect(deleteCallUrl(fetchMock)).toBe(CONFIGURATION_PATH);
  });
});

describe("ConnectorConfigurationDetailScreen -- declining the further act issues no DELETE (criterion 5)", () => {
  it("issues no DELETE request when Keep configuration is clicked", async () => {
    const { fetchMock } = await mountReady();

    await openRemoveDialog();
    fireEvent.click(keepConfigurationButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    expect(deleteCallCount(fetchMock)).toBe(0);
  });
});

describe("ConnectorConfigurationDetailScreen -- declining leaves the configuration presented unchanged (criterion 6)", () => {
  it("still presents the same configuration under the same connector name after Keep configuration is clicked", async () => {
    const { configurationField } = await mountReady();

    await openRemoveDialog();
    fireEvent.click(keepConfigurationButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    expect(configurationField.value).toBe(prettyPrinted(LOADED_CONFIGURATION));
    expect(screen.getByLabelText<HTMLInputElement>("Conector").value).toBe(CONNECTOR);
  });
});

describe("ConnectorConfigurationDetailScreen -- the further act asks for no typed confirmation (criterion 7)", () => {
  it("offers only Keep configuration and Remove connector configuration buttons in the dialog, with no text input", async () => {
    await mountReady();

    await openRemoveDialog();
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).queryByRole("textbox")).toBeNull();
    expect(keepConfigurationButton()).toBeTruthy();
    expect(confirmRemoveButton()).toBeTruthy();
  });
});

describe("ConnectorConfigurationDetailScreen -- the removal control is not withheld for a capability naming this connector (criterion 8)", () => {
  it("still offers an enabled Remove connector configuration control when a registered capability names this connector as its own", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(LOADED_CONFIGURATION, {
        [CAPABILITIES_PATH]: () =>
          jsonResponse({
            data: [
              {
                name: "some-capability",
                version: "1",
                nature: "read-only",
                input_schema: "{}",
                output_schema: "{}",
                timeout: 1000,
                connector: CONNECTOR,
                concept: "some-concept",
              },
            ],
          }),
      }),
    );
    await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuração");

    const button = await screen.findByRole("button", { name: "Remove connector configuration" });
    expect(button.hasAttribute("disabled")).toBe(false);
  });
});

describe("ConnectorConfigurationDetailScreen -- dismissing the confirmation with no explicit choice is not confirmation (UNDERDETERMINED note: a reading that treats an unchosen dismissal as confirm)", () => {
  it("issues no DELETE request when the confirmation dialog is dismissed through its own close control rather than through Keep configuration or Remove connector configuration -- an implementation that treats any dismissal with no explicit choice as confirmation would fail this", async () => {
    const { fetchMock } = await mountReady();

    await openRemoveDialog();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    expect(deleteCallCount(fetchMock)).toBe(0);
  });
});

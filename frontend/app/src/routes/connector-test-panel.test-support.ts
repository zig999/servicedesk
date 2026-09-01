import { createElement } from "react";
import { fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Capability } from "../hooks/use-capabilities";
import type { TestConnectorResult } from "../hooks/use-test-connector-panel";
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import { ConnectorConfigurationDetailScreen } from "./connector-configuration-detail-screen";
import {
  CONNECTORS_PATH,
  connectorConfiguration,
  connectorConfigurationsPage,
  connectorPutPath,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
} from "./connector-configurations-screen.test-support";

const DEFAULT_TEST_PANEL_CONFIGURATION_TEXT =
  '{"address":"https://api.example.com/${subject:account-id}"}';

export const CAPABILITIES_PATH = "/v1/capabilities";
export const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";
export const TEST_CONNECTOR_PATH = "/v1/test-connector";

export { jsonResponse };

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RecordedCall = [string | URL | Request, RequestInit | undefined];

export function testCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "translate-text",
    version: "1.0.0",
    nature: "read-only",
    input_schema: '{"kind":"TranslateTextInput"}',
    output_schema: '{"kind":"TranslateTextOutput"}',
    timeout: 5000,
    connector: "deepl-connector",
    concept: "translation",
    ...overrides,
  };
}

export function capabilitiesPage(data: readonly Capability[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

export function subjectTypeTermsPage(names: readonly string[]): unknown {
  return {
    data: names.map((name) => ({ name })),
    total: names.length,
    limit: 20,
    offset: 0,
    pageCount: 1,
  };
}

export function testConnectorResult(
  overrides: Partial<TestConnectorResult> = {},
): TestConnectorResult {
  return {
    request: {
      method: "POST",
      address: "https://api.deepl.example/v2/translate",
      headers: { "content-type": "application/json" },
      body: { text: "hello" },
    },
    response: {
      kind: "response",
      status: 200,
      headers: { "content-type": "application/json" },
      body: { translation: "hola" },
      elapsedMs: 42,
    },
    ...overrides,
  };
}

export function createTestPanelFetchStub(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (handler === undefined) {
      throw new Error(
        `connector-test-panel.test-support.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
}

export function callsToPath(fetchMock: Mock<FetchFn>, path: string): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([input]) => (typeof input === "string" ? input : input.toString()) === path)
    .map(([input, init]): RecordedCall => [input, init]);
}

function buildTestRouter() {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: ConnectorConfigurationsScreen,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/$connector",
    component: ConnectorConfigurationDetailScreen,
  });
  const routeTree = rootRoute.addChildren([listRoute, detailRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/connectors"] }),
  });
}

export async function mountTestPanelInEditMode(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Promise<{ dialog: HTMLElement; fetchMock: Mock<FetchFn> }> {
  const target = connectorConfiguration({
    connector: "deepl-connector",
    configuration: DEFAULT_TEST_PANEL_CONFIGURATION_TEXT,
  });
  const fetchMock = createConnectorConfigurationsFetchStub({
    [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    [connectorPutPath(target.connector)]: () => jsonResponse(target),
    ...handlers,
  });
  vi.stubGlobal("fetch", fetchMock);
  const router = buildTestRouter();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await router.load();
  const { container } = render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  await screen.findByText(target.connector);
  fireEvent.click(screen.getByRole("button", { name: target.connector }));
  await screen.findByRole("heading", { name: "Test" });
  await awaitCapabilitiesSettled();

  await new Promise((resolve) => setTimeout(resolve, 0));
  return { dialog: container, fetchMock };
}

export async function awaitCapabilitiesSettled(): Promise<void> {
  const loadingText = screen.queryByText("Loading registered capabilities…");
  if (loadingText !== null) {
    await waitForElementToBeRemoved(loadingText);
  }
}

export async function selectOptionAsync(labelText: string, optionName: string): Promise<void> {
  fireEvent.click(screen.getByLabelText(labelText));
  const listbox = await screen.findByRole("listbox");
  const option = await within(listbox).findByRole("option", { name: optionName });
  fireEvent.mouseDown(option);
}

export async function fillTestPanelBasics(
  dialog: HTMLElement,
  options: {
    readonly capabilityLabel: string;
    readonly subjectTypeName: string;
    readonly attribute: string;
    readonly value: string;
    readonly requester: string;
  },
): Promise<void> {
  await selectOptionAsync("Capability", options.capabilityLabel);
  await selectOptionAsync("Subject type", options.subjectTypeName);
  fireEvent.click(within(dialog).getByRole("button", { name: "Add attribute" }));
  const attributeInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Attribute");
  const valueInputs = within(dialog).getAllByLabelText<HTMLInputElement>("Value");
  fireEvent.change(attributeInputs[attributeInputs.length - 1], {
    target: { value: options.attribute },
  });
  fireEvent.change(valueInputs[valueInputs.length - 1], {
    target: { value: options.value },
  });
  fireEvent.change(within(dialog).getByLabelText("Requester"), {
    target: { value: options.requester },
  });
}

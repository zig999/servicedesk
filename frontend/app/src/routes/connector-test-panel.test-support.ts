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

// task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows changed
// useTestConnectorPanel's onAddAttribute from appending one empty row on every click to
// reconciling the panel's own attribute/value rows against every ${subject:<attribute>}
// placeholder Configuration's own current text embeds (use-test-connector-panel.ts's own header
// comment). connector-configurations-screen.test-support.ts's own connectorConfiguration()
// fixture default `configuration` text -- '{"apiKey":"secret"}' -- embeds no placeholder at all,
// so a caller here that mounted against it unmodified would see "Add attribute" reconcile to
// zero rows, leaving nothing to type an attribute name or value into. DEFAULT_TEST_PANEL_CONFIGURATION_TEXT
// below overrides that same fixture's own `configuration` field instead -- the exact field the GET
// this route's own useConnectorConfigurationDetail.ts issues resolves into state.configuration.value,
// and so into ConnectorTestPanel's own `configurationText` prop
// (connector-configuration-detail-ready-view.tsx's own header comment) -- mirroring the real
// production route this file's own mountTestPanelInEditMode already stands up, rather than
// inventing a shortcut around it (this file's own disclosed inference; see this task's proof
// record). "account-id" is the one name every existing caller of fillTestPanelBasics below already
// passes as its own `attribute` option, so this default keeps every one of those callers working
// unchanged.
const DEFAULT_TEST_PANEL_CONFIGURATION_TEXT =
  '{"address":"https://api.example.com/${subject:account-id}"}';

// Shared fixtures and mounting helper for
// task/connector-configuration-authoring/test-connector-debug-panel's own proof.
//
// ConnectorTestPanel used to render only inside ConnectorConfigurationFormDialog's own edit
// mode, reached by clicking a connector configurations list row's own "Edit" action. That action
// and the in-page edit dialog it opened are both gone: task/connector-capability-detail-editing/
// connector-configuration-detail-route (criteria 2 and 9) replaced them with a row click that
// navigates to the routed detail screen instead (connector-configurations-screen.tsx's own header
// comment), and ConnectorConfigurationDetailReadyView now composes the very same ConnectorTestPanel
// unchanged, scoped to that route's own `connector` identity
// (connector-configuration-detail-ready-view.tsx's own header comment). mountTestPanelInEditMode
// below is updated the same way production navigation now works: it mounts a small,
// self-contained router carrying both ConnectorConfigurationsScreen at "/connectors" and
// ConnectorConfigurationDetailScreen at "/connectors/$connector" (mirroring
// connector-configuration-detail-screen.test-support.ts's own buildTestRouter pattern, restated
// here locally rather than imported, since that module is a sibling task's own test-support and
// this file already restates its own fixture shapes rather than reaching across tasks for them),
// starts at the list, and clicks the one row it seeds -- the exact route this panel's own two
// dependent reads are now dispatched from. Its own exported name is kept exactly as every one of
// its five caller spec files already imports it.
//
// The panel depends on two of its own network reads settling before its fields are complete --
// useCapabilities() (GET /v1/capabilities) and useGlossaryVocabularyOptions("subject-type") (GET
// /v1/glossary/subject-type) -- so selectOptionAsync below (unlike
// capabilities-browser-screen.test-support.ts's own selectOption, which assumes its option
// already rendered) findBy-awaits the named option before selecting it: a caller never has to
// race either read by hand.

export const CAPABILITIES_PATH = "/v1/capabilities";
export const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";
export const TEST_CONNECTOR_PATH = "/v1/test-connector";

export { jsonResponse };

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/** The shape of one element of vitest's own `Mock<FetchFn>['mock']['calls']`. */
type RecordedCall = [string | URL | Request, RequestInit | undefined];

/** One full-fidelity capability fixture, mirroring domain/integration/capability's own eight fields -- a fresh declaration rather than an import from capabilities-browser-screen.test-support.ts, matching this app's own established convention of each screen's own test-support module restating the fixture shape it needs. */
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

/** A full-fidelity TestConnectorResult fixture -- every field overridable, since criteria 4-6 each assert this exact shape is rendered verbatim rather than recomputed from what the operator typed. */
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

/**
 * A fetch stub answering exactly the paths its own `handlers` map names; any other path fails
 * the test loudly rather than hanging it, mirroring connector-configurations-screen.test-support.ts's
 * own createConnectorConfigurationsFetchStub.
 */
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

/** Every call this fetch stub recorded at exactly `path`, whatever method it carried. */
export function callsToPath(fetchMock: Mock<FetchFn>, path: string): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([input]) => (typeof input === "string" ? input : input.toString()) === path)
    .map(([input, init]): RecordedCall => [input, init]);
}

/**
 * A small, self-contained router carrying both the connector configurations list and the routed
 * detail screen -- exactly the two routes production navigation now uses to reach
 * ConnectorTestPanel (this file's own header comment).
 */
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

/**
 * Mounts the connector configurations list with one connector configuration named
 * "deepl-connector", clicks that row to navigate to its own routed detail screen (the same
 * onRowClick navigation connector-configurations-screen.tsx now wires, StatusTable's own
 * role="button" data row), and awaits the Test section's own heading there -- confirming
 * ConnectorTestPanel actually mounted (and so its own two reads were dispatched). Unlike the
 * former in-page-dialog mount (whose own two extra `findByRole` awaits, opening the Dialog then
 * finding the heading inside it, happened to leave enough time for those two reads to settle
 * before returning), ConnectorTestPanel here only mounts once the routed screen's own load
 * settles into its "ready" phase, immediately alongside the "Test" heading -- so this also awaits
 * the capabilities read's own settling (awaitCapabilitiesSettled below) before returning, the same
 * postcondition every caller already relied on. Without it, a capabilities/subject-type read
 * still in flight when a caller's own first interaction fires can settle a moment later and
 * re-render use-test-connector-panel.ts's own consumers with a freshly recreated `onChange`
 * (that hook returns a fresh closure every render, not memoized) -- which reopens
 * JsonTextareaField's own mount-time pretty-print effect (its `selfInitiatedRef` guard was already
 * consumed by the caller's own preceding change) and reformats whatever was just typed. The
 * returned `dialog` is the render container holding the whole page (there is no popup Dialog to
 * scope to anymore, but every caller's own `within(dialog)` query still resolves correctly
 * against it).
 */
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
  // Flushes whatever transient re-render react-hook-form's own internal subscription mechanism
  // still has pending after useConnectorConfigurationDetail.ts's own load effect calls
  // `form.reset(...)` -- a real timer tick, not a bare microtask, since that mechanism notifies
  // subscribers on its own schedule rather than synchronously with the state update that made
  // this route's own phase "ready".
  await new Promise((resolve) => setTimeout(resolve, 0));
  return { dialog: container, fetchMock };
}

/** Awaits the capabilities read settling (its own loading text disappearing), for a test that needs to observe the *final*, empty-or-not option set rather than the transient loading one. A no-op if the text is already gone. */
export async function awaitCapabilitiesSettled(): Promise<void> {
  const loadingText = screen.queryByText("Loading registered capabilities…");
  if (loadingText !== null) {
    await waitForElementToBeRemoved(loadingText);
  }
}

/**
 * Selects `optionName` in the Select labeled `labelText`, findBy-awaiting the option itself
 * rather than assuming it already rendered -- both this panel's own Selects (Capability,
 * Subject type) are sourced from a network read that may still be pending when a test opens
 * them. TUI's own Select (select.tsx) selects an option on its own onMouseDown, never onClick,
 * so fireEvent.click alone never reaches it (mirrors capabilities-browser-screen.test-support.ts's
 * own selectOption, awaited here instead of assumed synchronous).
 */
export async function selectOptionAsync(labelText: string, optionName: string): Promise<void> {
  fireEvent.click(screen.getByLabelText(labelText));
  const listbox = await screen.findByRole("listbox");
  const option = await within(listbox).findByRole("option", { name: optionName });
  fireEvent.mouseDown(option);
}

/**
 * Fills every field the Test button's own `canTest` gate requires, awaiting both dependent reads
 * through selectOptionAsync above. Clicking "Add attribute" here reconciles to exactly one row
 * already named `options.attribute` -- this file's own DEFAULT_TEST_PANEL_CONFIGURATION_TEXT
 * embeds exactly one ${subject:<name>} placeholder, "account-id", the same name every caller of
 * this helper passes as `options.attribute` today (task/connector-test-panel-placeholder-attributes/
 * reconcile-test-panel-attribute-rows's own criterion 7) -- never a freshly appended blank row.
 * The Attribute-field edit below is therefore a no-op rewrite of that same name rather than the
 * naming of a fresh row; only the Value-field edit is a meaningfully new value this helper's own
 * callers still assert through it.
 */
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

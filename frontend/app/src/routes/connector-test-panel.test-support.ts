import { fireEvent, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import type { Capability } from "../hooks/use-capabilities";
import type { TestConnectorResult } from "../hooks/use-test-connector-panel";
import {
  CONNECTORS_PATH,
  connectorConfiguration,
  connectorConfigurationsPage,
  createConnectorConfigurationsFetchStub,
  jsonResponse,
  mountConnectorConfigurationsScreen,
} from "./connector-configurations-screen.test-support";

// Shared fixtures and mounting helper for
// task/connector-configuration-authoring/test-connector-debug-panel's own proof.
// ConnectorTestPanel renders only inside ConnectorConfigurationFormDialog's own edit mode, so
// every test reaching it goes through the same path: mount ConnectorConfigurationsScreen
// through connector-configurations-screen.test-support.ts's own mountConnectorConfigurationsScreen
// and createConnectorConfigurationsFetchStub (reused rather than duplicated -- this task adds no
// new listing/edit behavior of its own), click a row's own "Edit" action, and await the dialog.
// Every other fixture here is declared locally rather than imported from a sibling task's own
// test-support module, mirroring this app's own established convention of each screen's test
// support restating the shape it needs rather than reaching across tasks for one.
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
 * Mounts ConnectorConfigurationsScreen with one connector configuration named "deepl-connector",
 * opens its row's own Edit action, and awaits the Test section's own heading -- confirming
 * ConnectorTestPanel actually mounted (and so its own two reads were dispatched), without
 * asserting anything about whether either read has resolved yet.
 */
export async function mountTestPanelInEditMode(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Promise<{ dialog: HTMLElement; fetchMock: Mock<FetchFn> }> {
  const target = connectorConfiguration({ connector: "deepl-connector" });
  const fetchMock = createConnectorConfigurationsFetchStub({
    [CONNECTORS_PATH]: () => jsonResponse(connectorConfigurationsPage([target])),
    ...handlers,
  });
  await mountConnectorConfigurationsScreen(fetchMock);
  await screen.findByText(target.connector);
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  const dialog = await screen.findByRole("dialog");
  await within(dialog).findByRole("heading", { name: "Test" });
  return { dialog, fetchMock };
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

/** Fills every field the Test button's own `canTest` gate requires, awaiting both dependent reads through selectOptionAsync above. Adds exactly one attribute row. */
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

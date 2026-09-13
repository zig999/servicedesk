import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountConnectorConfigurationCreateScreen,
} from "./connector-configuration-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_ROUTE = "/v1/draft-connector-configuration-from-openapi";
const OPERATOR_LINK = "https://api.example.com/openapi.json";
const HELPER_OPERATION = { path: "/v2/translate", method: "POST" };
const CONNECTOR = "some-connector";

function operationsReadRoute(link: string): string {
  return `/v1/read-openapi-document-operations?link=${encodeURIComponent(link)}`;
}

function operationsReadJsonResponse(): Response {
  return jsonResponse({ operations: [HELPER_OPERATION] });
}

function draftResponse(configurationText: string): Response {
  return jsonResponse({
    connector: CONNECTOR,
    configuration: configurationText,
    unresolved: [],
    generated_credentials: [],
  });
}

async function mountCreateReady(draftConfigurationText: string): Promise<HTMLTextAreaElement> {
  const fetchMock = createFetchStub({
    [DRAFT_ROUTE]: () => draftResponse(draftConfigurationText),
    [operationsReadRoute(OPERATOR_LINK)]: operationsReadJsonResponse,
  });
  await mountConnectorConfigurationCreateScreen(fetchMock);
  return screen.findByLabelText<HTMLTextAreaElement>("Configuration");
}

async function chooseHelperOperation(path: string, method: string): Promise<void> {
  fireEvent.click(screen.getByLabelText("Operation"));
  const option = await screen.findByRole("option", { name: `${path} — ${method}` });
  fireEvent.mouseDown(option);
}

async function openApplyConfirmation(
  fieldText: string,
  draftConfigurationText: string,
): Promise<HTMLElement> {
  const configurationField = await mountCreateReady(draftConfigurationText);
  fireEvent.change(configurationField, { target: { value: fieldText } });

  fireEvent.change(screen.getByLabelText("Connector"), { target: { value: CONNECTOR } });
  fireEvent.change(screen.getByLabelText("OpenAPI document link"), {
    target: { value: OPERATOR_LINK },
  });
  await chooseHelperOperation(HELPER_OPERATION.path, HELPER_OPERATION.method);
  fireEvent.click(screen.getByRole("button", { name: "Request Draft" }));
  await screen.findByRole("button", { name: "Apply" });

  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  return screen.findByRole("dialog");
}

function listItem(dialog: HTMLElement, text: string): HTMLElement {
  return within(dialog).getByText((_content, element) => {
    if (element?.tagName !== "LI") {
      return false;
    }
    if (element.textContent !== text) {
      return false;
    }
    return Array.from(element.children).every((child) => child.textContent !== text);
  });
}

describe("ConnectorConfigurationFormFields -- the apply confirmation itemises the top-level keys applying the draft would add, remove or change (criteria 1, 2, 3)", () => {
  it("lists the added, removed and changed top-level keys between the unsaved edit and the draft", async () => {
    const dialog = await openApplyConfirmation('{"a":1,"b":2}', '{"b":3,"c":4}');

    expect(listItem(dialog, "Added: c")).toBeTruthy();
    expect(listItem(dialog, "Removed: a")).toBeTruthy();
    expect(listItem(dialog, "Changed: b")).toBeTruthy();
  });
});

describe("ConnectorConfigurationFormFields -- the apply confirmation itemises a shared statusMap object's own added and removed keys, one level deeper (criterion 4)", () => {
  it("lists statusMap's own added and removed keys, distinct from any top-level entry", async () => {
    const dialog = await openApplyConfirmation(
      '{"statusMap":{"200":"ok","404":"missing"}}',
      '{"statusMap":{"200":"ok","500":"error"}}',
    );

    expect(listItem(dialog, "Added: 500")).toBeTruthy();
    expect(listItem(dialog, "Removed: 404")).toBeTruthy();
  });
});

describe("ConnectorConfigurationFormFields -- the apply confirmation states that what would change cannot be itemised when the field's own content is not well-formed JSON (criterion 5)", () => {
  it("shows the not-itemisable statement instead of any added, removed or changed key", async () => {
    const dialog = await openApplyConfirmation("not json at all", '{"a":1}');

    expect(within(dialog).getByText(/cannot be itemised/)).toBeTruthy();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCapabilityCreateScreen,
  putCallCount,
} from "./capability-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const LINK = "https://api.example.com/openapi.json";
const OPERATIONS_ROUTE = `/v1/read-openapi-document-operations?link=${encodeURIComponent(LINK)}`;
const DRAFT_ROUTE = "/v1/draft-capability-schema-from-openapi";

function openOperationSelect(): void {
  fireEvent.click(screen.getByLabelText("Operação"));
}

describe("CapabilityFormFields -- the capability create screen offers the whole Schema Helper rules/integration/a-capability-authoring-surface-offers-a-schema-helper describes: inline beneath the two schema fields, waiting on a chosen operation, naming one only from the document's own listing, and requesting its draft without ever calling the capability registry (criteria 1, 4, 5, 6, 7, 8)", () => {
  it("walks from no operation chosen to a dispatched draft request, touching no register-capability call throughout", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [OPERATIONS_ROUTE]: () =>
          jsonResponse({ operations: [{ path: "/v2/translate", method: "POST" }] }),
        [DRAFT_ROUTE]: () => jsonResponse({ input_schema: "{}", output_schema: "{}", unresolved: [] }),
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");

    // beneath the Input/Output schema fields, inline on the same surface, never a separate screen or dialog (criterion 1)
    const outputSchemaField = screen.getByLabelText("Output schema");
    const heading = screen.getByRole("heading", { name: "Assistente de Schema" });
    expect(
      Boolean(outputSchemaField.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();

    // no operation chosen yet: states it waits, offers no request act, no free-hand entry (criteria 4, 5, 6)
    expect(screen.getByText("Escolha uma operação para solicitar um rascunho de schema.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Solicitar rascunho de schema" })).toBeNull();
    expect(screen.queryByRole("textbox", { name: /path/i })).toBeNull();
    expect(screen.queryByRole("textbox", { name: /method/i })).toBeNull();

    // names an operation only by choosing one of the document's own declared operations
    fireEvent.change(screen.getByLabelText("Link do documento OpenAPI"), { target: { value: LINK } });
    openOperationSelect();
    const listbox = screen.getByRole("listbox");
    const option = await within(listbox).findByRole("option", { name: /\/v2\/translate.*POST/i });
    fireEvent.mouseDown(option);

    // once chosen, the waiting statement is gone and the request act is offered (criterion 7)
    expect(screen.queryByText("Escolha uma operação para solicitar um rascunho de schema.")).toBeNull();
    const requestButton = await screen.findByRole("button", { name: "Solicitar rascunho de schema" });

    fireEvent.click(requestButton);

    // requesting the draft reaches the schema-draft route and never the capability registry (criterion 8)
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([input]) => (typeof input === "string" ? input : input.toString()) === DRAFT_ROUTE,
        ),
      ).toBe(true),
    );
    expect(putCallCount(fetchMock)).toBe(0);
  });
});

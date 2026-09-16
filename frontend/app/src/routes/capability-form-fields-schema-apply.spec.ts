import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  baseHandlers as createScreenBaseHandlers,
  createFetchStub as createCreateScreenFetchStub,
  errorResponse as createScreenErrorResponse,
  jsonResponse,
  mountCapabilityCreateScreen,
  putCallCount as createScreenPutCallCount,
} from "./capability-create-screen.test-support";
import {
  LOADED_INPUT_SCHEMA,
  baseHandlers as detailScreenBaseHandlers,
  createFetchStub as createDetailScreenFetchStub,
  mountCapabilityDetailScreen,
  prettyPrinted,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const LINK = "https://api.example.com/openapi.json";
const HELPER_OPERATION = { path: "/v2/translate", method: "POST" };
const DRAFT_ROUTE = "/v1/draft-capability-schema-from-openapi";

function operationsReadRoute(link: string): string {
  return `/v1/read-openapi-document-operations?link=${encodeURIComponent(link)}`;
}

const OPERATIONS_ROUTE = operationsReadRoute(LINK);

function operationsReadJsonResponse(): Response {
  return jsonResponse({ operations: [HELPER_OPERATION] });
}

// Already pretty-printed (2-space indent) so JsonTextareaField's own beautify-on-change
// effect never rewrites these once they land in a field -- the proof's own assertions
// compare this exact literal against the field's rendered value.
const TYPED_INPUT_TEXT = JSON.stringify({ operator: "typed-input" }, null, 2);
const TYPED_OUTPUT_TEXT = JSON.stringify({ operator: "typed-output" }, null, 2);
const DRAFTED_INPUT_SCHEMA_TEXT = JSON.stringify({ marker: "drafted-input" }, null, 2);
const DRAFTED_OUTPUT_SCHEMA_TEXT = JSON.stringify({ marker: "drafted-output" }, null, 2);

function draftedSchemaResponse(): Response {
  return jsonResponse({
    input_schema: DRAFTED_INPUT_SCHEMA_TEXT,
    output_schema: DRAFTED_OUTPUT_SCHEMA_TEXT,
    unresolved: [],
  });
}

async function requestSchemaDraft(): Promise<void> {
  await screen.findByLabelText("Connector");
  fireEvent.change(screen.getByLabelText("Link do documento OpenAPI"), { target: { value: LINK } });
  fireEvent.click(screen.getByLabelText("Operação"));
  const listbox = screen.getByRole("listbox");
  const option = await within(listbox).findByRole("option", { name: /\/v2\/translate.*POST/i });
  fireEvent.mouseDown(option);
  const requestButton = await screen.findByRole("button", { name: "Solicitar rascunho de schema" });
  fireEvent.click(requestButton);
}

function confirmationDialog(): HTMLElement {
  return screen.getByRole("dialog");
}

function confirmApplyButton(): HTMLElement {
  return within(confirmationDialog()).getByRole("button", { name: "Aplicar" });
}

function keepEditingButton(): HTMLElement {
  return within(confirmationDialog()).getByRole("button", { name: "Continuar editando" });
}

// Re-queried fresh at every call site rather than cached, and only ever called while no
// confirmation dialog is open -- open, the dialog's own "Aplicar" button would collide with
// these two and shift the index.
function schemaApplyButtons(): HTMLElement[] {
  return screen.getAllByRole("button", { name: "Aplicar" });
}

function inputSchemaApplyButton(): HTMLElement {
  const [button] = schemaApplyButtons();
  if (button === undefined) {
    throw new Error(
      "capability-form-fields schema-apply proof: expected an Aplicar button for the drafted input schema",
    );
  }
  return button;
}

function outputSchemaApplyButton(): HTMLElement {
  const button = schemaApplyButtons()[1];
  if (button === undefined) {
    throw new Error(
      "capability-form-fields schema-apply proof: expected an Aplicar button for the drafted output schema",
    );
  }
  return button;
}

describe("CapabilityFormFields -- a schema-draft answer's arrival, whether a draft or one of the refusal statements, leaves both the Input schema and the Output schema fields exactly as they stood before the request was dispatched (criteria 1, 2, 3; rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival)", () => {
  it("keeps both fields at whatever the operator had typed, both once a drafted outcome arrives and once a refusal statement arrives", async () => {
    // the same chosen operation is requested twice against one mount: drafted the first time,
    // refused the second -- so the whole fact is decided by one render, with no second mount
    // to clean up mid-test.
    let draftRequestCount = 0;
    const fetchMock = createCreateScreenFetchStub(
      createScreenBaseHandlers({
        [OPERATIONS_ROUTE]: operationsReadJsonResponse,
        [DRAFT_ROUTE]: () => {
          draftRequestCount += 1;
          return draftRequestCount === 1
            ? draftedSchemaResponse()
            : createScreenErrorResponse("OpenApiDocumentNotFetchedError");
        },
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    const inputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Input schema");
    const outputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Output schema");
    fireEvent.change(inputSchemaField, { target: { value: TYPED_INPUT_TEXT } });
    fireEvent.change(outputSchemaField, { target: { value: TYPED_OUTPUT_TEXT } });

    await requestSchemaDraft();
    await screen.findAllByRole("button", { name: "Aplicar" });

    // the drafted branch: arrival of a drafted outcome writes nothing on its own
    expect(inputSchemaField.value).toBe(TYPED_INPUT_TEXT);
    expect(outputSchemaField.value).toBe(TYPED_OUTPUT_TEXT);

    // requesting again from the same chosen operation resolves this time to a refusal (one
    // representative of the four -- the mechanism does not vary by which of the four fires,
    // since none of them ever renders the section that offers Apply)
    fireEvent.click(screen.getByRole("button", { name: "Solicitar rascunho de schema" }));
    await screen.findByRole("alert");

    // the refusal branch: arrival of a refusal writes nothing either
    expect(inputSchemaField.value).toBe(TYPED_INPUT_TEXT);
    expect(outputSchemaField.value).toBe(TYPED_OUTPUT_TEXT);
  });
});

describe("CapabilityFormFields -- applying either drafted schema writes only into its own field, is refused until the operator confirms it over an unsaved edit there, and registers no capability throughout (criteria 4, 5, 6, 7, 9, 10, 12; rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit)", () => {
  it("gates each field's own apply behind its own confirm, writes only the confirmed field, and leaves the other field and the registry untouched", async () => {
    const fetchMock = createCreateScreenFetchStub(
      createScreenBaseHandlers({
        [OPERATIONS_ROUTE]: operationsReadJsonResponse,
        [DRAFT_ROUTE]: draftedSchemaResponse,
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    const inputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Input schema");
    const outputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Output schema");
    fireEvent.change(inputSchemaField, { target: { value: TYPED_INPUT_TEXT } });
    fireEvent.change(outputSchemaField, { target: { value: TYPED_OUTPUT_TEXT } });

    await requestSchemaDraft();
    await screen.findAllByRole("button", { name: "Aplicar" });

    // opening the confirmation over the Input schema field's unsaved edit writes nothing yet (criterion 9)
    fireEvent.click(inputSchemaApplyButton());
    await screen.findByRole("dialog");
    expect(inputSchemaField.value).toBe(TYPED_INPUT_TEXT);
    expect(outputSchemaField.value).toBe(TYPED_OUTPUT_TEXT);

    // declining leaves the Input schema field exactly as it stood (criterion 10)
    fireEvent.click(keepEditingButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(inputSchemaField.value).toBe(TYPED_INPUT_TEXT);

    // confirming writes the drafted input_schema into the Input schema field alone (criteria 4, 5)
    fireEvent.click(inputSchemaApplyButton());
    await screen.findByRole("dialog");
    fireEvent.click(confirmApplyButton());
    await waitFor(() => expect(inputSchemaField.value).toBe(DRAFTED_INPUT_SCHEMA_TEXT));
    expect(outputSchemaField.value).toBe(TYPED_OUTPUT_TEXT);

    // confirming the Output schema field's own apply writes only there, leaving the just-applied
    // Input schema field untouched (criteria 6, 7)
    fireEvent.click(outputSchemaApplyButton());
    await screen.findByRole("dialog");
    fireEvent.click(confirmApplyButton());
    await waitFor(() => expect(outputSchemaField.value).toBe(DRAFTED_OUTPUT_SCHEMA_TEXT));
    expect(inputSchemaField.value).toBe(DRAFTED_INPUT_SCHEMA_TEXT);

    // none of the above ever registered the capability (criterion 12)
    expect(createScreenPutCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityFormFields -- applying a drafted schema onto a field holding no unsaved edit writes it immediately, opening no confirmation dialog (criterion 9, negative boundary)", () => {
  it("writes the drafted input schema straight into the empty Input schema field with no dialog", async () => {
    const fetchMock = createCreateScreenFetchStub(
      createScreenBaseHandlers({
        [OPERATIONS_ROUTE]: operationsReadJsonResponse,
        [DRAFT_ROUTE]: draftedSchemaResponse,
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    const inputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Input schema");

    await requestSchemaDraft();
    await screen.findAllByRole("button", { name: "Aplicar" });

    fireEvent.click(inputSchemaApplyButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(inputSchemaField.value).toBe(DRAFTED_INPUT_SCHEMA_TEXT));
  });
});

describe("CapabilityFormFields -- on the capability detail screen, applying a drafted input schema is offered just as on the create screen and reaches the same field state Discard already reads (criteria 8, 13)", () => {
  it("writes the drafted input schema through the field's own state, turning on Discard, which reads it back to the loaded baseline exactly as it would a typed edit", async () => {
    const fetchMock = createDetailScreenFetchStub(
      detailScreenBaseHandlers(undefined, undefined, {
        [OPERATIONS_ROUTE]: operationsReadJsonResponse,
        [DRAFT_ROUTE]: draftedSchemaResponse,
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    const inputSchemaField = await screen.findByLabelText<HTMLTextAreaElement>("Input schema");
    await waitFor(() => expect(inputSchemaField.value).toBe(prettyPrinted(LOADED_INPUT_SCHEMA)));
    const discardButton = screen.getByRole("button", { name: "Discard changes" });
    expect(discardButton.hasAttribute("disabled")).toBe(true);

    await requestSchemaDraft();
    await screen.findAllByRole("button", { name: "Aplicar" });

    fireEvent.click(inputSchemaApplyButton());

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(inputSchemaField.value).toBe(DRAFTED_INPUT_SCHEMA_TEXT));
    expect(discardButton.hasAttribute("disabled")).toBe(false);

    fireEvent.click(discardButton);
    await screen.findByRole("dialog");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Discard changes" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(inputSchemaField.value).toBe(prettyPrinted(LOADED_INPUT_SCHEMA));
  });
});

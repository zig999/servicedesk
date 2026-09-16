import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCapabilityCreateScreen,
} from "./capability-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const LINK = "https://api.example.com/openapi.json";
const A_DIFFERENT_LINK = "https://api.example.com/a-different-openapi.json";
const DRAFT_ROUTE = "/v1/draft-capability-schema-from-openapi";
const DRAFTED_INPUT_SCHEMA_TEXT = JSON.stringify({ marker: "drafted-input" }, null, 2);
const DRAFTED_OUTPUT_SCHEMA_TEXT = JSON.stringify({ marker: "drafted-output" }, null, 2);

function operationsReadRoute(link: string): string {
  return `/v1/read-openapi-document-operations?link=${encodeURIComponent(link)}`;
}

function openOperationSelect(): void {
  fireEvent.click(screen.getByLabelText("Operação"));
}

async function requestSchemaDraft(): Promise<void> {
  await screen.findByLabelText("Connector");
  fireEvent.change(screen.getByLabelText("Link do documento OpenAPI"), { target: { value: LINK } });
  openOperationSelect();
  const listbox = screen.getByRole("listbox");
  const option = await within(listbox).findByRole("option", { name: /\/v2\/translate.*POST/i });
  fireEvent.mouseDown(option);
  const requestButton = await screen.findByRole("button", { name: "Solicitar rascunho de schema" });
  fireEvent.click(requestButton);
}

describe("CapabilityFormFields -- a stated schema draft's staleness marking holds together end to end: retained while the link and chosen operation match what it was generated for, stated stale the instant only the link moves away, and its two apply acts stay offered and effective throughout (rule rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes)", () => {
  it("states no staleness right after the draft is stated, states it once the link alone changes, and still applies the same drafted input_schema afterward", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [operationsReadRoute(LINK)]: () =>
          jsonResponse({ operations: [{ path: "/v2/translate", method: "POST" }] }),
        [operationsReadRoute(A_DIFFERENT_LINK)]: () => jsonResponse({ operations: [] }),
        [DRAFT_ROUTE]: () =>
          jsonResponse({
            input_schema: DRAFTED_INPUT_SCHEMA_TEXT,
            output_schema: DRAFTED_OUTPUT_SCHEMA_TEXT,
            unresolved: [],
          }),
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await requestSchemaDraft();
    await screen.findAllByRole("button", { name: "Aplicar" });

    // stated as generated for LINK and POST /v2/translate, and not yet stale (criterion 3)
    expect(screen.queryByText(/desatualizado/i)).toBeNull();

    // only the link moves away from the one the draft was generated for; the chosen operation
    // is left untouched (criterion 4)
    fireEvent.change(screen.getByLabelText("Link do documento OpenAPI"), {
      target: { value: A_DIFFERENT_LINK },
    });

    expect(await screen.findByText(/desatualizado/i)).toBeTruthy();

    // the act applying its input_schema and the act applying its output_schema both remain
    // offered, enabled, and still write exactly what the draft carried (criterion 6)
    const applyButtons = screen.getAllByRole("button", { name: "Aplicar" });
    expect(applyButtons).toHaveLength(2);
    expect(applyButtons.every((button) => !button.hasAttribute("disabled"))).toBe(true);

    const inputSchemaField = screen.getByLabelText<HTMLTextAreaElement>("Input schema");
    const [inputApplyButton] = applyButtons;
    if (inputApplyButton === undefined) {
      throw new Error("capability-form-fields schema-draft-staleness proof: expected an Aplicar button for the input schema");
    }
    fireEvent.click(inputApplyButton);

    await waitFor(() => expect(inputSchemaField.value).toBe(DRAFTED_INPUT_SCHEMA_TEXT));
  });
});

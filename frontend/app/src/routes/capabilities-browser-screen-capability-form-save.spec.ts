import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";

// sonner is the toast boundary use-capability-form.ts's own onError handler calls into --
// mocking it here (mirroring glossary-browser-screen-concept-form-save.spec.ts's own
// established convention) intercepts that call directly, so these assertions never depend on
// a real Toaster mounting anything -- capabilities-browser-screen.test-support.ts's own
// mounting helper does not mount AppShell/Toaster at all.
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import {
  CAPABILITIES_PATH,
  CONCEPT_OPTIONS_PATH,
  capabilitiesPage,
  capability,
  capabilityPutPath,
  conceptOptionsPage,
  createCapabilitiesFetchStub,
  jsonResponse,
  mountCapabilitiesScreen,
  parsedPutBody,
  putCallCount,
  selectOption,
} from "./capabilities-browser-screen.test-support";

// Proof for task/capability-authoring/capability-create-edit-form's own criteria 5 and 6 --
// a non-read-only nature (and the registry's three other named refusals) reaches the operator
// as a visible, specific message rather than a generic or absent one, and a successful create
// or edit persists the capability's declared contract with the browser screen reflecting the
// change afterward -- plus the delivery record's own disclosed inference that the four new
// save-failure messages, and the shared generic fallback, are all mutually distinguishable.
//
// The former "a successful edit replaces the capability in place and the list reflects it
// (criterion 6)" describe block is retired: task/connector-capability-detail-editing/
// capability-detail-route (criteria 2 and 9) removed this screen's own per-row "Edit" button
// and its in-page edit dialog entirely, replacing them with a row click that navigates to the
// routed detail screen instead (capabilities-browser-screen.tsx's own header comment).
// capability-detail-screen-save.spec.ts's own proof already covers the equivalent
// PUT-with-edited-contract, reflected-afterward behavior for that routed screen. The four
// describe blocks below that used the same removed "Edit" action only as a shortcut to a
// pre-filled dialog -- the other-named-refusals loop, the five-mutually-distinct-messages
// test, the unmapped-failure fallback, and the double-submit guard -- are none of them
// specific to edit mode, so each is rewritten below to reach the dialog via the still-available
// "New capability" action instead, through the local openFilledCreateDialog helper.
//
// Criteria 1, 2 and their own inferences live in capabilities-browser-screen-detail.spec.ts,
// and criteria 3, 4 live in capabilities-browser-screen-capability-form-schema.spec.ts --
// split this way to stay under this project's own max-lines rule (MNT-01). All three share
// capabilities-browser-screen.test-support.ts's own fixtures, mounting helper and
// selectOption() helper.

const GENERIC_MESSAGE = "Something went wrong while saving this capability. Try again.";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

/**
 * Opens "New capability" and fills every field capabilityFormSchema requires (name, version,
 * connector, both JSON schemas as "{}", and the one available concept), leaving nature at its
 * own "read-only" default -- the same minimal fill capabilities-browser-screen-capability-
 * form-schema.spec.ts's own fillRequiredScalarFields/openNewCapabilityDialog pair uses, restated
 * here rather than imported since each sibling spec file already keeps its own local fixture
 * helpers. Reaches the four save-failure-handling tests below through the still-available
 * create path now that the per-row "Edit" shortcut they used to reach the dialog through is
 * gone.
 */
async function openFilledCreateDialog(
  fetchMock: Parameters<typeof mountCapabilitiesScreen>[0],
): Promise<HTMLElement> {
  await mountCapabilitiesScreen(fetchMock);
  await screen.findByText("No capabilities are currently registered.");

  fireEvent.click(screen.getByRole("button", { name: "New capability" }));
  const dialog = await screen.findByRole("dialog");
  fireEvent.change(await within(dialog).findByLabelText("Name"), {
    target: { value: "translate-text" },
  });
  fireEvent.change(within(dialog).getByLabelText("Version"), { target: { value: "1.0.0" } });
  fireEvent.change(within(dialog).getByLabelText("Connector"), {
    target: { value: "deepl-connector" },
  });
  fireEvent.change(within(dialog).getByLabelText("Input schema"), { target: { value: "{}" } });
  fireEvent.change(within(dialog).getByLabelText("Output schema"), { target: { value: "{}" } });
  selectOption("Concept", "translation");
  return dialog;
}

describe("CapabilitiesBrowserScreen — a successful create persists the contract and the list reflects it (criterion 6)", () => {
  it("issues PUT /v1/capabilities/{name}/{version} with the full declared contract, closes the Dialog, and the list shows the new capability afterward", async () => {
    let capabilities: ReturnType<typeof capability>[] = [];
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage(capabilities)),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => {
        capabilities = [capability({ name: "translate-text", version: "1.0.0", timeout: 8000 })];
        return jsonResponse(capabilities[0]);
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New capability" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Name"), {
      target: { value: "translate-text" },
    });
    fireEvent.change(within(dialog).getByLabelText("Version"), { target: { value: "1.0.0" } });
    fireEvent.change(within(dialog).getByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Timeout (ms)"), {
      target: { value: "8000" },
    });
    fireEvent.change(within(dialog).getByLabelText("Input schema"), { target: { value: "{}" } });
    fireEvent.change(within(dialog).getByLabelText("Output schema"), { target: { value: "{}" } });
    selectOption("Concept", "translation");
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({
      nature: "read-only",
      input_schema: "{}",
      output_schema: "{}",
      timeout: 8000,
      connector: "deepl-connector",
      concept: "translation",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(await screen.findByText("translate-text")).toBeTruthy();
  });
});

describe("CapabilitiesBrowserScreen — a non-read-only nature's refusal reaches the operator as a specific message (criterion 5)", () => {
  it('shows CapabilityNotReadOnlyError\'s own message, rather than a generic or absent one, when Nature is submitted as "mutating"', async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () =>
        jsonResponse(
          { error: { code: "CapabilityNotReadOnlyError", message: "nature must be read-only" } },
          422,
        ),
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("No capabilities are currently registered.");

    fireEvent.click(screen.getByRole("button", { name: "New capability" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Name"), {
      target: { value: "translate-text" },
    });
    fireEvent.change(within(dialog).getByLabelText("Version"), { target: { value: "1.0.0" } });
    fireEvent.change(within(dialog).getByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(within(dialog).getByLabelText("Input schema"), { target: { value: "{}" } });
    fireEvent.change(within(dialog).getByLabelText("Output schema"), { target: { value: "{}" } });
    selectOption("Concept", "translation");
    selectOption("Nature", "mutating");
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This capability's declared nature is not read-only; the registry only accepts read-only capabilities.",
      ),
    );
    expect(toast.error).not.toHaveBeenCalledWith(GENERIC_MESSAGE);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

const OTHER_REGISTRY_REFUSAL_CASES: readonly { readonly code: string; readonly message: string }[] = [
  {
    code: "IncompleteCapabilityContractError",
    message:
      "This capability does not declare its contract completely; every field of its contract is required.",
  },
  {
    code: "CapabilitySchemaNotWellFormedError",
    message: "The input schema or the output schema is not syntactically valid JSON.",
  },
  {
    code: "ConceptAlreadyAnsweredError",
    message:
      "Another capability already answers this concept; each concept resolves to exactly one capability.",
  },
];

describe("CapabilitiesBrowserScreen — the registry's other named refusals each reach the operator as their own specific message too (criterion 5, disclosed inference)", () => {
  for (const { code, message } of OTHER_REGISTRY_REFUSAL_CASES) {
    it(`shows ${code}'s own distinct message rather than the generic fallback, and keeps the Dialog open`, async () => {
      const fetchMock = createCapabilitiesFetchStub({
        [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
        [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
        [capabilityPutPath("translate-text", "1.0.0")]: () =>
          jsonResponse({ error: { code, message: "backend message" } }, 422),
      });
      const dialog = await openFilledCreateDialog(fetchMock);
      fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
  }

  it("shows five mutually distinct messages, one per failure kind, when the same Save button is used to trigger each of the four registry refusals plus the generic fallback in turn (disclosed inference)", async () => {
    const codes = [
      "CapabilityNotReadOnlyError",
      "IncompleteCapabilityContractError",
      "CapabilitySchemaNotWellFormedError",
      "ConceptAlreadyAnsweredError",
    ];
    let currentCode: string | null = codes[0];
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => {
        if (currentCode === null) {
          throw new Error("network down");
        }
        return jsonResponse({ error: { code: currentCode, message: "backend message" } }, 422);
      },
    });
    const dialog = await openFilledCreateDialog(fetchMock);
    const saveButton = within(dialog).getByRole("button", { name: "Save" });

    const observedMessages: unknown[] = [];
    for (const code of [...codes, null]) {
      currentCode = code;
      vi.mocked(toast.error).mockClear();
      fireEvent.click(saveButton);
      await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
      observedMessages.push(vi.mocked(toast.error).mock.calls[0]?.[0]);
    }

    expect(new Set(observedMessages).size).toBe(observedMessages.length);
    expect(observedMessages).toContain(GENERIC_MESSAGE);
  });
});

describe("CapabilitiesBrowserScreen — an unmapped save failure falls back to the generic message", () => {
  it("shows the shared generic save-failure toast for a failure error-ui-state.ts does not name", async () => {
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => {
        throw new Error("network down");
      },
    });
    const dialog = await openFilledCreateDialog(fetchMock);
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(GENERIC_MESSAGE);
    });
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("CapabilitiesBrowserScreen — saving twice in quick succession (edge case)", () => {
  it("issues exactly one PUT when Save is clicked twice before the first request resolves", async () => {
    let resolvePut: (response: Response) => void = () => {};
    const putPromise = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => putPromise,
    });
    const dialog = await openFilledCreateDialog(fetchMock);
    const saveButton = within(dialog).getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));

    await act(async () => {
      resolvePut(jsonResponse(capability({ name: "translate-text", version: "1.0.0" })));
    });
  });
});

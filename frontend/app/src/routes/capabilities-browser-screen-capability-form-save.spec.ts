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

describe("CapabilitiesBrowserScreen — a successful edit replaces the capability in place and the list reflects it (criterion 6)", () => {
  it("issues PUT at the existing name and version with the edited contract, and the list shows the change afterward", async () => {
    let capabilities = [capability({ name: "translate-text", version: "1.0.0", timeout: 5000 })];
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage(capabilities)),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => {
        capabilities = [capability({ name: "translate-text", version: "1.0.0", timeout: 9000 })];
        return jsonResponse(capabilities[0]);
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("translate-text");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(await within(dialog).findByLabelText("Timeout (ms)"), {
      target: { value: "9000" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual(expect.objectContaining({ timeout: 9000 }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(await screen.findByText("9000 ms")).toBeTruthy();
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
      const target = capability({ name: "translate-text", version: "1.0.0" });
      const fetchMock = createCapabilitiesFetchStub({
        [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
        [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
        [capabilityPutPath("translate-text", "1.0.0")]: () =>
          jsonResponse({ error: { code, message: "backend message" } }, 422),
      });
      await mountCapabilitiesScreen(fetchMock);
      await screen.findByText("translate-text");

      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      const dialog = await screen.findByRole("dialog");
      await within(dialog).findByLabelText("Name");
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
    const target = capability({ name: "translate-text", version: "1.0.0" });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => {
        if (currentCode === null) {
          throw new Error("network down");
        }
        return jsonResponse({ error: { code: currentCode, message: "backend message" } }, 422);
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("translate-text");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Name");
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
    const target = capability({ name: "translate-text", version: "1.0.0" });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => {
        throw new Error("network down");
      },
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("translate-text");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByLabelText("Name");
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
    const target = capability({ name: "translate-text", version: "1.0.0" });
    const fetchMock = createCapabilitiesFetchStub({
      [CAPABILITIES_PATH]: () => jsonResponse(capabilitiesPage([target])),
      [CONCEPT_OPTIONS_PATH]: () => jsonResponse(conceptOptionsPage(["translation"])),
      [capabilityPutPath("translate-text", "1.0.0")]: () => putPromise,
    });
    await mountCapabilitiesScreen(fetchMock);
    await screen.findByText("translate-text");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");
    const saveButton = await within(dialog).findByRole("button", { name: "Save" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));

    await act(async () => {
      resolvePut(jsonResponse(target));
    });
  });
});

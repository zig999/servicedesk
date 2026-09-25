import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  LOADED_CAPABILITY,
  NAME,
  VERSION,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCapabilityDetailScreen,
  type FetchResponder,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

function deleteCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return fetchMock.mock.calls.filter(([input, init]) => {
    const url = typeof input === "string" ? input : input.toString();
    return url === CAPABILITY_PATH && (init?.method ?? "GET").toUpperCase() === "DELETE";
  }).length;
}

async function mountReady(
  overrides: Record<string, FetchResponder> = {},
): Promise<ReturnType<typeof createFetchStub>> {
  const fetchMock = createFetchStub(baseHandlers(undefined, undefined, overrides));
  await mountCapabilityDetailScreen(fetchMock);
  await screen.findByLabelText("Connector");
  return fetchMock;
}

function removeTriggerButton(): HTMLElement {
  return screen.getByRole("button", { name: "Remove capability" });
}

async function openRemoveDialog(): Promise<void> {
  fireEvent.click(removeTriggerButton());
  await screen.findByRole("dialog");
}

function removeConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Remove capability" });
}

function removeCancelButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" });
}

describe("CapabilityDetailScreen -- the capability's surface offers a removal control (criterion 1)", () => {
  it("renders a Remove capability control alongside the capability it presents", async () => {
    await mountReady();

    expect(removeTriggerButton()).toBeTruthy();
  });
});

describe("CapabilityDetailScreen -- taking the removal control asks whether the removal is to be performed (criterion 2)", () => {
  it("opens a confirmation dialog asking whether the capability's removal is to be performed", async () => {
    await mountReady();

    await openRemoveDialog();

    expect(within(screen.getByRole("dialog")).getByText("Remove this capability?")).toBeTruthy();
  });
});

describe("CapabilityDetailScreen -- taking the removal control issues no DELETE (criterion 3)", () => {
  it("issues no DELETE request merely by opening the confirmation dialog", async () => {
    const fetchMock = await mountReady();

    await openRemoveDialog();

    expect(deleteCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityDetailScreen -- confirming the further act issues the DELETE (criterion 4)", () => {
  it("issues exactly one DELETE request to the presented capability's own resource path once the further act is confirmed", async () => {
    const fetchMock = await mountReady({
      [CAPABILITY_PATH]: (method) =>
        method === "DELETE" ? noContentResponse() : jsonResponse(LOADED_CAPABILITY),
    });
    await openRemoveDialog();

    fireEvent.click(removeConfirmButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
  });
});

describe("CapabilityDetailScreen -- declining the further act issues no DELETE (criterion 5)", () => {
  it("issues no DELETE request when Cancel is clicked in the confirmation dialog", async () => {
    const fetchMock = await mountReady();
    await openRemoveDialog();

    fireEvent.click(removeCancelButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(deleteCallCount(fetchMock)).toBe(0);
  });
});

describe("CapabilityDetailScreen -- declining leaves the capability presented unchanged (criterion 6)", () => {
  it("still presents the capability under its original name and version once the further act is declined", async () => {
    await mountReady();
    const nameField = screen.getByLabelText<HTMLInputElement>("Name");
    const versionField = screen.getByLabelText<HTMLInputElement>("Version");
    await openRemoveDialog();

    fireEvent.click(removeCancelButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(nameField.value).toBe(NAME);
    expect(versionField.value).toBe(VERSION);
  });
});

describe("CapabilityDetailScreen -- the further act asks for no typed name or version (criterion 7)", () => {
  it("offers no text input inside the confirmation dialog", async () => {
    await mountReady();

    await openRemoveDialog();

    expect(within(screen.getByRole("dialog")).queryByRole("textbox")).toBeNull();
  });
});

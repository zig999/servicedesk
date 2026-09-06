import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from "sonner";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  capabilityPutPath,
  createFetchStub,
  fillValidForm,
  jsonResponse,
  mountCapabilityCreateScreen,
} from "./capability-create-screen.test-support";

const NAME = "translate-text";
const VERSION = "1.0.0";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.success).mockClear();
});

describe("CapabilityCreateScreen -- a successful registration states its outcome, naming what was registered (criterion 4)", () => {
  it("shows a success statement naming the registered capability's own name and version once the registry answers", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [capabilityPutPath(NAME, VERSION)]: () => jsonResponse({ name: NAME, version: VERSION }),
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(`Capability ${NAME} ${VERSION} registered.`),
    );
  });
});

describe("CapabilityCreateScreen -- states no outcome before the registry has answered (task's own UNDERDETERMINED note)", () => {
  it("shows no success statement while the registration is still pending -- an implementation stating success at the moment of submit would fail this", async () => {
    let resolvePut!: (response: Response) => void;
    const pendingPut = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({
        [capabilityPutPath(NAME, VERSION)]: () => pendingPut,
      }),
    );
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByLabelText("Connector");
    fillValidForm({ name: NAME, version: VERSION });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true),
    );
    expect(toast.success).not.toHaveBeenCalled();

    resolvePut(jsonResponse({ name: NAME, version: VERSION }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(`Capability ${NAME} ${VERSION} registered.`),
    );
  });
});

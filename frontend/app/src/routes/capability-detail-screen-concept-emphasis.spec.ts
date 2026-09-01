import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  CAPABILITY_PATH,
  CONCEPTS_PATH,
  LOADED_CAPABILITY,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  mountCapabilityDetailScreen,
} from "./capability-detail-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityDetailScreen -- Concept's Select keeps its own value/onChange wiring", () => {
  it("still lets an operator change the selected concept", async () => {
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CONCEPTS_PATH]: () =>
          jsonResponse({
            data: [
              { name: "some-concept", accepts: ["capability"] },
              { name: "other-concept", accepts: ["capability"] },
            ],
          }),
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const trigger = screen.getByLabelText("Concept");
    expect(trigger.textContent).toContain("some-concept");

    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    fireEvent.mouseDown(within(listbox).getByRole("option", { name: "other-concept" }));

    expect(screen.getByLabelText("Concept").textContent).toContain("other-concept");
  });
});

describe("CapabilityDetailScreen -- Concept's Select stays disabled exactly while a save is in flight", () => {
  it("disables Concept's control only for the duration of a pending save, re-enabling once it resolves", async () => {
    let resolvePut!: (response: Response) => void;
    const pendingPut = new Promise<Response>((resolve) => {
      resolvePut = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers(undefined, undefined, {
        [CAPABILITY_PATH]: (method: string) =>
          method === "PUT" ? pendingPut : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    await mountCapabilityDetailScreen(fetchMock);
    await screen.findByLabelText("Connector");

    const connectorField = screen.getByLabelText<HTMLInputElement>("Connector");
    fireEvent.change(connectorField, { target: { value: "a-different-connector" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const conceptControl = screen.getByLabelText("Concept");
    await waitFor(() => expect(conceptControl.hasAttribute("disabled")).toBe(true));

    resolvePut(jsonResponse({}));

    await waitFor(() => expect(conceptControl.hasAttribute("disabled")).toBe(false));
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  CONCEPTS_PATH,
  CONCEPTS_RESPONSE,
  CONCEPT_NAME,
  baseHandlers,
  createFetchStub,
  errorResponse,
  jsonResponse,
  mountCapabilityCreateScreen,
  selectOption,
} from "./capability-create-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CapabilityCreateScreen -- routing (criteria 1 and 2)", () => {
  it("renders the create screen's own content when navigating to /capabilities/new", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    expect(await screen.findByRole("heading", { name: "New capability" })).toBeTruthy();
  });

  it("reaches the capability detail screen, not this create screen, at /capabilities/new/<version>", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    const router = await mountCapabilityCreateScreen(fetchMock, "/capabilities/new/v7");

    expect(await screen.findByText("Capability Detail Placeholder")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "New capability" })).toBeNull();
    expect(router.state.location.pathname).toBe("/capabilities/new/v7");
  });
});

describe("CapabilityCreateScreen -- name and version are both editable (criterion 3)", () => {
  it("renders the Name and Version inputs without the disabled attribute", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    const nameInput = await screen.findByLabelText<HTMLInputElement>("Name");
    const versionInput = screen.getByLabelText<HTMLInputElement>("Version");
    expect(nameInput.disabled).toBe(false);
    expect(versionInput.disabled).toBe(false);
  });
});

describe("CapabilityCreateScreen -- composes the shared form-fields component (criterion 4)", () => {
  it("renders every field CapabilityFormFields itself composes, plus the Save button", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.getByLabelText("Concept")).toBeTruthy();
    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.getByLabelText("Version")).toBeTruthy();
    expect(screen.getByLabelText("Nature")).toBeTruthy();
    expect(screen.getByLabelText("Timeout (ms)")).toBeTruthy();
    expect(screen.getByLabelText("Input schema")).toBeTruthy();
    expect(screen.getByLabelText("Output schema")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("links a validation error to its own field through aria-describedby, exactly as CapabilityFormFields' own FormField renders it", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);
    const nameInput = await screen.findByLabelText<HTMLInputElement>("Name");
    fireEvent.change(screen.getByLabelText("Version"), { target: { value: "1.0.0" } });
    fireEvent.change(screen.getByLabelText("Connector"), {
      target: { value: "deepl-connector" },
    });
    fireEvent.change(screen.getByLabelText("Input schema"), { target: { value: "{}" } });
    fireEvent.change(screen.getByLabelText("Output schema"), { target: { value: "{}" } });
    selectOption("Concept", CONCEPT_NAME);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("String must contain at least 1 character(s)");
    expect(nameInput.getAttribute("aria-invalid")).toBe("true");
    expect(nameInput.getAttribute("aria-describedby")).toBe("name-error");
  });
});

describe("CapabilityCreateScreen -- form state reflects the shared create/edit hook's own create-mode default (criterion 5)", () => {
  it("defaults Nature to read-only, the hook's own create-mode default", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.getByLabelText("Nature").textContent).toBe("read-only");
  });

  it("disables Save immediately on mount, since a blank schema is not valid JSON either -- the hook's own create-mode validity default", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByLabelText("Connector");
    expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  });
});

describe("CapabilityCreateScreen -- a loading state while the concept vocabulary is pending (criterion 6)", () => {
  it("renders a loading indicator instead of the form", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityCreateScreen(fetchMock);

    expect(await screen.findByText("Loading…")).toBeTruthy();
    expect(screen.queryByLabelText("Concept")).toBeNull();
  });
});

describe("CapabilityCreateScreen -- a failure state offering a retry when the concept vocabulary fails to load (criterion 7)", () => {
  it("renders a failure message and a Retry control instead of the form", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityCreateScreen(fetchMock);

    expect(await screen.findByText("Unable to load concepts.")).toBeTruthy();
    expect(screen.queryByLabelText("Concept")).toBeNull();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("re-issues the concept vocabulary read when Retry is clicked, reaching the ready form once it answers", async () => {
    let attempt = 0;
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => {
        attempt += 1;
        return attempt === 1
          ? errorResponse("SomeUpstreamError", 500)
          : jsonResponse(CONCEPTS_RESPONSE);
      },
    });
    await mountCapabilityCreateScreen(fetchMock);
    await screen.findByRole("button", { name: "Retry" });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByLabelText("Concept")).toBeTruthy();
  });

  it("keeps the Back link available while the load has failed (edge case: a dependency that fails)", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => errorResponse("SomeUpstreamError", 500),
    });
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByRole("button", { name: "Retry" });
    expect(screen.getByRole("link", { name: "Back to capabilities" })).toBeTruthy();
  });
});

describe("CapabilityCreateScreen -- a link back to the capabilities list (criterion 13)", () => {
  it("renders a 'Back to capabilities' link to /capabilities", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCapabilityCreateScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "Back to capabilities" });
    expect(link.getAttribute("href")).toBe("/capabilities");
  });

  it("renders the same Back link while the concept vocabulary is still loading", async () => {
    const fetchMock = createFetchStub({
      [CONCEPTS_PATH]: () => new Promise<Response>(() => {}),
    });
    await mountCapabilityCreateScreen(fetchMock);

    await screen.findByText("Loading…");
    expect(screen.getByRole("link", { name: "Back to capabilities" })).toBeTruthy();
  });
});

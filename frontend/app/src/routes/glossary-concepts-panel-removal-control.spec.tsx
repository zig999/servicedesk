import { createElement } from "react";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConceptsPanel } from "./glossary-concepts-panel";
import type { GlossaryConcept } from "../hooks/use-glossary-concepts";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type FetchResponder = () => Response | Promise<Response>;

const CONCEPTS_PATH = "/v1/glossary/concepts";

function conceptDeletePath(name: string): string {
  return `/v1/glossary/concepts/${encodeURIComponent(name)}`;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(
        `glossary-concepts-panel-removal-control.spec: no mocked response for ${key}`,
      );
    }
    return handler();
  });
}

function deleteCalls(
  fetchMock: ReturnType<typeof createFetchStub>,
): (readonly [string | URL | Request, RequestInit?])[] {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "DELETE",
  );
}

function deleteCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return deleteCalls(fetchMock).length;
}

function concept(overrides: Partial<GlossaryConcept> = {}): GlossaryConcept {
  return {
    name: "billing-dispute",
    accepts: ["customer-account"],
    ttl: 3600,
    description: "Tracks a customer-raised dispute over a billing charge.",
    ...overrides,
  };
}

function conceptsPage(concepts: readonly GlossaryConcept[]): { data: readonly GlossaryConcept[] } {
  return { data: concepts };
}

function mountConceptsPanel(
  fetchMock: FetchFn,
  queryClient: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
): void {
  vi.stubGlobal("fetch", fetchMock);
  render(createElement(QueryClientProvider, { client: queryClient }, createElement(ConceptsPanel)));
}

function findRow(name: string): HTMLElement {
  return screen.getByRole("row", { name: new RegExp(name) });
}

function clickRemoveTrigger(name: string): void {
  fireEvent.click(within(findRow(name)).getByRole("button", { name: "Remove" }));
}

function dialogConfirmButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" });
}

function dialogCancelButton(): HTMLElement {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ConceptsPanel — per-row removal control (criterion 1)", () => {
  it("offers a Remove control on every row the concepts listing shows", async () => {
    const fetchMock = createFetchStub({
      [`GET ${CONCEPTS_PATH}`]: () =>
        jsonResponse(
          conceptsPage([concept({ name: "billing-dispute" }), concept({ name: "fraud-flag" })]),
        ),
    });
    mountConceptsPanel(fetchMock);
    await screen.findByText("billing-dispute");
    await screen.findByText("fraud-flag");

    expect(
      within(findRow("billing-dispute")).getByRole("button", { name: "Remove" }),
    ).toBeTruthy();
    expect(within(findRow("fraud-flag")).getByRole("button", { name: "Remove" })).toBeTruthy();
  });
});

describe("ConceptsPanel — taking the removal control (criteria 2 and 3)", () => {
  it("asks whether the concept's removal is to be performed and issues no DELETE request on that asking alone", async () => {
    const fetchMock = createFetchStub({
      [`GET ${CONCEPTS_PATH}`]: () => jsonResponse(conceptsPage([concept({ name: "billing-dispute" })])),
    });
    mountConceptsPanel(fetchMock);
    await screen.findByText("billing-dispute");

    clickRemoveTrigger("billing-dispute");

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/remove concept/i)).toBeTruthy();
    expect(deleteCallCount(fetchMock)).toBe(0);
  });
});

describe("ConceptsPanel — declining the further act (criteria 5 and 6)", () => {
  it("issues no DELETE request and leaves the row listed unchanged under the same name when Cancel is taken", async () => {
    const fetchMock = createFetchStub({
      [`GET ${CONCEPTS_PATH}`]: () => jsonResponse(conceptsPage([concept({ name: "billing-dispute" })])),
    });
    mountConceptsPanel(fetchMock);
    await screen.findByText("billing-dispute");

    clickRemoveTrigger("billing-dispute");
    await screen.findByRole("dialog");
    fireEvent.click(dialogCancelButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(deleteCallCount(fetchMock)).toBe(0);
    expect(screen.getByText("billing-dispute")).toBeTruthy();
  });
});

describe("ConceptsPanel — confirming the further act (criterion 4)", () => {
  it("issues exactly one DELETE to /v1/glossary/concepts/:name carrying the acted-upon row's own concept name, not a different row's", async () => {
    const fetchMock = createFetchStub({
      [`GET ${CONCEPTS_PATH}`]: () =>
        jsonResponse(
          conceptsPage([concept({ name: "billing-dispute" }), concept({ name: "fraud-flag" })]),
        ),
      [`DELETE ${conceptDeletePath("fraud-flag")}`]: () => noContentResponse(),
    });
    mountConceptsPanel(fetchMock);
    await screen.findByText("billing-dispute");
    await screen.findByText("fraud-flag");

    clickRemoveTrigger("fraud-flag");
    await screen.findByRole("dialog");
    fireEvent.click(dialogConfirmButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
    const [[deleteUrl]] = deleteCalls(fetchMock);
    expect(typeof deleteUrl === "string" ? deleteUrl : deleteUrl.toString()).toBe(
      conceptDeletePath("fraud-flag"),
    );
  });
});

describe("ConceptsPanel — no name-typing in the further act (criterion 7)", () => {
  it("carries no text input asking the operator to type the concept's name", async () => {
    const fetchMock = createFetchStub({
      [`GET ${CONCEPTS_PATH}`]: () => jsonResponse(conceptsPage([concept({ name: "billing-dispute" })])),
    });
    mountConceptsPanel(fetchMock);
    await screen.findByText("billing-dispute");

    clickRemoveTrigger("billing-dispute");
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).queryAllByRole("textbox")).toHaveLength(0);
  });
});

describe("ConceptsPanel — dismissing the confirmation with no explicit choice (underdetermined, from the specification)", () => {
  it("issues no DELETE request, neither immediately nor after time passes, when the confirmation is dismissed with no explicit choice rather than declined or confirmed", async () => {
    const fetchMock = createFetchStub({
      [`GET ${CONCEPTS_PATH}`]: () => jsonResponse(conceptsPage([concept({ name: "billing-dispute" })])),
    });
    mountConceptsPanel(fetchMock);
    await screen.findByText("billing-dispute");

    clickRemoveTrigger("billing-dispute");
    const dialog = await screen.findByRole("dialog");

    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(60_000);
    vi.useRealTimers();

    expect(deleteCallCount(fetchMock)).toBe(0);
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    expect(deleteCallCount(fetchMock)).toBe(0);
    expect(screen.getByText("billing-dispute")).toBeTruthy();
  });
});

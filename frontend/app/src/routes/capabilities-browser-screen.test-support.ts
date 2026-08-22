import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import type { Capability } from "../hooks/use-capabilities";

// Shared fixtures and mounting helper for task/glossary-and-capabilities-browser/
// capabilities-browser-screen's proof, split across capabilities-browser-screen.spec.ts
// (listing, loading, error, empty-state and per-column formatting) and
// capabilities-browser-screen-detail.spec.ts (the row-selection detail panel), to keep
// each file focused on one reason to change -- the same convention
// version-manifest-screen.test-support.ts already establishes for this project's own
// max-lines rule.
//
// CapabilitiesBrowserScreen calls no router hook at all (no useParams, no Link, no
// useNavigate -- confirmed by reading capabilities-browser-screen.tsx in full), so unlike
// every other screen's own test-support module this one needs no
// createMemoryHistory/RouterProvider scaffolding, only a QueryClientProvider for its own
// useCapabilities() call.

export const CAPABILITIES_PATH = "/v1/capabilities";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

/**
 * A fetch stub answering exactly GET /v1/capabilities; any other URL fails the test loudly
 * rather than hanging it, mirroring cases-list-screen.spec.ts's own stubFetchResponses and
 * version-manifest-screen.test-support.ts's own createFetchStub.
 */
export function createCapabilitiesFetchStub(
  responder: () => Response | Promise<Response>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    if (url !== CAPABILITIES_PATH) {
      throw new Error(
        `capabilities-browser-screen.spec.ts: no mocked response registered for ${url}`,
      );
    }
    return responder();
  });
}

/** The page envelope useCapabilities() reads only `data` out of -- total/limit/offset/
 * pageCount are deliberately left unread, matching use-glossary-vocabulary.ts's own
 * convention this hook mirrors. */
export function capabilitiesPage(data: readonly Capability[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

/** One full-fidelity fixture carrying every field domain/integration/capability declares,
 * so a test overriding only what it cares about never has to restate the rest. */
export function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "translate-text",
    version: "1.0.0",
    nature: "read-only",
    input_schema: "TranslateTextInput",
    output_schema: "TranslateTextOutput",
    timeout: 5000,
    connector: "deepl-connector",
    concept: "translation",
    ...overrides,
  };
}

export async function mountCapabilitiesScreen(fetchMock: FetchFn): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(CapabilitiesBrowserScreen),
    ),
  );
}

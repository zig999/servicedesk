import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CapabilitiesBrowserScreen } from "./capabilities-browser-screen";
import type { Capability } from "../hooks/use-capabilities";

export const CAPABILITIES_PATH = "/v1/capabilities";
export const CONCEPT_OPTIONS_PATH = "/v1/glossary/concepts";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RecordedCall = [string | URL | Request, RequestInit | undefined];

export function capabilityPutPath(name: string, version: string): string {
  return `/v1/capabilities/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
}

export function requestsWithMethod(
  fetchMock: Mock<FetchFn>,
  method: string,
): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([, init]) => (init?.method ?? "GET").toUpperCase() === method)
    .map(([input, init]): RecordedCall => [input, init]);
}

export function putCallCount(fetchMock: Mock<FetchFn>): number {
  return requestsWithMethod(fetchMock, "PUT").length;
}

export function parsedPutBody(fetchMock: Mock<FetchFn>, index = 0): unknown {
  const rawBody = requestsWithMethod(fetchMock, "PUT")[index]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "capabilities-browser-screen.test-support.ts: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function capabilitiesPage(data: readonly Capability[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

export function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "translate-text",
    version: "1.0.0",
    nature: "read-only",
    input_schema: '{"kind":"TranslateTextInput"}',
    output_schema: '{"kind":"TranslateTextOutput"}',
    timeout: 5000,
    connector: "deepl-connector",
    concept: "translation",
    ...overrides,
  };
}

export function conceptOptionsPage(names: readonly string[]): unknown {
  return {
    data: names.map((name) => ({ name, accepts: [] })),
    total: names.length,
    limit: 20,
    offset: 0,
    pageCount: 1,
  };
}

export function createCapabilitiesFetchStub(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (handler === undefined) {
      throw new Error(
        `capabilities-browser-screen.test-support.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
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

export function selectOption(labelText: string, optionName: string): void {
  const trigger = screen.getByLabelText(labelText);
  fireEvent.click(trigger);
  const listbox = screen.getByRole("listbox");
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionName }));
}

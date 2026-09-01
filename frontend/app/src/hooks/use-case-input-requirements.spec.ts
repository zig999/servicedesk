import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCaseInputRequirements } from "./use-case-input-requirements";

const SLUG = "case with space";
const VERSION = 3;
const PATH = `/v1/cases/${encodeURIComponent(SLUG)}/versions/${VERSION}/input-requirements`;

const CAPABILITY_A = { name: "connector-x/collect-email", version: "1" };
const CAPABILITY_B = { name: "connector-y/collect-phone", version: "2" };
const REQUIREMENT = { attribute: "customer.email", required: true, capabilities: [CAPABILITY_A] };
const RESPONSE = {
  requirements: [REQUIREMENT],
  capabilities_with_malformed_input_schema: [CAPABILITY_B],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

function stubFetch(handlers: Record<string, () => Response | Promise<Response>>) {
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`useCaseInputRequirements proof: no mocked response for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function createWrapper(): {
  Wrapper: (props: { children: ReactNode }) => ReactElement;
  queryClient: QueryClient;
} {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper, queryClient };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCaseInputRequirements -- reading the published operation through apiFetch (criterion 1)", () => {
  it("reads GET /v1/cases/{slug}/versions/{version}/input-requirements, with the exact slug (encoded) and version given interpolated", async () => {
    stubFetch({ [PATH]: () => jsonResponse(RESPONSE) });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.requirements).toEqual(RESPONSE.requirements);
  });
});

describe("useCaseInputRequirements -- each requirement carrying its own attribute, required flag and capabilities (criterion 2)", () => {
  it("returns every requirement's own attribute name, required flag and asking capabilities, unmodified", async () => {
    const secondRequirement = {
      attribute: "customer.phone",
      required: false,
      capabilities: [CAPABILITY_B],
    };
    stubFetch({
      [PATH]: () =>
        jsonResponse({
          requirements: [REQUIREMENT, secondRequirement],
          capabilities_with_malformed_input_schema: [],
        }),
    });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.requirements).toHaveLength(2));
    expect(result.current.requirements[0]).toEqual(REQUIREMENT);
    expect(result.current.requirements[1]).toEqual(secondRequirement);
  });
});

describe("useCaseInputRequirements -- a requirement's capabilities carried by bare name/version identity alone (criterion 3)", () => {
  it("returns each capability as exactly {name, version}, restating none of its other registration fields", async () => {
    stubFetch({ [PATH]: () => jsonResponse(RESPONSE) });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.requirements).toHaveLength(1));
    const [capability] = result.current.requirements[0].capabilities;
    expect(Object.keys(capability).sort()).toEqual(["name", "version"]);
    expect(capability).toEqual(CAPABILITY_A);
  });
});

describe("useCaseInputRequirements -- capabilitiesWithMalformedInputSchema kept as its own separate list (criterion 4)", () => {
  it("never merges the malformed-input-schema capabilities into any requirement's own capabilities", async () => {
    stubFetch({ [PATH]: () => jsonResponse(RESPONSE) });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.requirements).toHaveLength(1));
    expect(result.current.requirements[0].capabilities).toEqual([CAPABILITY_A]);
    expect(result.current.capabilitiesWithMalformedInputSchema).toEqual([CAPABILITY_B]);
  });
});

describe("useCaseInputRequirements -- a malformed-schema capability named by bare identity alone (UNDERDETERMINED note)", () => {
  it("returns each capabilitiesWithMalformedInputSchema entry as exactly {name, version}, restating none of its nature, connector, schemas, timeout or answered concept", async () => {
    stubFetch({ [PATH]: () => jsonResponse(RESPONSE) });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() =>
      expect(result.current.capabilitiesWithMalformedInputSchema).toHaveLength(1),
    );
    const [malformed] = result.current.capabilitiesWithMalformedInputSchema;
    expect(Object.keys(malformed).sort()).toEqual(["name", "version"]);
  });
});

describe("useCaseInputRequirements -- an empty requirements response (criterion 5)", () => {
  it("resolves an empty requirement list rather than an error state when the read answers none", async () => {
    stubFetch({
      [PATH]: () =>
        jsonResponse({ requirements: [], capabilities_with_malformed_input_schema: [] }),
    });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(result.current.requirements).toEqual([]);
  });
});

describe("useCaseInputRequirements -- a failed read is never presented as an empty successful one (criterion 5, vice versa)", () => {
  it("reports isError true, not merely an empty requirements list, when the GET itself fails", async () => {
    stubFetch({ [PATH]: () => errorResponse("SomeUpstreamError", 500) });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.requirements).toEqual([]);
  });
});

describe("useCaseInputRequirements -- the loading state before the GET resolves (criterion 6)", () => {
  it("reports isLoading true before the GET resolves, then false once it does", async () => {
    let resolveGet!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    stubFetch({ [PATH]: () => pending });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    resolveGet(jsonResponse(RESPONSE));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

describe("useCaseInputRequirements -- refetch reissues the GET and returns void (criterion 6)", () => {
  it("issues a new GET when refetch is called, and refetch itself returns void", async () => {
    const fetchMock = stubFetch({ [PATH]: () => jsonResponse(RESPONSE) });
    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: createWrapper().Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const callsBeforeRefetch = fetchMock.mock.calls.length;

    const refetchResult = result.current.refetch();

    expect(refetchResult).toBeUndefined();
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRefetch));
  });
});

describe("useCaseInputRequirements -- issuing its own GET, independent of another hook's differently-keyed cache entry (an inference the implementation recorded)", () => {
  it("resolves from its own GET rather than a case-version cache entry an existing hook already populated for this same (slug, version)", async () => {
    const { Wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(["case-version", SLUG, VERSION], { from: "case-version-cache" });
    stubFetch({ [PATH]: () => jsonResponse(RESPONSE) });

    const { result } = renderHook(() => useCaseInputRequirements(SLUG, VERSION), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.requirements).toHaveLength(1));
    expect(result.current.requirements[0]).toEqual(REQUIREMENT);
  });
});

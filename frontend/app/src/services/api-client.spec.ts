import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./api-client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves with a 2xx response's JSON body unwrapped", async () => {
    const body = { id: "case-1", title: "A case" };
    const response = new Response(JSON.stringify(body), { status: 200 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const result = await apiFetch<typeof body>("/cases/case-1");

    expect(result).toEqual(body);
  });

  it("resolves without throwing on a 204 response, never attempting to parse an empty body", async () => {
    const response = new Response(null, { status: 204 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const result = await apiFetch<void>("/cases/case-1/manifest/H1");

    expect(result).toBeUndefined();
  });

  it("rejects with an ApiError carrying the envelope's own code and message for a non-2xx response", async () => {
    const response = new Response(
      JSON.stringify({ error: { code: "CaseNotFoundError", message: "case not found" } }),
      { status: 404 },
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const apiError = await apiFetch("/cases/missing").catch((error: unknown) => error);

    expect(apiError).toBeInstanceOf(ApiError);
    if (!(apiError instanceof ApiError)) {
      throw apiError;
    }
    expect(apiError.code).toBe("CaseNotFoundError");
    expect(apiError.message).toBe("case not found");
  });

  it("carries the envelope's details on the parsed ApiError when the response includes them", async () => {
    const details = { caseId: "case-1", attemptedStatus: "released" };
    const response = new Response(
      JSON.stringify({
        error: { code: "InvalidTransitionError", message: "cannot transition", details },
      }),
      { status: 409 },
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const apiError = await apiFetch("/cases/case-1/release").catch((error: unknown) => error);

    expect(apiError).toBeInstanceOf(ApiError);
    if (!(apiError instanceof ApiError)) {
      throw apiError;
    }
    expect(apiError.details).toEqual(details);
  });

  it("leaves details absent as an own property when the response envelope carries none", async () => {
    const response = new Response(
      JSON.stringify({ error: { code: "CaseNotFoundError", message: "case not found" } }),
      { status: 404 },
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const apiError = await apiFetch("/cases/missing").catch((error: unknown) => error);

    expect(apiError).toBeInstanceOf(ApiError);
    if (!(apiError instanceof ApiError)) {
      throw apiError;
    }
    expect("details" in apiError).toBe(false);
  });

  it("rejects with a typed ApiError, never a raw parse error, when a non-2xx response's body is not valid JSON", async () => {
    const response = new Response("not valid json{{{", {
      status: 500,
      statusText: "Internal Server Error",
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const apiError = await apiFetch("/cases/case-1").catch((error: unknown) => error);

    expect(apiError).toBeInstanceOf(ApiError);
    if (!(apiError instanceof ApiError)) {
      throw apiError;
    }
    expect(apiError.code).toBe("UNREADABLE_RESPONSE");
  });

  it("surfaces an ApiError with code UNREADABLE_RESPONSE when a non-2xx response's JSON body does not carry the error envelope shape", async () => {
    const response = new Response(JSON.stringify({ message: "something failed" }), {
      status: 500,
      statusText: "Internal Server Error",
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const apiError = await apiFetch("/cases/case-1").catch((error: unknown) => error);

    expect(apiError).toBeInstanceOf(ApiError);
    if (!(apiError instanceof ApiError)) {
      throw apiError;
    }
    expect(apiError.code).toBe("UNREADABLE_RESPONSE");
  });
});

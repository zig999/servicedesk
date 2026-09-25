import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from "sonner";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityDetail, type CapabilityDetailState } from "./use-capability-detail";
import {
  CAPABILITY_PATH,
  LOADED_CAPABILITY,
  NAME,
  VERSION,
  createWrapper,
  defaultHandlers,
  deferred,
  errorResponse,
  jsonResponse,
  readyState,
  stubFetch,
} from "./use-capability-detail.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

async function mountReadyCapabilityDetail(): Promise<{
  current: CapabilityDetailState;
}> {
  const { result } = renderHook(() => useCapabilityDetail(NAME, VERSION), {
    wrapper: createWrapper().Wrapper,
  });
  await waitFor(() => expect(result.current.phase).toBe("ready"));
  return result;
}

function successMessage(): string {
  const calls = vi.mocked(toast.success).mock.calls;
  const argument = calls[calls.length - 1]?.[0];
  if (typeof argument !== "string") {
    throw new Error(
      "use-capability-detail removal-outcome proof: expected toast.success's own argument to be a string",
    );
  }
  return argument;
}

function errorMessage(): string {
  const calls = vi.mocked(toast.error).mock.calls;
  const argument = calls[calls.length - 1]?.[0];
  if (typeof argument !== "string") {
    throw new Error(
      "use-capability-detail removal-outcome proof: expected toast.error's own argument to be a string",
    );
  }
  return argument;
}

async function captureRemoveFailureMessage(errorCode: string, status: number): Promise<string> {
  stubFetch(
    defaultHandlers({
      [CAPABILITY_PATH]: (method) =>
        method === "DELETE" ? errorResponse(errorCode, status) : jsonResponse(LOADED_CAPABILITY),
    }),
  );
  const result = await mountReadyCapabilityDetail();

  act(() => {
    readyState(result.current).onDelete();
  });

  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  const message = errorMessage();
  vi.mocked(toast.error).mockClear();
  return message;
}

describe("useCapabilityDetail -- a removal answered with HTTP 204 states success naming the removed capability (criterion 1)", () => {
  it("calls toast.success with a message naming the removed capability's own name and version", async () => {
    stubFetch(
      defaultHandlers({
        [CAPABILITY_PATH]: (method) =>
          method === "DELETE" ? noContentResponse() : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    const result = await mountReadyCapabilityDetail();

    act(() => {
      readyState(result.current).onDelete();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    const message = successMessage();
    expect(message).toContain(NAME);
    expect(message).toContain(VERSION);
  });
});

describe("useCapabilityDetail -- the success statement also states the identity is no longer registered (UNDERDETERMINED, from the specification -- a-submitted-removal-states-its-outcome-to-the-operator's success wording)", () => {
  it("states that the identity is no longer registered, not merely a generic confirmation naming it -- fails over a reading such as \"Done: some-capability v1\" that names the identity but never says it is no longer registered", async () => {
    stubFetch(
      defaultHandlers({
        [CAPABILITY_PATH]: (method) =>
          method === "DELETE" ? noContentResponse() : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    const result = await mountReadyCapabilityDetail();

    act(() => {
      readyState(result.current).onDelete();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(successMessage().toLowerCase()).toContain("no longer registered");
  });
});

describe("useCapabilityDetail -- a CapabilityCitedByEvidenceError refusal states that nothing was removed and that collected evidence names the capability (criteria 2, 3)", () => {
  it("states both facts in the refusal toast", async () => {
    const message = await captureRemoveFailureMessage("CapabilityCitedByEvidenceError", 409);

    expect(message.toLowerCase()).toContain("nothing was removed");
    expect(message.toLowerCase()).toContain("evidence");
  });
});

describe("useCapabilityDetail -- a refusal answered with HTTP 400 VALIDATION_ERROR states that nothing was removed, distinct from the CapabilityCitedByEvidenceError statement (criteria 4, 6)", () => {
  it("states nothing was removed with a message distinct from the cited-by-evidence refusal's own statement", async () => {
    const citedByEvidenceMessage = await captureRemoveFailureMessage("CapabilityCitedByEvidenceError", 409);
    const validationErrorMessage = await captureRemoveFailureMessage("VALIDATION_ERROR", 400);

    expect(validationErrorMessage.toLowerCase()).toContain("nothing was removed");
    expect(validationErrorMessage).not.toBe(citedByEvidenceMessage);
  });
});

describe("useCapabilityDetail -- a refusal answered with HTTP 500 INTERNAL_ERROR states that nothing was removed, distinct from the CapabilityCitedByEvidenceError statement (criteria 5, 7)", () => {
  it("states nothing was removed with a message distinct from the cited-by-evidence refusal's own statement", async () => {
    const citedByEvidenceMessage = await captureRemoveFailureMessage("CapabilityCitedByEvidenceError", 409);
    const internalErrorMessage = await captureRemoveFailureMessage("INTERNAL_ERROR", 500);

    expect(internalErrorMessage.toLowerCase()).toContain("nothing was removed");
    expect(internalErrorMessage).not.toBe(citedByEvidenceMessage);
  });
});

describe("useCapabilityDetail -- a refusal carrying an error code the surface does not recognise states that nothing was removed, distinct from the CapabilityCitedByEvidenceError statement (criteria 8, 9)", () => {
  it("states nothing was removed with a message distinct from the cited-by-evidence refusal's own statement", async () => {
    const citedByEvidenceMessage = await captureRemoveFailureMessage("CapabilityCitedByEvidenceError", 409);
    const unrecognisedMessage = await captureRemoveFailureMessage("SomeUpstreamRefusal", 422);

    expect(unrecognisedMessage.toLowerCase()).toContain("nothing was removed");
    expect(unrecognisedMessage).not.toBe(citedByEvidenceMessage);
  });
});

describe("useCapabilityDetail -- the refusal statement merges HTTP 400 VALIDATION_ERROR, HTTP 500 INTERNAL_ERROR and an unrecognised error code into the same generic statement, apart only from CapabilityCitedByEvidenceError (UNDERDETERMINED, from the specification -- a-submitted-removal-states-its-outcome-to-the-operator's own condition apart from every other condition)", () => {
  it("produces one identical statement for all three, distinct only from the CapabilityCitedByEvidenceError statement -- fails over a reading that gives each of the three its own distinct statement", async () => {
    const citedByEvidenceMessage = await captureRemoveFailureMessage("CapabilityCitedByEvidenceError", 409);
    const validationErrorMessage = await captureRemoveFailureMessage("VALIDATION_ERROR", 400);
    const internalErrorMessage = await captureRemoveFailureMessage("INTERNAL_ERROR", 500);
    const unrecognisedMessage = await captureRemoveFailureMessage("SomeUpstreamRefusal", 422);

    expect(validationErrorMessage).toBe(internalErrorMessage);
    expect(validationErrorMessage).toBe(unrecognisedMessage);
    expect(validationErrorMessage).not.toBe(citedByEvidenceMessage);
  });
});

describe("useCapabilityDetail -- while the removal has not been answered, the surface states neither success nor refusal (criterion 10)", () => {
  it("calls neither toast.success nor toast.error before the DELETE settles, and states the outcome only once it does", async () => {
    const pending = deferred<Response>();
    stubFetch(
      defaultHandlers({
        [CAPABILITY_PATH]: (method) =>
          method === "DELETE" ? pending.promise : jsonResponse(LOADED_CAPABILITY),
      }),
    );
    const result = await mountReadyCapabilityDetail();

    act(() => {
      readyState(result.current).onDelete();
    });
    await waitFor(() => expect(readyState(result.current).isDeleting).toBe(true));

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    await act(async () => {
      pending.resolve(noContentResponse());
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });
});

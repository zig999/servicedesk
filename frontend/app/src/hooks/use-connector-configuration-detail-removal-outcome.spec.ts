import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from "sonner";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useConnectorConfigurationDetail,
  type ConnectorConfigurationDetailState,
} from "./use-connector-configuration-detail";
import {
  CONFIGURATION_PATH,
  CONNECTOR,
  LOADED_CONFIGURATION,
  createWrapper,
  errorResponse,
  jsonResponse,
  readyState,
  stubFetch,
} from "./use-connector-configuration-detail.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

async function mountReadyConnectorConfigurationDetail(): Promise<{
  current: ConnectorConfigurationDetailState;
}> {
  const { result } = renderHook(() => useConnectorConfigurationDetail(CONNECTOR), {
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
      "use-connector-configuration-detail removal-outcome proof: expected toast.success's own argument to be a string",
    );
  }
  return argument;
}

function errorMessage(): string {
  const calls = vi.mocked(toast.error).mock.calls;
  const argument = calls[calls.length - 1]?.[0];
  if (typeof argument !== "string") {
    throw new Error(
      "use-connector-configuration-detail removal-outcome proof: expected toast.error's own argument to be a string",
    );
  }
  return argument;
}

async function captureRemovalFailureMessage(errorCode: string, status: number): Promise<string> {
  stubFetch({
    [CONFIGURATION_PATH]: (method) =>
      method === "DELETE"
        ? errorResponse(errorCode, status)
        : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
  });
  const result = await mountReadyConnectorConfigurationDetail();

  act(() => {
    readyState(result.current).onRemove();
  });

  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  const message = errorMessage();
  vi.mocked(toast.error).mockClear();
  return message;
}

describe("useConnectorConfigurationDetail -- a removal answered with HTTP 204 states success naming the removed connector (criterion 1)", () => {
  it("calls toast.success with a message naming the removed connector's own name", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "DELETE"
          ? noContentResponse()
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const result = await mountReadyConnectorConfigurationDetail();

    act(() => {
      readyState(result.current).onRemove();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(successMessage()).toContain(CONNECTOR);
  });
});

describe("useConnectorConfigurationDetail -- a refusal answered with HTTP 400 VALIDATION_ERROR states that nothing was removed (criterion 2)", () => {
  it("states nothing was removed in the refusal toast", async () => {
    const message = await captureRemovalFailureMessage("VALIDATION_ERROR", 400);
    expect(message.toLowerCase()).toContain("nothing was removed");
  });
});

describe("useConnectorConfigurationDetail -- a refusal answered with HTTP 500 INTERNAL_ERROR states that nothing was removed (criterion 3)", () => {
  it("states nothing was removed in the refusal toast", async () => {
    const message = await captureRemovalFailureMessage("INTERNAL_ERROR", 500);
    expect(message.toLowerCase()).toContain("nothing was removed");
  });
});

describe("useConnectorConfigurationDetail -- a refusal carrying an error code the surface does not recognise states that nothing was removed (criterion 4)", () => {
  it("states nothing was removed in the refusal toast", async () => {
    const message = await captureRemovalFailureMessage("SomeUpstreamRefusal", 502);
    expect(message.toLowerCase()).toContain("nothing was removed");
  });
});

describe("useConnectorConfigurationDetail -- while the removal has not been answered, the surface states neither success nor refusal (criterion 5)", () => {
  it("calls neither toast.success nor toast.error before the DELETE settles, and states the outcome only once it does", async () => {
    let resolveDelete!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveDelete = resolve;
    });
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "DELETE"
          ? pending
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const result = await mountReadyConnectorConfigurationDetail();

    act(() => {
      readyState(result.current).onRemove();
    });
    await waitFor(() => expect(readyState(result.current).isRemoving).toBe(true));

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    await act(async () => {
      resolveDelete(noContentResponse());
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });
});

describe("useConnectorConfigurationDetail -- the success statement also states no configuration is now registered under the connector's name (UNDERDETERMINED, from the specification -- a-submitted-removal-states-its-outcome-to-the-operator's success wording)", () => {
  it("states the connector's configuration is no longer registered, not merely a generic confirmation naming it -- fails over a reading such as \"Request for connector 'some-connector' completed successfully\" that names the connector but never says its configuration is no longer registered", async () => {
    stubFetch({
      [CONFIGURATION_PATH]: (method) =>
        method === "DELETE"
          ? noContentResponse()
          : jsonResponse({ connector: CONNECTOR, configuration: LOADED_CONFIGURATION }),
    });
    const result = await mountReadyConnectorConfigurationDetail();

    act(() => {
      readyState(result.current).onRemove();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(successMessage().toLowerCase()).toMatch(/removed|no longer registered/);
  });
});

describe("useConnectorConfigurationDetail -- the refusal statement is the same generic \"nothing was removed\" wording for HTTP 400 VALIDATION_ERROR, HTTP 500 INTERNAL_ERROR and an unrecognised error code alike (UNDERDETERMINED, from the specification -- a-submitted-removal-states-its-outcome-to-the-operator's own condition apart from every other condition; the implementation's disclosed, legitimate choice under this note)", () => {
  it("produces one identical statement across a 400, a 500 and an unrecognised code -- fails over a reading that distinguishes any of the three refusal conditions from another", async () => {
    const validationErrorMessage = await captureRemovalFailureMessage("VALIDATION_ERROR", 400);
    const internalErrorMessage = await captureRemovalFailureMessage("INTERNAL_ERROR", 500);
    const unrecognisedMessage = await captureRemovalFailureMessage("SomeUpstreamRefusal", 502);

    const distinctMessages = new Set([
      validationErrorMessage,
      internalErrorMessage,
      unrecognisedMessage,
    ]);
    expect(distinctMessages.size).toBe(1);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulateCase } from "./use-simulate-case";
import {
  SIMULATE_PATH,
  createWrapper,
  draftCaseRef,
  jsonResponse,
  loadedResult,
  requestBody,
  simulateResult,
  stubFetch,
} from "./use-simulate-case.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSimulateCase -- exposes a real response's own flat capability_name/capability_version fields unchanged (criterion 4)", () => {
  it("carries capability_name and capability_version through as flat string fields on the loaded evidence item, exactly as this task's own captured real response sent them", async () => {
    const fixture = simulateResult({
      evidence: [
        {
          concept: "perfil-mobile-tecnico",
          inputs: "{}",
          observation: '{"status":"active"}',
          observed_at: "2026-08-28T00:00:00.000Z",
          ttl: 3600,
          origin: "mobile-tecnico-connector",
          result: "ok",
          capability_name: "perfil-mobile-tecnico-reader",
          capability_version: "1.0.0",
          elapsed_ms: 340,
        },
      ],
    });
    stubFetch({ [SIMULATE_PATH]: () => jsonResponse(fixture) });
    const { result } = renderHook(() => useSimulateCase(), { wrapper: createWrapper().Wrapper });

    act(() => {
      result.current.onSimulate(requestBody(draftCaseRef()));
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    const [evidenceItem] = loadedResult(result.current).evidence;
    expect(evidenceItem?.capability_name).toBe("perfil-mobile-tecnico-reader");
    expect(evidenceItem?.capability_version).toBe("1.0.0");
    expect(evidenceItem).not.toHaveProperty("capability");
  });
});

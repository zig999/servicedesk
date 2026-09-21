import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import { toast } from "sonner";
import { useManifestBuilder } from "./use-manifest-builder";
import {
  SLUG,
  TWO_ENTRY_MANIFEST,
  VERSION,
  VERSION_PATH,
  apiErrorResponse,
  createFetchStub,
  createWrapper,
  jsonResponse,
  manifestPath,
  rowFor,
  stubFetch,
} from "./use-manifest-builder.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(toast.error).mockClear();
});

describe(
  "useManifestBuilder — a move refused for a reason this hook holds no classification of " +
    "its own for discloses neither the refusal's own error code nor its own message " +
    "(UNDERDETERMINED, from the specification — " +
    "rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for)",
  () => {
    it("raises only the fixed generic-failure toast, never the refusal's own error code or its own message, when a move is refused with a code other than the two this hook recognises", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
        [`PUT ${manifestPath("H2")}`]: () =>
          apiErrorResponse("SomeOtherRefusalCode", 500, "SECRET-REFUSAL-MESSAGE"),
      });
      stubFetch(fetchMock);
      const { result } = renderHook(() => useManifestBuilder(SLUG, VERSION), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.phase).toBe("ready"));

      act(() => {
        rowFor(result.current, "H2").onMoveUp();
      });

      await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
      expect(toast.error).toHaveBeenCalledWith("Something went wrong while saving. Try again.");
      const disclosed = vi.mocked(toast.error).mock.calls.flat().join(" ");
      expect(disclosed).not.toContain("SomeOtherRefusalCode");
      expect(disclosed).not.toContain("SECRET-REFUSAL-MESSAGE");
    });
  },
);

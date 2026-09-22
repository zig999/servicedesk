import { afterEach, describe, expect, it, vi } from "vitest";
// Several tests below mount the hypothesis-revision screen more than once inside a single test
// body to walk it through more than one reading; automatic cleanup only runs between separate
// it()s, not between renders inside one, so each mount past the first unmounts the prior render
// itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import {
  apiErrorResponse,
  baseHandlers,
  createFetchStub,
  fillValidForm,
  H1_REVISIONS,
  HYPOTHESES_PATH,
  jsonResponse,
  MANIFEST_PATH,
  mountHypothesisForm,
  NEW_HYPOTHESIS_PATH,
  parsedPostBody,
  postCallCount,
  revisePath,
  revisionsPath,
  SLUG,
  VERSION,
  VERSION_PATH,
} from "./hypothesis-revision-screen.test-support";

const NOT_VALID_TEXT = "This case's current version does not read back as a case.";
const LOAD_ERROR_TEXT = "Unable to load this form right now.";

function notValidResponse(): Response {
  return apiErrorResponse("CaseVersionNotValidError", 409, "validation failed");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "HypothesisRevisionScreen — the composition form is presented, on both entry points, while " +
    "the draft version's own read is refused because a validator rule of " +
    "validation-runs-at-every-read does not hold for it (criterion 1, criterion 3)",
  () => {
    it("renders the hypothesis composition form for New Hypothesis and for Revise Hypothesis when GET .../versions/{version} is refused with CaseVersionNotValidError, rather than the read-did-not-complete statement", async () => {
      const newHypothesisFetch = createFetchStub(
        baseHandlers({ [`GET ${VERSION_PATH}`]: notValidResponse }),
      );
      await mountHypothesisForm(newHypothesisFetch);

      expect(await screen.findByLabelText("Hypothesis name")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Save hypothesis" })).toBeTruthy();
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const reviseHypothesisFetch = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: notValidResponse,
          [`GET ${revisionsPath("H1")}`]: () => jsonResponse(H1_REVISIONS),
        }),
      );
      await mountHypothesisForm(reviseHypothesisFetch, revisePath("H1"));

      const nameInput = await screen.findByLabelText<HTMLInputElement>("Hypothesis name");
      expect(nameInput.value).toBe("H1");
      expect(screen.getByRole("button", { name: "Save hypothesis" })).toBeTruthy();
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();
    });
  },
);

describe(
  "HypothesisRevisionScreen — composing and submitting a hypothesis while the draft version's " +
    "own read is refused for failing validation lands it through the offered manifest route " +
    "(criterion 2; " +
    "rules/knowledge/a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case)",
  () => {
    it("issues POST /v1/cases/{slug}/hypotheses built from the composed form's own content and offers the route to this same draft version's own manifest on success, with no successful read of the draft version having occurred first", async () => {
      const fetchMock = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: notValidResponse,
          [`POST ${HYPOTHESES_PATH}`]: () =>
            jsonResponse({ hypothesis_name: "New Name", revision: 4 }, 201),
        }),
      );
      const router = await mountHypothesisForm(fetchMock);

      await fillValidForm("New Name");
      fireEvent.click(screen.getByRole("button", { name: "Save hypothesis" }));

      await waitFor(() => {
        expect(postCallCount(fetchMock)).toBe(1);
      });
      expect(parsedPostBody(fetchMock)).toMatchObject({
        hypothesis_name: "New Name",
        criterion: "Some criterion text",
        collects: ["ConceptA"],
        resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
      });

      expect(await screen.findByText('Hypothesis "New Name" saved as revision 4.')).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Open Manifest Builder" }));
      await waitFor(() => {
        expect(router.state.location.pathname).toBe(MANIFEST_PATH);
      });
    });
  },
);

describe(
  "HypothesisRevisionScreen — a successful compose-and-submit on the refused reading leaves " +
    "the placement into the manifest to the curator's own subsequent act, rather than the " +
    "screen itself choosing where the entry lands (UNDERDETERMINED, from the specification, " +
    "entry 1)",
  () => {
    it("issues no PUT to this draft version's own manifest-placement endpoint on a successful revise-hypothesis submission; only the route to the manifest builder is offered, leaving where the entry lands to the curator's own choice made there", async () => {
      const fetchMock = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: notValidResponse,
          [`POST ${HYPOTHESES_PATH}`]: () =>
            jsonResponse({ hypothesis_name: "New Name", revision: 4 }, 201),
        }),
      );
      await mountHypothesisForm(fetchMock);

      await fillValidForm("New Name");
      fireEvent.click(screen.getByRole("button", { name: "Save hypothesis" }));

      expect(await screen.findByText('Hypothesis "New Name" saved as revision 4.')).toBeTruthy();
      expect(
        fetchMock.mock.calls.some(([url, init]) => {
          const method = (init?.method ?? "GET").toUpperCase();
          const target = typeof url === "string" ? url : url.toString();
          return method === "PUT" && target.includes("/manifest/");
        }),
      ).toBe(false);
    });
  },
);

describe(
  "HypothesisRevisionScreen — the read-did-not-complete statement for a revisions read " +
    "failure shows nothing a prior successful read of that same data left cached, rather than " +
    "presenting a stale revision beside the notice as though it had been read " +
    "(UNDERDETERMINED, from the specification, entry 2)",
  () => {
    it("renders only the fixed read-did-not-complete statement, never a hypothesis revision recovered from an earlier successful read still cached, once that same revisions read fails again", async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(["hypothesis-revisions", SLUG, "H1"], H1_REVISIONS);
      const fetchMock = createFetchStub(
        baseHandlers({
          [`GET ${revisionsPath("H1")}`]: () => {
            throw new Error("network down");
          },
        }),
      );

      await mountHypothesisForm(fetchMock, revisePath("H1"), queryClient);

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryByText("Latest criterion text")).toBeNull();
      expect(screen.queryByDisplayValue("Latest criterion text")).toBeNull();
    });
  },
);

describe(
  "HypothesisRevisionScreen — a failure reading the glossary, or reading the hypothesis's own " +
    "revisions, still presents the read-did-not-complete statement, distinct from what the " +
    "screen presents for its own read of the draft version (criterion 4)",
  () => {
    it("renders the read-did-not-complete statement, never the composition form or the case-version statement, when GET /v1/glossary/concepts fails while the draft version reads back cleanly", async () => {
      const fetchMock = createFetchStub(
        baseHandlers({
          "GET /v1/glossary/concepts": () => {
            throw new Error("network down");
          },
        }),
      );
      await mountHypothesisForm(fetchMock);

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
      expect(screen.queryByLabelText("Hypothesis name")).toBeNull();
    });

    it("renders the read-did-not-complete statement, never the composition form or the case-version statement, when the hypothesis's own revisions read fails while the draft version reads back cleanly", async () => {
      const fetchMock = createFetchStub(
        baseHandlers({
          [`GET ${revisionsPath("H1")}`]: () => {
            throw new Error("network down");
          },
        }),
      );
      await mountHypothesisForm(fetchMock, revisePath("H1"));

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
      expect(screen.queryByLabelText("Hypothesis name")).toBeNull();
    });
  },
);

describe(
  "HypothesisRevisionScreen — a refusal of the draft version's own read carrying an error code " +
    "the screen holds no presentation of its own for is presented exactly as a read that did " +
    "not complete, disclosing nothing further (criterion 5; " +
    "rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete)",
  () => {
    it("renders the same read-did-not-complete statement an unrelated failed read renders, and discloses neither the refusal's own error code, its own message, nor any value it carries", async () => {
      const unmappedFetch = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: () =>
            jsonResponse(
              {
                error: {
                  code: "SomeUnrecognizedError",
                  message: "SECRET-REFUSAL-MESSAGE",
                  details: { subject: "SECRET-DETAIL" },
                },
              },
              500,
            ),
        }),
      );
      await mountHypothesisForm(unmappedFetch);

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
      expect(screen.queryByText("SomeUnrecognizedError")).toBeNull();
      expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();
      expect(screen.queryByText("SECRET-DETAIL")).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const failedToCompleteFetch = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: () => {
            throw new Error("network down");
          },
        }),
      );
      await mountHypothesisForm(failedToCompleteFetch);

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
    });
  },
);

describe(
  "HypothesisRevisionScreen — the case-keyed statement for the draft version's own refused " +
    "read discloses no attribute of that version, not even one left over in the query cache " +
    "from an earlier successful read on the same shared case-version query key " +
    "(rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case)",
  () => {
    it("renders the explicit case-keyed statement and never the subject type a prior successful read of this same case-version query key left cached, once that same key's read is refused for failing validation", async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(["case-version", SLUG, VERSION], {
        subject: "SECRET-SUBJECT-TYPE",
        manifest: [],
      });
      const fetchMock = createFetchStub(
        baseHandlers({ [`GET ${VERSION_PATH}`]: notValidResponse }),
      );

      await mountHypothesisForm(fetchMock, NEW_HYPOTHESIS_PATH, queryClient);

      expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
      expect(screen.queryByDisplayValue("SECRET-SUBJECT-TYPE")).toBeNull();
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();
    });
  },
);

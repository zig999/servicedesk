import { afterEach, describe, expect, it, vi } from "vitest";
// Several tests below mount the manifest builder more than once inside a single test body to
// walk it through more than one reading; automatic cleanup only runs between separate it()s,
// not between renders inside one, so each mount past the first unmounts the prior render
// itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import {
  apiErrorResponse,
  createFetchStub,
  entry,
  jsonResponse,
  mountManifestScreen,
  NEW_HYPOTHESIS_PATH,
  SLUG,
  TWO_ENTRY_MANIFEST,
  VERSION,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

const NOT_VALID_TEXT = `Version ${VERSION} of this case does not read back as a case.`;
const LOAD_ERROR_TEXT = "Unable to load this manifest right now.";

function notValidResponse(): Response {
  return apiErrorResponse("CaseVersionNotValidError", 409, "validation failed");
}

function notValidResponseCarrying(details: Record<string, unknown>): Response {
  return jsonResponse(
    { error: { code: "CaseVersionNotValidError", message: "validation failed", details } },
    409,
  );
}

function unrecognizedResponseCarrying(details: Record<string, unknown>): Response {
  return jsonResponse(
    { error: { code: "SomeUnrecognizedError", message: "SECRET-REFUSAL-MESSAGE", details } },
    500,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "VersionManifestScreen — a version refused for validation states explicitly that it does " +
    "not read back as a case, distinct from a read that did not complete, and states none of " +
    "this once the version reads back cleanly (criterion 1, criterion 2; " +
    "rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case)",
  () => {
    it("renders the explicit statement and no manifest entry when validation refuses the read, renders neither that statement nor any load-error text once the same version reads back as a validated case", async () => {
      const refusedFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          notValidResponseCarrying({ manifest: [entry(1, "SECRET-HYPOTHESIS", 1)] }),
      });
      await mountManifestScreen(refusedFetch);

      expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();
      expect(screen.queryByLabelText("SECRET-HYPOTHESIS")).toBeNull();
      expect(screen.queryByRole("table")).toBeNull();

      cleanup();
      vi.unstubAllGlobals();

      const validFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      });
      await mountManifestScreen(validFetch);

      await screen.findByLabelText("H1");
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    });
  },
);

describe(
  "VersionManifestScreen — no manifest entry recovered from an earlier successful read still " +
    "cached reaches the not-valid statement (UNDERDETERMINED entry 1; " +
    "rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case)",
  () => {
    it("renders only the not-read-back-as-a-case statement, never a manifest entry left over in the query cache from an earlier successful read, once a later reading of the same version is refused for validation", async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(["case-version", SLUG, VERSION], TWO_ENTRY_MANIFEST);
      const fetchMock = createFetchStub({ [`GET ${VERSION_PATH}`]: notValidResponse });

      await mountManifestScreen(fetchMock, undefined, queryClient);

      expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
      expect(screen.queryByLabelText("H1")).toBeNull();
      expect(screen.queryByLabelText("H2")).toBeNull();
    });
  },
);

describe(
  "VersionManifestScreen — the add-hypothesis act on the reading refused for validation (criterion 3)",
  () => {
    it("renders the + Add hypothesis link targeting this version's own new-hypothesis route on the reading refused for validation, with no successful read of the version having occurred first", async () => {
      const fetchMock = createFetchStub({ [`GET ${VERSION_PATH}`]: notValidResponse });
      await mountManifestScreen(fetchMock);

      const link = await screen.findByRole("link", { name: "+ Add hypothesis" });
      expect(link.getAttribute("href")).toBe(NEW_HYPOTHESIS_PATH);
    });
  },
);

describe(
  "VersionManifestScreen — the add-hypothesis act is offered on every reading short of one " +
    "answering the version released " +
    "(rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions)",
  () => {
    it("renders the + Add hypothesis link while the read is pending, once it has failed to complete, once it has been refused for validation, once it has answered a draft version with entries and once with none, and withholds it only once it has answered a version released", async () => {
      const pendingFetch = vi.fn(() => new Promise<Response>(() => {}));
      await mountManifestScreen(pendingFetch);
      screen.getByRole("link", { name: "+ Add hypothesis" });

      cleanup();
      vi.unstubAllGlobals();

      const failedFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
      });
      await mountManifestScreen(failedFetch);
      await screen.findByText(LOAD_ERROR_TEXT);
      screen.getByRole("link", { name: "+ Add hypothesis" });

      cleanup();
      vi.unstubAllGlobals();

      const notValidFetch = createFetchStub({ [`GET ${VERSION_PATH}`]: notValidResponse });
      await mountManifestScreen(notValidFetch);
      await screen.findByText(NOT_VALID_TEXT);
      screen.getByRole("link", { name: "+ Add hypothesis" });

      cleanup();
      vi.unstubAllGlobals();

      const emptyDraftFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () => jsonResponse({ state: "draft", manifest: [] }),
      });
      await mountManifestScreen(emptyDraftFetch);
      await screen.findByRole("heading", { name: /Manifest/ });
      screen.getByRole("link", { name: "+ Add hypothesis" });

      cleanup();
      vi.unstubAllGlobals();

      const draftFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ state: "draft", manifest: [entry(1, "H1", 2)] }),
      });
      await mountManifestScreen(draftFetch);
      await screen.findByLabelText("H1");
      screen.getByRole("link", { name: "+ Add hypothesis" });

      cleanup();
      vi.unstubAllGlobals();

      const releasedFetch = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ state: "released", manifest: [entry(1, "H1", 2)] }),
      });
      await mountManifestScreen(releasedFetch);
      await screen.findByLabelText("H1");
      expect(
        screen.queryByRole("link", { name: "+ Add hypothesis" }),
        "expected the offer withheld once the version reads back released",
      ).toBeNull();
    });
  },
);

describe(
  "VersionManifestScreen — a refusal carrying an error code the screen holds no presentation " +
    "of its own for states only the read-did-not-complete statement, disclosing nothing " +
    "further (criterion 4; " +
    "rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete)",
  () => {
    it("renders only the fixed read-did-not-complete statement, never the not-valid statement, the refusal's own error code, its own message, or any value it carries, when the version's own read fails with a code the screen holds no presentation of its own for", async () => {
      const fetchMock = createFetchStub({
        [`GET ${VERSION_PATH}`]: () =>
          unrecognizedResponseCarrying({ manifest: [entry(1, "SECRET-HYPOTHESIS", 1)] }),
      });
      await mountManifestScreen(fetchMock);

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
      expect(screen.queryByText("SomeUnrecognizedError")).toBeNull();
      expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();
      expect(screen.queryByLabelText("SECRET-HYPOTHESIS")).toBeNull();
    });
  },
);

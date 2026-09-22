import { afterEach, describe, expect, it, vi } from "vitest";
// Several tests below mount the version editor more than once inside a single test body to
// walk it through more than one reading; automatic cleanup only runs between separate it()s,
// not between renders inside one, so each mount past the first unmounts the prior render
// itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  SLUG,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

const NOT_VALID_TEXT = "This case's current version does not read back as a case.";
const LOAD_ERROR_TEXT = "Unable to load this version right now.";

function notValidResponse(): Response {
  return jsonResponse(
    { error: { code: "CaseVersionNotValidError", message: "validation failed" } },
    409,
  );
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

const SECRET_VERSION_CONTENT = {
  title: "SECRET-TITLE",
  when_to_use: "SECRET-WHEN-TO-USE",
  subject: "SECRET-SUBJECT",
  fallback: { outcome: "SECRET-FALLBACK-OUTCOME" },
  consolidation_register: "SECRET-CONSOLIDATION-REGISTER",
  state: "SECRET-STATE",
  manifest: ["SECRET-MANIFEST-ENTRY"],
};

function expectNoneOfSecretVersionContent(): void {
  expect(screen.queryByText("SECRET-TITLE")).toBeNull();
  expect(screen.queryByText("SECRET-WHEN-TO-USE")).toBeNull();
  expect(screen.queryByText("SECRET-SUBJECT")).toBeNull();
  expect(screen.queryByText("SECRET-FALLBACK-OUTCOME")).toBeNull();
  expect(screen.queryByText("SECRET-CONSOLIDATION-REGISTER")).toBeNull();
  expect(screen.queryByText("SECRET-STATE")).toBeNull();
  expect(screen.queryByText("SECRET-MANIFEST-ENTRY")).toBeNull();
}

function cachedVersionContent(): Record<string, unknown> {
  return {
    title: "CACHED-SECRET-TITLE",
    when_to_use: "CACHED-SECRET-WHEN-TO-USE",
    subject: "billing-dispute",
    fallback: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "CaseVersionEditorScreen — a version refused for validation states explicitly that it does " +
    "not read back as a case, distinct from a read that did not complete, and states none of " +
    "this once the version reads back cleanly (criterion 1, criterion 2; " +
    "rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case)",
  () => {
    it("renders the explicit statement and no attribute of the version or its manifest when validation refuses the read, renders neither that statement nor any load-error text once the same version reads back as a validated case", async () => {
      const refusedFetch = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: () => notValidResponseCarrying(SECRET_VERSION_CONTENT),
        }),
      );
      await mountCaseVersionEditor(refusedFetch);

      expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();
      expectNoneOfSecretVersionContent();

      cleanup();
      vi.unstubAllGlobals();

      const validFetch = createFetchStub(baseHandlers());
      await mountCaseVersionEditor(validFetch);

      await screen.findByDisplayValue(LOADED_RECORD.title);
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
    });
  },
);

describe(
  "CaseVersionEditorScreen — no attribute of the version recovered from an earlier successful " +
    "read still cached reaches the not-valid statement (UNDERDETERMINED entry 1, cached-payload " +
    "variant; rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case)",
  () => {
    it("renders only the not-read-back-as-a-case statement, never an attribute of the version left over in the query cache from an earlier successful read, once a later reading of the same version is refused for validation", async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(["case-version", SLUG, 3], cachedVersionContent());
      const fetchMock = createFetchStub(
        baseHandlers({ [`GET ${VERSION_PATH}`]: notValidResponse }),
      );

      await mountCaseVersionEditor(fetchMock, undefined, queryClient);

      expect(await screen.findByText(NOT_VALID_TEXT)).toBeTruthy();
      expect(screen.queryByText("CACHED-SECRET-TITLE")).toBeNull();
      expect(screen.queryByText("CACHED-SECRET-WHEN-TO-USE")).toBeNull();
    });
  },
);

describe(
  "CaseVersionEditorScreen — the route to this version's own manifest on the reading refused " +
    "for validation (criterion 3)",
  () => {
    it("renders a Manifest link targeting this same version's own manifest route on the same reading that refused the version for validation, with no successful read of the version having occurred first", async () => {
      const fetchMock = createFetchStub(
        baseHandlers({ [`GET ${VERSION_PATH}`]: notValidResponse }),
      );
      await mountCaseVersionEditor(fetchMock);

      const link = await screen.findByRole("link", { name: "Manifest" });
      expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/3/manifest`);
    });
  },
);

describe(
  "CaseVersionEditorScreen — the route to this version's own manifest is offered on every " +
    "reading, not only the one refused for validation " +
    "(rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading; " +
    "UNDERDETERMINED entry 3)",
  () => {
    it("renders a Manifest link targeting this same version while the read is still pending, once it has failed to complete, once it has answered a validated case, and once it has been refused for validation alike", async () => {
      const pendingFetch = createFetchStub(
        baseHandlers({ [`GET ${VERSION_PATH}`]: () => new Promise<Response>(() => {}) }),
      );
      await mountCaseVersionEditor(pendingFetch);
      screen.getByRole("link", { name: "Manifest" });

      cleanup();
      vi.unstubAllGlobals();

      const failedFetch = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: () =>
            jsonResponse({ error: { code: "SomeUnrecognizedError", message: "boom" } }, 500),
        }),
      );
      await mountCaseVersionEditor(failedFetch);
      await screen.findByText(LOAD_ERROR_TEXT);
      screen.getByRole("link", { name: "Manifest" });

      cleanup();
      vi.unstubAllGlobals();

      const readyFetch = createFetchStub(baseHandlers());
      await mountCaseVersionEditor(readyFetch);
      await screen.findByDisplayValue(LOADED_RECORD.title);
      screen.getByRole("link", { name: "Manifest" });

      cleanup();
      vi.unstubAllGlobals();

      const refusedFetch = createFetchStub(
        baseHandlers({ [`GET ${VERSION_PATH}`]: notValidResponse }),
      );
      await mountCaseVersionEditor(refusedFetch);
      expect(
        await screen.findByRole("link", { name: "Manifest" }),
        "expected the manifest route on the reading refused for validation",
      ).toBeTruthy();
    });
  },
);

describe(
  "CaseVersionEditorScreen — a refusal carrying an error code the screen holds no presentation " +
    "of its own for states only the read-did-not-complete statement, disclosing nothing further " +
    "(criterion 4; rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete)",
  () => {
    it("renders only the fixed read-did-not-complete statement, never the not-valid statement, the refusal's own error code, its own message, or any attribute the refusal carries, when the version's own read fails with a code the screen holds no presentation of its own for", async () => {
      const fetchMock = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: () => unrecognizedResponseCarrying(SECRET_VERSION_CONTENT),
        }),
      );
      await mountCaseVersionEditor(fetchMock);

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
      expect(screen.queryByText("SomeUnrecognizedError")).toBeNull();
      expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();
      expectNoneOfSecretVersionContent();
    });
  },
);

describe(
  "CaseVersionEditorScreen — no attribute of the version recovered from an earlier successful " +
    "read still cached reaches the read-did-not-complete statement (UNDERDETERMINED entry 4; " +
    "rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete)",
  () => {
    it("renders only the read-did-not-complete statement, never an attribute of the version left over in the query cache from an earlier successful read, once a later reading of the same version fails with a code the screen holds no presentation of its own for", async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(["case-version", SLUG, 3], cachedVersionContent());
      const fetchMock = createFetchStub(
        baseHandlers({
          [`GET ${VERSION_PATH}`]: () =>
            jsonResponse({ error: { code: "SomeUnrecognizedError", message: "boom" } }, 500),
        }),
      );

      await mountCaseVersionEditor(fetchMock, undefined, queryClient);

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryByText(NOT_VALID_TEXT)).toBeNull();
      expect(screen.queryByText("CACHED-SECRET-TITLE")).toBeNull();
      expect(screen.queryByText("CACHED-SECRET-WHEN-TO-USE")).toBeNull();
    });
  },
);

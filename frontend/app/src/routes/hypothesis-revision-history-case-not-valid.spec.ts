import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  manifestPath,
  mountHypothesisRevisionHistory,
  revisionsPath,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const HYPOTHESIS_NAME = "H1";
const TARGET_VERSION = 9;

const REVISIONS = {
  data: [
    {
      revision: 1,
      criterion: "Earliest criterion",
      collects: ["ConceptA"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
    {
      revision: 3,
      criterion: "Middle criterion",
      collects: ["ConceptB"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
    {
      revision: 7,
      criterion: "Latest criterion",
      collects: ["ConceptC"],
      resolution: { outcome: "pending", referral: { action: "notify", recipient: "customer" } },
    },
  ],
  total: 3,
};

const LOAD_ERROR_TEXT = "Unable to load this hypothesis's revision history.";

function notValidResponse(): Response {
  return jsonResponse(
    { error: { code: "CaseVersionNotValidError", message: "validation failed" } },
    409,
  );
}

function unrecognizedResponseCarrying(details: Record<string, unknown>): Response {
  return jsonResponse(
    { error: { code: "SomeUnrecognizedError", message: "SECRET-REFUSAL-MESSAGE", details } },
    500,
  );
}

async function mountWithManifest(
  manifestHandler: () => Response | Promise<Response>,
): Promise<void> {
  const fetchMock = createFetchStub({
    [revisionsPath(HYPOTHESIS_NAME)]: () => jsonResponse(REVISIONS),
    [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: TARGET_VERSION, state: "draft" }] }),
    [manifestPath(TARGET_VERSION)]: manifestHandler,
  });
  await mountHypothesisRevisionHistory(fetchMock, {
    slug: SLUG,
    hypothesisName: HYPOTHESIS_NAME,
    onBack: vi.fn(),
  });
}

describe(
  "HypothesisRevisionHistory -- the hypothesis's own revisions are presented, stating no fact " +
    "derived from the manifest, when the case's current version fails validation (criterion 1, " +
    "criterion 2; " +
    "rules/knowledge/a-hypothesis-revision-history-stands-on-a-reading-whose-cases-current-version-does-not-read-back-as-a-case)",
  () => {
    it("renders every one of the hypothesis's own successfully-read revisions, and neither a current/frozen status, a Revise action, the 'uses no revision' statement, nor the read-did-not-complete text, when the highest-numbered version's manifest read is refused for failing validation", async () => {
      await mountWithManifest(notValidResponse);

      expect(await screen.findByText("Earliest criterion")).toBeTruthy();
      expect(screen.getByText("Middle criterion")).toBeTruthy();
      expect(screen.getByText("Latest criterion")).toBeTruthy();

      expect(screen.queryAllByText("current")).toHaveLength(0);
      expect(screen.queryAllByText("frozen")).toHaveLength(0);
      expect(screen.queryByRole("link", { name: "Revise →" })).toBeNull();
      expect(screen.queryByText(/uses no revision/i)).toBeNull();
      expect(screen.queryByText(LOAD_ERROR_TEXT)).toBeNull();
    });
  },
);

describe(
  "HypothesisRevisionHistory -- a refusal of the current-version read carrying an error code the " +
    "screen holds no presentation of its own for is presented exactly as a read that did not " +
    "complete " +
    "(rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete)",
  () => {
    it("renders only the fixed read-did-not-complete statement, never the revision history rows nor the refusal's own error code, message, or any value it carries, when the highest-numbered version's manifest read fails with a code the screen holds no presentation of its own for", async () => {
      await mountWithManifest(() => unrecognizedResponseCarrying({ subject: "SECRET-DETAIL" }));

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.queryAllByRole("row")).toHaveLength(0);
      expect(screen.queryByText("SomeUnrecognizedError")).toBeNull();
      expect(screen.queryByText("SECRET-REFUSAL-MESSAGE")).toBeNull();
      expect(screen.queryByText("SECRET-DETAIL")).toBeNull();
    });
  },
);

describe(
  "HypothesisRevisionHistory -- a genuine failure reading the hypothesis's own revisions still " +
    "presents the read-did-not-complete statement even when the case's current version read is " +
    "separately refused for failing validation (criterion 3)",
  () => {
    it("renders the read-did-not-complete statement, not the revision history, when the hypothesis's own revisions read fails while the highest-numbered version's manifest read is refused for failing validation", async () => {
      const fetchMock = createFetchStub({
        [revisionsPath(HYPOTHESIS_NAME)]: () => {
          throw new Error("network down");
        },
        [VERSIONS_PATH]: () =>
          jsonResponse({ data: [{ version: TARGET_VERSION, state: "draft" }] }),
        [manifestPath(TARGET_VERSION)]: notValidResponse,
      });
      await mountHypothesisRevisionHistory(fetchMock, {
        slug: SLUG,
        hypothesisName: HYPOTHESIS_NAME,
        onBack: vi.fn(),
      });

      expect(await screen.findByText(LOAD_ERROR_TEXT)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
      expect(screen.queryAllByRole("row")).toHaveLength(0);
    });
  },
);

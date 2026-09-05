import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  HYPOTHESES_PATH,
  jsonResponse,
  mountCaseDetailScreen,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's tab strip after the Attributes tab's removal", () => {
  it("renders exactly the Versions and Hypotheses tab triggers, with no third trigger", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByText("This case currently holds no version.");

    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "Versions" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Hypotheses" })).toBeTruthy();
  });

  it("renders no content associated with the case's declared attributes while switching between Versions and Hypotheses", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByText("This case currently holds no version.");
    expect(screen.queryByText("Consolidation register")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Hypotheses" }));
    await screen.findByText("This case has originated no hypotheses yet.");
    expect(screen.queryByText("Consolidation register")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Versions" }));
    await screen.findByText("This case currently holds no version.");
    expect(screen.queryByText("Consolidation register")).toBeNull();
  });
});

const caseDetailScreenSource = readFileSync(
  resolve(process.cwd(), "src/routes/case-detail-screen.tsx"),
  "utf-8",
);

describe("case-detail-screen.tsx's own imports after the Attributes tab's removal", () => {
  it("imports nothing from routes/case-attributes-tab", () => {
    const importSpecifiers = [...caseDetailScreenSource.matchAll(/from\s+["']([^"']+)["']/g)].map(
      (match) => match[1],
    );

    expect(importSpecifiers.some((specifier) => specifier.includes("case-attributes-tab"))).toBe(
      false,
    );
  });
});

const SRC_ROOT = resolve(process.cwd(), "src");
const THIS_FILE = fileURLToPath(import.meta.url);

function specFilesUnder(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      return specFilesUnder(entryPath);
    }
    if (entry.name.endsWith(".spec.ts") || entry.name.endsWith(".spec.tsx")) {
      return [entryPath];
    }
    return [];
  });
}

const ATTRIBUTES_TAB_ASSERTION =
  /(get|find|query)(All)?ByRole\(\s*["']tab["']\s*,\s*\{\s*name:\s*["']Attributes["']|TabsTrigger\s+value=["']attributes["']/;

describe("no spec file in the tree asserts that Case Detail presents an Attributes tab", () => {
  it("no longer contains the spec file that proved the Attributes tab's presence", () => {
    expect(
      existsSync(resolve(SRC_ROOT, "routes/case-detail-screen-attributes-tab.spec.ts")),
    ).toBe(false);
  });

  it("contains no other spec asserting a tab trigger named or valued Attributes", () => {
    const offending = specFilesUnder(SRC_ROOT)
      .filter((path) => path !== THIS_FILE)
      .filter((file) => ATTRIBUTES_TAB_ASSERTION.test(readFileSync(file, "utf-8")));

    expect(offending).toEqual([]);
  });
});

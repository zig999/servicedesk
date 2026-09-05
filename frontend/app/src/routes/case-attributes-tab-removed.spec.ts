import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROUTES_ROOT = resolve(process.cwd(), "src/routes");
const SRC_ROOT = resolve(process.cwd(), "src");
const THIS_FILE = fileURLToPath(import.meta.url);

describe("the Attributes tab component and its own test files after their removal", () => {
  it("no longer holds the tab component's own file", () => {
    expect(existsSync(join(ROUTES_ROOT, "case-attributes-tab.tsx"))).toBe(false);
  });

  it("no longer holds the tab's own test-support helper", () => {
    expect(existsSync(join(ROUTES_ROOT, "case-attributes-tab.test-support.ts"))).toBe(false);
  });

  it("no longer holds the tab's own content-level spec", () => {
    expect(existsSync(join(ROUTES_ROOT, "case-attributes-tab.spec.ts"))).toBe(false);
  });
});

function filesUnder(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      return filesUnder(entryPath);
    }
    return [entryPath];
  });
}

describe("no file under src still names the tab component's own identifier", () => {
  it("contains no reference to the literal identifier CaseAttributesTab anywhere in the tree", () => {
    const offending = filesUnder(SRC_ROOT)
      .filter((path) => path !== THIS_FILE)
      .filter((file) => readFileSync(file, "utf-8").includes("CaseAttributesTab"));

    expect(offending).toEqual([]);
  });
});

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HOOKS_ROOT = resolve(process.cwd(), "src/hooks");
const SRC_ROOT = resolve(process.cwd(), "src");
const THIS_FILE = fileURLToPath(import.meta.url);

describe("the useCaseAttributesAtAGlance hook and its own spec after their removal", () => {
  it("no longer holds the hook's own implementation file", () => {
    expect(existsSync(join(HOOKS_ROOT, "use-case-attributes-at-a-glance.ts"))).toBe(false);
  });

  it("no longer holds the hook's own spec file", () => {
    expect(existsSync(join(HOOKS_ROOT, "use-case-attributes-at-a-glance.spec.ts"))).toBe(false);
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

describe("no file under src still names the hook's own identifier", () => {
  it("contains no reference to useCaseAttributesAtAGlance anywhere in the tree", () => {
    const offending = filesUnder(SRC_ROOT)
      .filter((path) => path !== THIS_FILE)
      .filter((file) => readFileSync(file, "utf-8").includes("useCaseAttributesAtAGlance"));

    expect(offending).toEqual([]);
  });
});

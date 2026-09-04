import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const tokensCssPath = resolve(process.cwd(), "src/design-system/tokens.css");
const tokensCssDir = dirname(tokensCssPath);
const tokensCss = readFileSync(tokensCssPath, "utf-8");

function declaredSourcePaths(css: string): string[] {
  return [...css.matchAll(/@source\s+"([^"]+)"/g)].map((match) => match[1]);
}

describe("tokens.css's own @source directive keeps TUI's submodule inside Tailwind's content scan", () => {
  it("declares at least one @source directive", () => {
    expect(declaredSourcePaths(tokensCss).length).toBeGreaterThan(0);
  });

  it("declares a path that resolves to TUI's own submodule source tree, which exists on disk", () => {
    const sourcePaths = declaredSourcePaths(tokensCss);
    const resolvedPaths = sourcePaths.map((path) => resolve(tokensCssDir, path));

    expect(resolvedPaths.some((path) => path.endsWith("tui/frontend/src") && existsSync(path))).toBe(true);
  });
});

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const appRoot = process.cwd();
const distDir = resolve(appRoot, "dist");
const distAssetsDir = join(distDir, "assets");

let cssFileNames: string[] = [];
let compiledCss = "";

function declaresUtilityRule(css: string, className: string): boolean {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\.${escaped}(?![\\w.-])`).test(css);
}

describe("frontend/app's own build, scanning TUI's submodule source for Tailwind classes", () => {
  beforeAll(() => {
    rmSync(distDir, { recursive: true, force: true });

    execFileSync("npm", ["run", "build"], { cwd: appRoot, stdio: "pipe" });

    if (!existsSync(distAssetsDir)) {
      throw new Error(`expected ${distAssetsDir} to exist after a successful build`);
    }

    cssFileNames = readdirSync(distAssetsDir).filter((name) => name.endsWith(".css"));
    compiledCss = cssFileNames
      .map((name) => readFileSync(join(distAssetsDir, name), "utf-8"))
      .join("\n");
  }, 180_000);

  afterAll(() => {
    rmSync(distDir, { recursive: true, force: true });
  });

  it("emits at least one compiled stylesheet under dist/assets", () => {
    expect(cssFileNames.length).toBeGreaterThan(0);
  });

  it("declares a `.sr-only` utility rule -- the class Checkbox's own hidden native <input> requires to render invisibly", () => {
    expect(declaresUtilityRule(compiledCss, "sr-only")).toBe(true);
  });

  it("declares an `.h-9` utility rule -- the class Select's own trigger requires for its declared height", () => {
    expect(declaresUtilityRule(compiledCss, "h-9")).toBe(true);
  });

  it("declares a `.max-h-60` utility rule -- a third class used only inside TUI's own component source", () => {
    expect(declaresUtilityRule(compiledCss, "max-h-60")).toBe(true);
  });

  it("still declares a `.min-h-screen` utility rule for a class frontend/app's own source already used directly", () => {
    expect(declaresUtilityRule(compiledCss, "min-h-screen")).toBe(true);
  });
});

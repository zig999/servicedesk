// Proves task/case-authoring-console/tailwind-scans-the-tui-submodule: that frontend/app's own
// compiled stylesheet (dist/assets/*.css) carries a CSS rule for a utility class TUI's component
// source uses internally, even where frontend/app's own source never repeats that class name --
// closed by tokens.css's added `@source "../../../tui/frontend/src";` line.
//
// Unlike src/vite-config.spec.ts (which reads its config file as text rather than executing it,
// because the fact under test there is a config *declaration* read by a two-process dev-server
// integration this suite does not stand up), the fact this task's own criteria state is about
// *compiled output*, not declared intent: "npm run build's own compiled stylesheet ... declares a
// `.sr-only` utility rule." Reading tokens.css's text would only prove the `@source` line exists,
// never that Tailwind's real compiler acted on it -- so this file spawns a real, unmodified
// `npm run build` (the exact script package.json declares) via child_process and reads what that
// build actually wrote under dist/, the one thing that can fail independently of what the source
// file says.
//
// This is a real production build and is legitimately slow (much slower than every other spec in
// this tree, which exercise component/route logic against jsdom and never touch a bundler). No
// existing convention in this project's vitest config (`test.include`, a single glob with no
// exclude list -- see package.json's "test" script and the absence of any vitest.config.*
// elsewhere in this repo) separates a fast loop from a slower one, so this file is not filtered
// out of `npm test` by anything this project already has; it runs, once, inside the same
// `vitest run` invocation as every other spec. It is named and commented distinctly (the
// `.build.spec.ts` double extension, and this header) so a reader deciding whether to filter it
// out of a faster inner loop -- via an ad hoc `vitest run --exclude` on the invocation, since nothing
// here changes vitest.config -- can find it and know why it is slow before running it.
//
// dist/ is gitignored and is never read as a pre-existing artifact: this file removes it before
// building (so a stale dist/ from an earlier, unrelated build can never be what these assertions
// actually observe) and removes it again after (so nothing here leaves a build artifact behind for
// another run, or another tool, to depend on unknowingly).
//
// A known, harmless side effect of broadening content-detection to TUI's whole source tree: this
// build now also emits one warning ("Unexpected token Delim('*')") while Tailwind's own
// text-based class scanner reads a *code comment* inside
// frontend/tui/frontend/src/shared/components/ui/date-picker/date-picker.tsx documenting a
// removed class (`rounded-[var(--radius-*)]`) -- the string is never a real className anywhere,
// only mentioned in prose. The build still succeeds (this file's own beforeAll would throw and
// fail every test below if it did not). No test here asserts on that warning's text: Tailwind's
// scanner cannot distinguish a comment from real usage, which is a real limitation of the tool
// this task's fix relies on, not a behavior this task's criteria describe -- and a test pinned to
// that comment's exact wording would fail the day someone edits that comment's prose for reasons
// having nothing to do with this task.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// process.cwd() is the target source root (frontend/app) for every invocation of this suite,
// captured or local -- the same assumption src/vite-config.spec.ts already documents and relies
// on for `npm test` to find vite.config.ts.
const appRoot = process.cwd();
const distDir = resolve(appRoot, "dist");
const distAssetsDir = join(distDir, "assets");

let cssFileNames: string[] = [];
let compiledCss = "";

// Matches a real CSS rule selector for `className` -- e.g. finds `.sr-only` in `.sr-only{...}` or
// in a comma-joined selector list `.peer:checked~.sr-only,...` -- while refusing to match it as a
// mere substring of a longer, different class (`.sr-only-foo`, `.h-90`, `.max-h-600`): the
// character right after the name must not continue a class name (word character, `.` or `-`).
function declaresUtilityRule(css: string, className: string): boolean {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\.${escaped}(?![\\w.-])`).test(css);
}

describe("frontend/app's own build, scanning TUI's submodule source for Tailwind classes", () => {
  beforeAll(() => {
    rmSync(distDir, { recursive: true, force: true });

    // The exact script package.json declares as "build" -- `vite build` -- run for real, from
    // this app's own root, exactly as a person or CI running `npm run build` would. A build that
    // fails throws here and fails every test below with that failure, rather than each test
    // separately reporting a missing class it can never explain.
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

  // Edge case this behavior raises: the glob dist/assets/*.css the task's own criteria name could
  // come back empty (a build that emits no stylesheet at all is a different failure than a
  // stylesheet that emits without one particular class), and every assertion below reads
  // `compiledCss` as a plain string that is "" in that case -- which would otherwise make every
  // `toBe(true)` below fail for the same, wrong reason. This is that one reason, named on its own.
  it("emits at least one compiled stylesheet under dist/assets", () => {
    expect(cssFileNames.length).toBeGreaterThan(0);
  });

  it("declares a `.sr-only` utility rule -- the class Checkbox's own hidden native <input> requires to render invisibly", () => {
    expect(declaresUtilityRule(compiledCss, "sr-only")).toBe(true);
  });

  it("declares an `.h-9` utility rule -- the class Select's own trigger requires for its declared height", () => {
    expect(declaresUtilityRule(compiledCss, "h-9")).toBe(true);
  });

  // `max-h-60` is a third class satisfying the task's own criterion 3: it is used only inside
  // TUI's own component source (select.tsx's and multi-combobox.tsx's own listbox panel), is not
  // named by this task's other two criteria, and is never repeated anywhere in frontend/app's own
  // source (confirmed by inspecting frontend/app/src directly) -- so its presence here can only
  // be explained by the @source directive reaching TUI's whole tree, not by any class name
  // frontend/app's own files happen to already use.
  it("declares a `.max-h-60` utility rule -- a third class used only inside TUI's own component source", () => {
    expect(declaresUtilityRule(compiledCss, "max-h-60")).toBe(true);
  });

  // Criterion 4's own claim ("changes ... no existing utility class's own definition") for the one
  // part of it this task's own change could plausibly disturb: whether frontend/app's own
  // automatic content-detection (of frontend/app/src itself, unrelated to the added @source path)
  // still produces a rule for a class frontend/app's own markup already uses directly --
  // `min-h-screen`, from src/shared/components/app-shell.tsx's own root layout. A `@source`
  // directive that somehow replaced rather than added to Tailwind's own automatic detection of
  // this app's own source would leave this rule missing even though nothing about this class or
  // this file changed.
  it("still declares a `.min-h-screen` utility rule for a class frontend/app's own source already used directly", () => {
    expect(declaresUtilityRule(compiledCss, "min-h-screen")).toBe(true);
  });
});

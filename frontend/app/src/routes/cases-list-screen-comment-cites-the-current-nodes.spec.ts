import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "src/routes/cases-list-screen.tsx"), "utf-8");

const typeIndex = source.indexOf("type CaseSummary = ");
const commentStart = source.slice(0, typeIndex).lastIndexOf("/**");
const rawComment = source.slice(commentStart, typeIndex);

function proseOf(block: string): string {
  return block
    .split("\n")
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*)\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const comment = proseOf(rawComment);

describe("CaseSummary's own JSDoc comment", () => {
  it("no longer states or implies that the zero-version case is an edge no governing node addresses", () => {
    expect(comment).not.toMatch(/edge (that )?no governing node addresses/i);

    expect(comment).toContain(
      "currentState and lastUpdated are undefined only where the case currently holds no version at all",
    );
  });

  it("no longer attributes the zero-version handling to this task's own inference", () => {
    expect(comment).not.toContain("this task's own inference");
    expect(comment).toContain("both decided, not this screen's own inference");
  });

  it("cites domain/knowledge/case-summary's own conditional-presence statement for current_state and last_updated", () => {
    expect(comment).toContain("domain/knowledge/case-summary");
    expect(comment).toContain(
      "current_state and last_updated are present only where the case currently holds at least one version; a case whose every version was ever discarded before release holds none to derive either from, and both are absent rather than invented",
    );
  });

  it("cites rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's own statement of the zero-version case", () => {
    expect(comment).toContain("rules/knowledge/a-case-summary-is-derived-from-its-existing-versions");
    expect(comment).toContain(
      "a case currently holding no version has version_count zero and neither current_state nor last_updated, there being no version to derive either from",
    );
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Proof for task/cases-list-screen-stale-comment/comment-cites-the-current-nodes: the JSDoc
// comment immediately above CaseSummary in cases-list-screen.tsx no longer calls the
// zero-version case "an edge no governing node addresses" or attributes its handling to "this
// task's own inference" -- it now quotes domain/knowledge/case-summary's own conditional-presence
// statement and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's own
// zero-version statement.
//
// Reads cases-list-screen.tsx as source text (mirroring vite-config.spec.ts's own
// readFileSync(resolve(process.cwd(), ...)) convention for a static, non-executed assertion over
// a file's own text) rather than importing the module -- this proof is about the comment's own
// prose, which importing the module would strip entirely.
//
// The extraction below isolates the JSDoc block immediately preceding "type CaseSummary = " --
// not the whole file -- because two other, unrelated comments elsewhere in this same file
// (above PaginatedResponse, and above fetchCaseSummary's call-pattern paragraph) still carry the
// literal phrase "this task's own inference" today; that phrase is this task's own criterion 2
// only for the CaseSummary comment, and asserting its absence over the whole file would fail for
// a reason this task's own record deliberately leaves alone (see its own `deferred` entry).
const source = readFileSync(resolve(process.cwd(), "src/routes/cases-list-screen.tsx"), "utf-8");

const typeIndex = source.indexOf("type CaseSummary = ");
const commentStart = source.slice(0, typeIndex).lastIndexOf("/**");
const rawComment = source.slice(commentStart, typeIndex);

// Strips each line's own leading comment marker (a block-comment opener or continuation star)
// and collapses what remains to one line of prose, so a comment wrapped across several source
// lines compares the same as its own single-line paraphrase -- mirrors
// status-map.spec.ts's own proseOf() in the backend proof for the same criterion shape.
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
    // Anchors the assertion against genuine, still-present comment content rather than an
    // extraction that silently produced an empty string.
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

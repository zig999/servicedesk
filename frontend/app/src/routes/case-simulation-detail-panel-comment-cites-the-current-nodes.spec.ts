import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { toDetailJudgmentCall } from "./case-simulation-cockpit-adapters";

// Proof for task/detail-panel-judgment-comment-fix/reword-criterion-6-comment: Criterion 6's own
// paragraph, in case-simulation-detail-panel.tsx's own header comment, no longer groups model,
// prompt version, token usage and elapsed time as one undifferentiated set belonging to "the
// judgment" -- it now separately attributes usage, elapsed_ms and prompt to
// domain/investigation/evaluation's own call-level record (present per hypothesis evaluation) and
// model and prompt_version to domain/investigation/investigation's own investigation-wide fact
// (one pinned pair per whole investigation, never a per-hypothesis one).
//
// Reads case-simulation-detail-panel.tsx as source text (mirroring vite-config.spec.ts's own
// readFileSync(resolve(process.cwd(), ...)) convention, and this exact convention as
// cases-list-screen-comment-cites-the-current-nodes.spec.ts already establishes it for a comment's
// own prose) rather than importing the module for this half of the proof -- the comment's wording
// is what this task changed, and importing the module strips every comment before a test ever
// sees it.
//
// The extraction below isolates the Criterion 6 paragraph specifically -- from the literal
// "Criterion 6" heading up to (not including) the following "Criterion 7" heading -- rather than
// the whole header comment, because Criterion 6 alone is this task's own criterion; the
// surrounding Criteria 1-5 and 7 paragraphs are untouched by this task and their own wording is
// irrelevant to it.
const source = readFileSync(
  resolve(process.cwd(), "src/routes/case-simulation-detail-panel.tsx"),
  "utf-8",
);

const criterion6Start = source.indexOf("Criterion 6");
const criterion7Start = source.indexOf("Criterion 7");
const rawParagraph = source.slice(criterion6Start, criterion7Start);

// Strips each line's own leading comment marker (a block-comment continuation star) and
// collapses what remains to one line of prose, so a comment wrapped across several source lines
// compares the same as its own single-line paraphrase -- mirrors
// cases-list-screen-comment-cites-the-current-nodes.spec.ts's own proseOf().
function proseOf(block: string): string {
  return block
    .split("\n")
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*)\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const paragraph = proseOf(rawParagraph);

describe("case-simulation-detail-panel.tsx's own Criterion 6 comment", () => {
  it('no longer groups model, prompt version, token usage and elapsed time as one undifferentiated set belonging to "the judgment"', () => {
    expect(paragraph).not.toContain("the judgment's model, prompt version, token usage and elapsed time");
    expect(paragraph).not.toMatch(/model,\s*prompt version,\s*(token )?usage and elapsed time/i);
    // Anchors the assertion against genuine, still-present comment content rather than an
    // extraction that silently produced an empty string.
    expect(paragraph).toContain("renders inside the Evidence tab");
  });

  it("states that usage, elapsed_ms and prompt are domain/investigation/evaluation's own call-level record, present per hypothesis evaluation", () => {
    expect(paragraph).toContain("domain/investigation/evaluation");
    expect(paragraph).toContain(
      "usage, elapsed_ms and prompt are domain/investigation/evaluation's own call-level record, present per hypothesis evaluation",
    );
  });

  it("states that model and prompt_version are domain/investigation/investigation's own investigation-wide facts, not a per-hypothesis one", () => {
    expect(paragraph).toContain("domain/investigation/investigation");
    expect(paragraph).toContain(
      "model and prompt_version are domain/investigation/investigation's own investigation-wide facts",
    );
    expect(paragraph).toContain("one pinned pair per whole investigation, never a per-hypothesis one");
  });
});

// Criterion 3's own text ties the comment's separation to "toDetailJudgmentCall's own
// already-disclosed inference in case-simulation-cockpit-adapters.ts that this screen's
// judgment-call data always answers `{ called: false }`" -- that inference is a fact of an
// unmodified sibling file, not of the comment under test above, so it is proven separately here
// by calling the actual function rather than by asserting more prose out of the panel's own
// comment.
describe("that separation stays consistent with toDetailJudgmentCall's own already-disclosed inference (case-simulation-cockpit-adapters.ts)", () => {
  it("still answers { called: false }, never fabricating a model or prompt_version value for either investigation-wide field", () => {
    expect(toDetailJudgmentCall()).toEqual({ called: false });
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { toDetailJudgmentCall } from "./case-simulation-cockpit-adapters";

const source = readFileSync(
  resolve(process.cwd(), "src/routes/case-simulation-detail-panel.tsx"),
  "utf-8",
);

const criterion6Start = source.indexOf("Criterion 6");
const criterion7Start = source.indexOf("Criterion 7");
const rawParagraph = source.slice(criterion6Start, criterion7Start);

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

describe("that separation stays consistent with toDetailJudgmentCall's own already-disclosed inference (case-simulation-cockpit-adapters.ts)", () => {
  it("still answers { called: false }, never fabricating a model or prompt_version value for either investigation-wide field", () => {
    expect(
      toDetailJudgmentCall({
        hypothesis: "hypothesis-a",
        verdict: "confirmed",
        citations: [],
        source: "case",
        raw: {},
      }),
    ).toEqual({ called: false });
  });
});

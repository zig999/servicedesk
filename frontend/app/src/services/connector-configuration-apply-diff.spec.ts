import { describe, expect, it } from "vitest";
import {
  computeApplyConfirmationDiff,
  NESTED_OBJECT_KEYS,
  type ApplyConfirmationDiff,
} from "./connector-configuration-apply-diff";

function itemisable(diff: ApplyConfirmationDiff) {
  if (diff.kind !== "itemisable") {
    throw new Error("connector-configuration-apply-diff proof: expected an itemisable diff");
  }
  return diff;
}

describe("computeApplyConfirmationDiff -- top-level keys the apply would add, remove or change are computed together (criteria 1, 2, 3)", () => {
  it("reports a key only the draft holds as added, a key only the field holds as removed, and a key both hold with different values as changed", () => {
    const diff = itemisable(computeApplyConfirmationDiff('{"a":1,"b":2}', '{"b":3,"c":4}'));

    expect(diff.topLevel).toEqual({ added: ["c"], removed: ["a"], changed: ["b"] });
  });
});

describe("computeApplyConfirmationDiff -- each of statusMap, responseMap, query and headers is itemised one level deeper when both sides hold it as an object (criterion 4)", () => {
  const NESTED_KEYS = NESTED_OBJECT_KEYS;

  it.each(NESTED_KEYS)("computes %s's own added, removed and changed keys", (key) => {
    const fieldText = JSON.stringify({ [key]: { kept: "same", dropped: "old" } });
    const draftText = JSON.stringify({ [key]: { kept: "same", added: "new" } });

    const diff = itemisable(computeApplyConfirmationDiff(fieldText, draftText));

    expect(diff.nested).toEqual([
      { key, diff: { added: ["added"], removed: ["dropped"], changed: [] } },
    ]);
  });
});

describe("computeApplyConfirmationDiff -- field text that is not well-formed JSON object text is never itemisable, whatever the draft holds (criterion 5)", () => {
  const NOT_WELL_FORMED_FIELD_TEXTS: ReadonlyArray<readonly [string, string]> = [
    ["empty string", ""],
    ["invalid JSON", "{not valid json"],
    ["a JSON array", "[1,2,3]"],
    ["a JSON string", '"just a string"'],
    ["a JSON number", "42"],
    ["a JSON boolean", "true"],
    ["a JSON null", "null"],
  ];

  it.each(NOT_WELL_FORMED_FIELD_TEXTS)("returns kind 'not-itemisable' for %s", (_label, fieldText) => {
    expect(computeApplyConfirmationDiff(fieldText, '{"a":1}').kind).toBe("not-itemisable");
  });
});

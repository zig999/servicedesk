import { describe, expect, it } from "vitest";
import { getJsonTextareaMinifiedValue } from "./json-text";

describe("getJsonTextareaMinifiedValue", () => {
  it("strips insignificant whitespace from indented, pretty-printed text", () => {
    const pretty = '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}';

    expect(getJsonTextareaMinifiedValue(pretty)).toBe('{"a":1,"b":[1,2]}');
  });

  it("returns the same minified string for the same data whether the text is currently shown compact or pretty-printed", () => {
    const compact = '{"a":1,"b":[1,2]}';
    const pretty = '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}';

    expect(getJsonTextareaMinifiedValue(compact)).toBe('{"a":1,"b":[1,2]}');
    expect(getJsonTextareaMinifiedValue(pretty)).toBe('{"a":1,"b":[1,2]}');
  });

  it("returns null for text that is not syntactically valid JSON", () => {
    expect(getJsonTextareaMinifiedValue("{not valid")).toBeNull();
  });

  it("returns null for an empty string, rather than treating absent text as valid JSON", () => {
    expect(getJsonTextareaMinifiedValue("")).toBeNull();
  });
});

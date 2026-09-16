import { describe, expect, it } from "vitest";
import { configurationTextParsesToNonObject } from "./connector-configuration-well-formedness";

describe("configurationTextParsesToNonObject -- names text that parses to something other than a JSON object", () => {
  it("returns false for text that fails to parse as JSON at all", () => {
    expect(configurationTextParsesToNonObject("{not json")).toBe(false);
  });

  it("returns false for text that parses to a plain object", () => {
    expect(configurationTextParsesToNonObject('{"method":"GET"}')).toBe(false);
  });

  it("returns true for text that parses to an array", () => {
    expect(configurationTextParsesToNonObject("[1,2,3]")).toBe(true);
  });

  it("returns true for text that parses to a bare string", () => {
    expect(configurationTextParsesToNonObject('"just a string"')).toBe(true);
  });

  it("returns true for text that parses to a number", () => {
    expect(configurationTextParsesToNonObject("42")).toBe(true);
  });

  it("returns true for text that parses to null", () => {
    expect(configurationTextParsesToNonObject("null")).toBe(true);
  });
});

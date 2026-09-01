import { describe, expect, it } from "vitest";
import {
  PLACEHOLDER_PATTERN,
  isSubjectPlaceholderToken,
  splitPlaceholderToken,
} from "./connector-placeholder-token";

describe("PLACEHOLDER_PATTERN -- matching every '${...}' token anywhere inside a string", () => {
  it("finds every placeholder occurring anywhere inside one string value, in the order they occur", () => {
    const text = "https://api/${subject:account-id}?auth=${requester}";

    const tokens = [...text.matchAll(PLACEHOLDER_PATTERN)].map((match) => match[1]);

    expect(tokens).toEqual(["subject:account-id", "requester"]);
  });

  it("finds no match inside a string that carries no '${...}' token at all", () => {
    const text = "https://api/static-path";

    const tokens = [...text.matchAll(PLACEHOLDER_PATTERN)];

    expect(tokens).toEqual([]);
  });
});

describe("splitPlaceholderToken -- the kind/argument split at the first ':'", () => {
  it("splits an ordinary '${subject:attribute-name}' token into its kind and its argument", () => {
    expect(splitPlaceholderToken("subject:account-id")).toEqual(["subject", "account-id"]);
  });

  it("splits a bare token with no argument, such as '${subject}' with no ':' at all, to that whole token as its kind and no argument", () => {
    expect(splitPlaceholderToken("subject")).toEqual(["subject", undefined]);
  });

  it("splits a token whose argument is empty, such as '${subject:}', to an empty-string argument rather than undefined", () => {
    expect(splitPlaceholderToken("subject:")).toEqual(["subject", ""]);
  });

  it("splits a token carrying more than one ':' at the first one only, keeping every later ':' as part of the argument", () => {
    expect(splitPlaceholderToken("subject:a:b")).toEqual(["subject", "a:b"]);
  });
});

describe("isSubjectPlaceholderToken -- the filter keeping only kind === \"subject\" with a non-empty argument", () => {
  it("accepts a split token naming the subject kind with a non-empty argument", () => {
    expect(isSubjectPlaceholderToken(["subject", "account-id"])).toBe(true);
  });

  it("rejects a bare '${subject}' token that names no argument at all", () => {
    expect(isSubjectPlaceholderToken(["subject", undefined])).toBe(false);
  });

  it("rejects a '${subject:}' token whose argument is present but empty", () => {
    expect(isSubjectPlaceholderToken(["subject", ""])).toBe(false);
  });

  it("rejects a non-subject kind such as a bare '${requester}' token", () => {
    expect(isSubjectPlaceholderToken(["requester", undefined])).toBe(false);
  });

  it("rejects a non-subject kind that does carry an argument, such as '${credential:x}'", () => {
    expect(isSubjectPlaceholderToken(["credential", "x"])).toBe(false);
  });
});

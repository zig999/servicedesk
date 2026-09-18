import { describe, expect, it } from "vitest";
import type { Capability } from "./use-capabilities";

const baseCapability = {
  name: "geo-lookup",
  version: "1.0.0",
  nature: "read-only" as const,
  input_schema: "{}",
  output_schema: "{}",
  timeout: 5000,
  connector: "http-generic",
  concept: "address",
};

describe("Capability -- payload_notes as a read type attribute a read answer may carry or leave out", () => {
  it("typechecks and preserves a payload_notes string carried on a read answer", () => {
    const answer: Capability = {
      ...baseCapability,
      payload_notes: "Returns null rather than a value when the address cannot be geocoded.",
    };

    expect(answer.payload_notes).toBe(
      "Returns null rather than a value when the address cannot be geocoded.",
    );
  });

  it("typechecks a read answer that carries no payload_notes", () => {
    const answer: Capability = { ...baseCapability };

    expect(answer.payload_notes).toBeUndefined();
  });
});

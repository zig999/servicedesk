import { describe, expect, it } from "vitest";
import { capabilityFormSchema } from "./capability-form-schema";

const validFormValueWithout = (overrides: Record<string, unknown> = {}) => ({
  name: "geo-lookup",
  version: "1.0.0",
  nature: "read-only",
  connector: "http-generic",
  concept: "address",
  ...overrides,
});

describe("capabilityFormSchema -- payload_notes as an optional free-text attribute", () => {
  it("yields the supplied payload_notes string unchanged on the parsed result", () => {
    const result = capabilityFormSchema.safeParse(
      validFormValueWithout({
        payload_notes: "Returns null rather than a value when the address cannot be geocoded.",
      }),
    );

    expect(result.success).toBe(true);
    expect(result.success && result.data.payload_notes).toBe(
      "Returns null rather than a value when the address cannot be geocoded.",
    );
  });

  it("reports no validation issue when payload_notes is left out of the form value", () => {
    const result = capabilityFormSchema.safeParse(validFormValueWithout());

    expect(result.success).toBe(true);
    expect(result.success && result.data.payload_notes).toBeUndefined();
  });

  it("reports no validation issue for a payload_notes value that is an empty string", () => {
    const result = capabilityFormSchema.safeParse(validFormValueWithout({ payload_notes: "" }));

    expect(result.success).toBe(true);
    expect(result.success && result.data.payload_notes).toBe("");
  });
});

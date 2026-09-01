import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { useCapabilityForm } from "./use-capability-form";

const hookSource = readFileSync(resolve(process.cwd(), "src/hooks/use-capability-form.ts"), "utf-8");

describe("use-capability-form.ts's own exports (criteria 4 and 5)", () => {
  it("no longer declares the nullable-identity CapabilityFormTarget type", () => {
    expect(hookSource).not.toMatch(/\bCapabilityFormTarget\b/);
  });

  it("still exports useCapabilityForm as a callable function", () => {
    expect(typeof useCapabilityForm).toBe("function");
  });
});

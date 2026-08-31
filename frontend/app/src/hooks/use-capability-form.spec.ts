import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { useCapabilityForm } from "./use-capability-form";

// Proof for task/capability-create-route/retire-capability-form-dialog's own criteria 4 and 5.
// This is this hook's first dedicated spec file (TST-04: named for its own unit plus .spec),
// so it holds only what this task's own criteria state about it -- not a full behavioral suite
// for useCapabilityForm, which capability-create-screen.spec.ts/-save.spec.ts and
// capability-detail-screen.spec.ts/-save.spec.ts already exercise end to end through the two
// routed screens that compose it, untouched by this task.
//
// Criterion 4 ("The nullable-identity capability form-target type is no longer declared") is
// read off this file's own source text rather than checked at the type level, mirroring
// cases-list-screen-comment-cites-the-current-nodes.spec.ts's own
// readFileSync(resolve(process.cwd(), ...)) convention: CapabilityFormTarget is a type, erased
// at compile time, so importing this module at runtime could never observe whether a type
// nothing here references is still declared -- only npm run typecheck (part of this task's own
// captured suite run) fails on a *use* of a removed type, and this criterion is about the
// *declaration* itself, used or not.
//
// Criterion 5 ("The capability create/edit form hook the routed create screen consumes is not
// deleted") only needs useCapabilityForm to still exist and still be callable -- this task's own
// delivery changed nothing about its exported behavior, only removed a type export the hook's
// own body never consumed, so no new behavioral test is written here for it; the pre-existing
// specs named above already cover that behavior and would already fail were it broken.
const hookSource = readFileSync(resolve(process.cwd(), "src/hooks/use-capability-form.ts"), "utf-8");

describe("use-capability-form.ts's own exports (criteria 4 and 5)", () => {
  it("no longer declares the nullable-identity CapabilityFormTarget type", () => {
    expect(hookSource).not.toMatch(/\bCapabilityFormTarget\b/);
  });

  it("still exports useCapabilityForm as a callable function", () => {
    expect(typeof useCapabilityForm).toBe("function");
  });
});

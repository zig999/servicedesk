import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Proof for task/capability-create-route/retire-capability-form-dialog's own criterion 1: "The
// capability form dialog module no longer exists in the tree."
//
// Named for the retired unit itself plus .spec, the same convention every other spec in this
// tree follows (TST-04) -- even though that unit no longer has a live implementation file to
// sit beside in src/routes/, which is this file's whole point: it is the one spec whose subject
// is the module's own absence, not its behavior.
//
// process.cwd() is the target source root (frontend/app) for every invocation of this suite --
// the same assumption src/vite-config.spec.ts's own header comment documents and every file in
// this tree reading its own source through node:fs already relies on.
describe("the capability popup form dialog module", () => {
  it("no longer exists in the tree", () => {
    const dialogPath = resolve(process.cwd(), "src/routes/capability-form-dialog.tsx");

    expect(existsSync(dialogPath)).toBe(false);
  });
});

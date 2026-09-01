import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("the capability popup form dialog module", () => {
  it("no longer exists in the tree", () => {
    const dialogPath = resolve(process.cwd(), "src/routes/capability-form-dialog.tsx");

    expect(existsSync(dialogPath)).toBe(false);
  });
});

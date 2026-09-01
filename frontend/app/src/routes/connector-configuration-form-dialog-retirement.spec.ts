import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("the connector configuration form dialog module", () => {
  it("no longer exists in the tree", () => {
    expect(
      existsSync(resolve(process.cwd(), "src/routes/connector-configuration-form-dialog.tsx")),
    ).toBe(false);
  });
});

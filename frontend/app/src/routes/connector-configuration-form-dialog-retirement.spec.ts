// Proof for task/connector-configuration-create-route/retire-connector-configuration-form-dialog's
// own criterion 1: "The connector configuration form dialog module no longer exists in the tree."
//
// This is the one criterion of that task genuinely expressible as a filesystem fact a running
// test can ask about directly, rather than one TypeScript itself already refuses to let compile.
// A static `import` of src/routes/connector-configuration-form-dialog.tsx is a compile error the
// moment the path does not resolve -- so nothing importing it could ever reach this suite in the
// first place, and asserting its absence through an import would only prove the compiler ran, not
// that the module is gone. Reading the filesystem directly (mirroring
// src/design-system/tailwind-tui-source-scan.build.spec.ts's own existsSync convention) is the
// only way to state the fact itself rather than benefit from it silently.
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

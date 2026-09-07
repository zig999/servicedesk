import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROUTES_ROOT = resolve(process.cwd(), "src/routes");
const SRC_ROOT = resolve(process.cwd(), "src");
const THIS_FILE = fileURLToPath(import.meta.url);
const OUTCOME_PROOF_PATH = join(ROUTES_ROOT, "capability-detail-screen-outcome.spec.ts");

function capabilityNotReadOnlyStatuses(content: string): number[] {
  return [
    ...content.matchAll(/errorResponse\(\s*(['"])CapabilityNotReadOnlyError\1\s*,\s*(\d+)/g),
  ].map((match) => Number(match[2]));
}

function filesUnder(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      return filesUnder(entryPath);
    }
    return [entryPath];
  });
}

describe("the capability detail surface's outcome proof's own stand-in refusal for a nature that is not read-only", () => {
  it("responds with HTTP 422, the status the registry answers that refusal with", () => {
    const outcomeProofContent = readFileSync(OUTCOME_PROOF_PATH, "utf-8");

    expect(capabilityNotReadOnlyStatuses(outcomeProofContent)).toEqual([422]);
  });
});

describe("no stand-in in the frontend suite builds CapabilityNotReadOnlyError with a status other than 422", () => {
  it("finds every stand-in pairing CapabilityNotReadOnlyError with an HTTP status carrying 422", () => {
    const statuses = filesUnder(SRC_ROOT)
      .filter((file) => file !== THIS_FILE)
      .flatMap((file) => capabilityNotReadOnlyStatuses(readFileSync(file, "utf-8")));

    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every((status) => status === 422)).toBe(true);
  });
});

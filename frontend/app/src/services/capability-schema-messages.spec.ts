import { describe, expect, it } from "vitest";
import { capabilitySchemaDraftUnresolvedReasonMessage } from "./capability-schema-messages";

describe("capabilitySchemaDraftUnresolvedReasonMessage -- the enumeration's two closed values each get their own distinct, non-empty label, and a reason outside that vocabulary falls back to itself unchanged (domain/integration/capability-schema-draft-unresolved-reason)", () => {
  it("gives schema-not-reducible-to-a-type and name-claimed-by-another-parameter two distinct, non-empty labels, and returns a value outside the two-value vocabulary unchanged", () => {
    const notReducibleLabel = capabilitySchemaDraftUnresolvedReasonMessage("schema-not-reducible-to-a-type");
    const nameClaimedLabel = capabilitySchemaDraftUnresolvedReasonMessage("name-claimed-by-another-parameter");
    const outsideVocabulary = capabilitySchemaDraftUnresolvedReasonMessage("some-future-reason");

    expect(notReducibleLabel.length).toBeGreaterThan(0);
    expect(nameClaimedLabel.length).toBeGreaterThan(0);
    expect(notReducibleLabel).not.toBe(nameClaimedLabel);
    expect(outsideVocabulary).toBe("some-future-reason");
  });
});

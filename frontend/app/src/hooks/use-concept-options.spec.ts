import { describe, expect, it } from "vitest";
import type { ConceptOption } from "./use-concept-options";

describe("ConceptOption — continues to omit description (criterion 5)", () => {
  it("type-checks that ConceptOption can never carry a description field, unlike its sibling GlossaryConcept (checked by this project's own typecheck step)", () => {
    function assertConceptOptionCarriesNoDescription(option: ConceptOption): void {
      void option.name;
      void option.accepts;
      // @ts-expect-error -- ConceptOption deliberately does not narrow in description (criterion 5); if it ever grows one, this line stops erroring and the unused directive itself fails typecheck.
      void option.description;
    }

    const option: ConceptOption = { name: "billing-dispute", accepts: ["customer-account"] };
    assertConceptOptionCarriesNoDescription(option);

    expect(option.name).toBe("billing-dispute");
    expect(option.accepts).toEqual(["customer-account"]);
  });
});

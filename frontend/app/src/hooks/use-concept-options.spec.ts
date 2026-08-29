import { describe, expect, it } from "vitest";
import type { ConceptOption } from "./use-concept-options";

// task/glossary-concept-description/browser-description-and-legacy-marker's own criterion 5:
// use-concept-options.ts's own ConceptOption continues to omit description -- a deliberate
// departure from its sibling use-glossary-concepts.ts's own now-wider GlossaryConcept, disclosed
// in this hook's own header comment. No runtime read tells "the type omits a field" apart from
// "the field merely goes unread": TypeScript's own types are erased at compile time, and this
// hook does no destructuring that would strip an extra field from the actual response object
// either way, so a deep-equality assertion over a stubbed fetch response could never fail for
// the right reason here. This is proven instead the same way
// use-simulate-hypothesis-request.spec.ts's own TYP-04 test already established in this
// codebase: a line that must fail to compile if the type ever widens, checked by this project's
// own typecheck step rather than by this suite's own runtime pass.
//
// use-concept-options.ts itself carried no dedicated spec file before this task --
// use-glossary-concepts.spec.ts's own header comment states why: its one consumer,
// use-hypothesis-revision-form.ts, never needed a proof of the hook's own contract. This file
// exists because this task's own criterion 5 is the first to need one.

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

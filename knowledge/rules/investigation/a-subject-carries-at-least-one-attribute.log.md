---
entries:
- field: statement
  unstated: The material explicitly asks whether the new subject shape needs an invariant analogous to a-hypothesis-collects-at-least-one-concept, without deciding it.
  decided: A subject carries at least one attribute-value, as its own invariant.
  why: Mirrors a-hypothesis-collects-at-least-one-concept's own reasoning exactly — a subject with no attribute-value at all identifies nothing, and no capability's connector would have anything to derive its call from.
- field: statement
  unstated: The rule held the invariant that a subject carries at least one attribute-value, but no node stated what a caller is told when a call arrives with a subject carrying none — no error class and no HTTP status anywhere in the specification named this violation, so the only answer the specification held for it was the generic fallback of constraints/a-domain-error-unmapped-by-status-is-refused-generically. Surfaced during plan-work for subject-attribute-glossary-removal-backend by an execution-contract-binder over task/subject-attribute-check-removal/stop-checking-simulate-subject-attributes-against-the-glossary, whose criteria hold this refusal to a named error class.
  decided: A call whose subject carries no attribute-value is refused with an HTTP 422 response reporting a SubjectCarriesNoAttributeError.
  why: A request that is well-formed but whose content the domain refuses is HTTP 422 everywhere in this specification — a-hypothesis-collects-at-least-one-concept, a-capability-declares-its-contract and a-diagnosed-subject-covers-its-cases-required-attributes all answer an empty-or-missing required content that way, 400 being reserved by a-malformed-request-is-refused-with-a-validation-error for the route's declared shape — and the class name is this rule's own condition negated over the element it constrains, the same derivation HypothesisRevisionCollectsNoConceptError takes from its own rule.
---

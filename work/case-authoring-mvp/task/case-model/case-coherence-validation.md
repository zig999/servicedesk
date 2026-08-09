---
title: Case coherence validation
summary: The validator rules that read the current glossary and capability registry over a structurally valid case.
rationale: Cut from the structural rules because these rules change when the glossary or registry contracts change, and they demonstrate only once those upstreams exist; the scope stated one validator without stating this cut.
objective: A structurally valid case is refused, with every coherence violation named at once, when any term it names is absent from the glossary, any collected concept rejects its subject type, or any collected concept lacks a current read-only capability.
criteria:
  - A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term.
  - A case whose collected concept does not accept the declared subject type is refused, naming the concept and the subject type that disagree.
  - A case collecting a concept no read-only capability currently answers is refused, naming the concept.
  - The capability check reads the registration as it stands at the moment of validation, so the same case refused before a capability registers is not refused by that check after it registers.
  - A case violating several coherence rules is refused once, with every violation named.
  - A case violating no coherence rule is not refused by these rules.
  - The checks reach the glossary and the registry through ports over the published reads, importing no framework, driver or client into the domain modules.
depends_on:
  - task/case-model/case-document-model
  - task/published-language/glossary-query
  - task/capability-registry/capability-resolution
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - contracts/knowledge/vocabulary-terms
  - contracts/knowledge/capability-check
  - contracts/system/case-authoring
  - scenarios/knowledge/a-subject-mismatch-refuses-the-case
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---
## What it is
Where the knowledge context negotiates with the glossary and the integration context, at reading and never first at execution.

## Notes
UNDERDETERMINED, from the specification — rules/knowledge/every-collected-concept-has-a-read-only-capability demands a capability that declares an output schema and a timeout, and no criterion reaches that clause; whether a registration can exist without those fields is a fact of domain/integration/capability, outside the candidates, so nothing here excludes the weaker check. Passes as written: a capability check that accepts a case whose concept is answered by a read-only capability registered without an output schema or a timeout, which the rule's statement refuses.
Decision, beyond the covers — stand: domain/integration/capability is named only to locate where registration completeness is enforced; the capability-registration task of the capability-registry epic implements it, and nothing in this task reaches for it.
UNDERDETERMINED, from the specification — contracts/system/case-authoring promises every validator rule answers at reading with all refusals at once, but the objective and criterion 5 scope the at-once guarantee to coherence violations over a structurally valid case. Passes as written: an implementation that runs the coherence checks only after structural validation succeeds, refusing a doubly-violating case in two successive readings rather than once, which the capability's promise refuses.
REMAINDER, from the specification — six structural rules reach no criterion of this task and are exactly the structural validity its summary presupposes: the-slug-matches-the-file-name, a-case-has-at-least-one-hypothesis, a-hypothesis-name-is-unique-within-its-case, a-hypothesis-collects-at-least-one-concept, a-hypothesis-declares-a-criterion, every-position-declares-a-resolution. Belongs: the document-model task of this epic that implements structural validation.
REMAINDER, from the specification — rules/knowledge/hypotheses-are-ordered-by-precedence reaches no criterion here; what a validator can hold, order preservation in the model, is the case structure's concern, and the affirmation of the precedence itself is human curation per the rule's own description. Belongs: the document-model task for order preservation.
Advisory — scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome, scenarios/knowledge/no-confirmation-falls-back and constraints/a-case-is-stored-as-one-json-document neighbor rather than govern this task; no criterion touches resolution or persistence.
Advisory — criterion 7's ports are this task's to define over the two consumed contracts' operations; the upstream contracts those name, contracts/glossary/glossary-query and contracts/integration/capability-registry, sit outside the candidates, so the live adapters binding the ports to them are another epic's seam, and the domain-side checks stay demonstrable as pure unit tests against port fakes.
Decision, beyond the covers — stand: contracts/glossary/glossary-query and contracts/integration/capability-registry are named only as the upstreams the consumed contracts depend on; the published-language and capability-registry epics implement them, and this task binds its ports to fakes.

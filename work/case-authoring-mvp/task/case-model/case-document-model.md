---
title: Case document model
summary: The case aggregate as one JSON document — case, hypotheses, resolutions, referrals — with every structural rule refusing in one pass.
rationale: The scope stated the model and the validator without cutting the validator; the rules that hold against the document alone are cut from the rules that read the glossary and the registry, because they change for different reasons and demonstrate without any other context built.
objective: A case JSON document parses into the whole aggregate when every structural rule holds, and is refused with every structural violation named at once when any does not.
criteria:
  - A document holding slug, title, when_to_use, version, hash, subject, fallback and at least one hypothesis parses into one case aggregate.
  - The whole aggregate — hypotheses, resolutions, referrals — is read from the one document, and no part of a case is read from a second store.
  - A case whose slug differs from the name of the file that holds it is refused.
  - A case declaring no hypothesis is refused.
  - A case with two hypotheses sharing a name is refused.
  - A hypothesis collecting no concept is refused.
  - A hypothesis carrying an empty criterion is refused.
  - A hypothesis or the fallback missing its outcome or its referral is refused.
  - A document violating several structural rules is refused once, with every violation named.
  - The document model's modules import no framework, no driver and no provider client.
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - rules/knowledge/the-slug-matches-the-file-name
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/every-position-declares-a-resolution
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - constraints/a-case-is-stored-as-one-json-document
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---
## What it is
The aggregate boundary as the document boundary: one JSON document per case, parsed whole, held to every rule that needs nothing but the document itself.

## Notes
UNDERDETERMINED, from the specification — the criteria enumerate six structural refusals but the domain nodes require more: case marks title, when_to_use, version, hash, subject and fallback required, hypothesis marks name required, referral marks action and recipient required, and no criterion refuses a document missing any of these. Passes as written: a lenient parser that defaults or coerces a missing required field, accepts a case with no fallback, a nameless hypothesis or a referral missing its action or recipient, which the specification's required attributes refuse.
UNDERDETERMINED, from the specification — rules/knowledge/hypotheses-are-ordered-by-precedence makes the declared order the precedence and resolve-outcome consumes it, yet no criterion requires the aggregate to preserve the document's order. Passes as written: a document model holding hypotheses as an unordered set or a map keyed by name, losing the declared precedence before resolution can read it.
REMAINDER, from the specification — rules/knowledge/case-terms-exist-in-the-glossary demands a glossary read no criterion of this task performs and criterion 10 forbids these modules the client it would need. Belongs: the coherence-validation task of this epic that reads the glossary through contracts/knowledge/vocabulary-terms.
REMAINDER, from the specification — rules/knowledge/a-concept-accepts-the-declared-subject-type is a check against glossary concept definitions no criterion here performs. Belongs: the same coherence-validation task, with scenarios/knowledge/a-subject-mismatch-refuses-the-case landing there with it.
REMAINDER, from the specification — rules/knowledge/every-collected-concept-has-a-read-only-capability checks the integration context's registry, which no criterion of this task reaches. Belongs: the coherence-validation task that consumes contracts/knowledge/capability-check.
REMAINDER, from the specification — rules/knowledge/the-contract-check-reads-the-current-registration governs a registry read this task's model never performs. Belongs: the same coherence-validation task.
Advisory — criterion 9's shape of refusal, refused once with every violation named, is stated by no candidate and forbidden by none; aggregation into one pass is the plan's own engineering decision, demonstrable as written.
Advisory — domain/knowledge/case also declares collection-plan, requires-evaluation-of and resolve-outcome, exercised by two candidate scenarios; no criterion here demonstrates them, and the sibling resolution task names the node for its behavior.
Advisory — constraints/the-domain-depends-on-no-infrastructure spans four domain areas and criterion 10 demonstrates it over the document model's modules alone; the other areas are demonstrated by the tasks that build them.

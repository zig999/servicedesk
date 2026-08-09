---
title: Case resolution
summary: The case's own operations — collection plan, required evaluations, resolve-outcome — as pure domain behavior over the aggregate.
rationale: The scope named the case model, the model's declared responsibility owns the resolution logic, and the impact set's scenarios exercise it, so it is cut as pure domain behavior demonstrable without the investigation engine the successor initiative will build.
objective: The case aggregate answers its three declared operations — collection-plan, requires-evaluation-of and resolve-outcome — from its declared hypotheses alone.
criteria:
  - The collection plan is the deduplicated union of every hypothesis's collects.
  - requires-evaluation-of answers what totality demands as the case declares it, one entry per declared hypothesis name.
  - Given confirmed and refuted verdicts per hypothesis name, resolve-outcome answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role.
  - A hypothesis confirmed after the determining one keeps its confirmed verdict, unmarked.
  - When every hypothesis is refuted or inconclusive, resolve-outcome answers the fallback's outcome and referral.
  - When the fallback answers, no determining hypothesis is named.
  - The declared order of the case's hypotheses is the only precedence resolution consults.
  - The resolution modules import no framework, no driver and no provider client.
depends_on:
  - task/case-model/case-document-model
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  - scenarios/knowledge/no-confirmation-falls-back
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---
## What it is
The resolution logic the case owns, exercised by the two knowledge scenarios as pure unit-testable behavior over verdicts supplied as data.

## Notes
REMAINDER, from the specification — six structural invariants reach no criterion of this task, whose every criterion operates over an already-valid aggregate: the-slug-matches-the-file-name, a-case-has-at-least-one-hypothesis, a-hypothesis-name-is-unique-within-its-case, a-hypothesis-collects-at-least-one-concept, a-hypothesis-declares-a-criterion and every-position-declares-a-resolution. Belongs: the document-model task — the act that reads a case document and refuses a malformed one before any operation runs over it.
REMAINDER, from the specification — the glossary-coherence policies rules/knowledge/case-terms-exist-in-the-glossary and rules/knowledge/a-concept-accepts-the-declared-subject-type reach no criterion here, and scenarios/knowledge/a-subject-mismatch-refuses-the-case demonstrates the latter and sits with that act. Belongs: the coherence-validation task that consumes contracts/knowledge/vocabulary-terms.
REMAINDER, from the specification — the capability policies rules/knowledge/every-collected-concept-has-a-read-only-capability and rules/knowledge/the-contract-check-reads-the-current-registration are checks against the current registration, and criterion 8 forbids exactly the client such a check would need. Belongs: the coherence-validation task that consumes contracts/knowledge/capability-check.
Advisory — contracts/knowledge/vocabulary-terms and contracts/knowledge/capability-check are consumed APIs of the validation acts named above and none governs the three operations here.
Advisory — constraints/a-case-is-stored-as-one-json-document is a storage constraint whose fitness a persistence act demonstrates; resolution stays compatible by operating over the whole aggregate but does not implement it.
Advisory — the verdict side of criteria 2, 3 and 5 is a seam: domain/investigation/evaluation, domain/investigation/verdict, domain/investigation/assessment and rules/investigation/one-evaluation-per-required-hypothesis live outside the candidates, so the operations take verdicts as plain per-name values and answer plain values, and behavior over a non-total verdict set is theirs to define, not this task's.
Decision, beyond the covers — stand: domain/investigation/evaluation, domain/investigation/verdict, domain/investigation/assessment and rules/investigation/one-evaluation-per-required-hypothesis are the successor initiative's nodes, named only to locate the seam; verdicts enter this task as plain values and nothing here implements them.

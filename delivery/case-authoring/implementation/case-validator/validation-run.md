---
title: "The validation run over one case under edit"
summary: "The composition seam that hands one case under edit to every registered publication check and answers with every refusal they produced, written for task/case-validator/validation-run."
task: sha256:8b94afcc03af313675fee5574d48ab393fbf62bbfcea2f4fbe61d04d50cdd7e0
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/draft-case.ts
    effect: "declares DraftCase, the case under edit that every publication check reads — everything a case declares and not yet the version and hash publication assigns — admitting a hypotheses list a check must survive empty, with no way to build one"
  - path: src/knowledge/refusal.ts
    effect: "declares Refusal, the read-only value a check produces — the rule's identifier, the optional position as hypothesis name and offended term, and the text for the curator"
  - path: src/knowledge/validation.ts
    effect: "declares PublicationCheck as a function from the whole case under edit to the refusals it produced, and validate(), which runs every registered check whatever an earlier one decided and answers a frozen list holding every refusal collected, in registration order, never merged or deduplicated"
criteria:
  - criterion: "A run with no check registered does not refuse the case it is given."
    met: true
    how: "validate() over an empty checks list runs its loop zero times and answers a frozen empty list, and a validation that answered no refusal refused nothing"
  - criterion: "A run whose every registered check refuses nothing does not refuse the case it is given."
    met: true
    how: "a check that refuses nothing answers an empty list, so nothing is pushed for it and the run's answer stays empty across all such checks"
  - criterion: "A run with one registered check that refuses the given case refuses that case."
    met: true
    how: "every refusal the check answers is pushed into the run's answer, which is then non-empty, and a non-empty answer is the case refused"
  - criterion: "A run with two registered checks that both refuse the given case reports both refusals."
    met: true
    how: "the loop never breaks or returns early — every check runs whatever an earlier one decided — so both checks' refusals are concatenated into the one answer"
  - criterion: "A run reports no refusal that no registered check produced."
    met: true
    how: "the answer is built only by pushing, per refusal, what a registered check returned; each is copied field-for-field into a frozen value, which the refusal definition makes interchangeable with the one produced, and nothing else reaches the list"
nodes:
  - node: aggregate/knowledge/cases
    encoded_at:
      - src/knowledge/validation.ts
    how: "the run hands each check the whole DraftCase, encoding that the contract checks run over the whole; the aggregate's publishing clause, published whole or not at all, is the binding's REMAINDER — this run validates and refuses without publishing anything"
  - node: definition/knowledge/draft-case
    encoded_at:
      - src/knowledge/draft-case.ts
    how: "the node's attributes are the DraftCase shape — slug, title, whenToUse, subjectType bound by identity, embedded hypotheses, both fallback resolutions, optional curatorNotes — with no version and no hash, and the node's rule that a case under edit is what a publication check refuses is why validate() takes DraftCase and not the published Case"
  - node: definition/knowledge/refusal
    encoded_at:
      - src/knowledge/refusal.ts
      - src/knowledge/validation.ts
    how: "the Refusal type carries exactly the node's attributes — required rule identifier and curator text, optional hypothesis and offended term as the position — and the run answers refusals as that construct, never as opaque messages or a count, which is what the binding's second UNDERDETERMINED note required"
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    encoded_at:
      - src/knowledge/validation.ts
    how: "validate() iterates every registered check with no early return and no short-circuit on a collected refusal, and answers everything produced, so the count answered equals the count produced; the clause that a check is safe over a malformed case binds each check's own implementation and is the binding's REMAINDER, honored here by DraftCase admitting an empty hypotheses list so the case such a check must walk is representable"
  - node: rule/knowledge/two-positions-are-two-refusals
    encoded_at:
      - src/knowledge/validation.ts
    how: "the run collects per refusal, not per check, and never merges, deduplicates or collapses, so the two refusals one check produced at two positions arrive in the answer as two — which is what the binding's first UNDERDETERMINED note required; producing one refusal per position is the check's, stated on the PublicationCheck type"
inferences:
  - inferred: "the run's case input is the case under edit, not the published case"
    from: "definition/knowledge/draft-case — a case under edit is what a publication check refuses, because a published case is one that already holds, and it holds everything a case declares, which is what makes it the thing every publication check reads"
  - inferred: "the run's answer is the collected refusals themselves, and the case is refused exactly when that answer is non-empty; no separate verdict value is answered"
    from: "definition/knowledge/refusal defines a refusal as one reason one case did not pass validation, and no bound node declares a verdict construct distinct from the refusals — a second refused flag would be a second home for the fact the list already carries"
  - inferred: "a registered check is a function from the whole case under edit to the refusals it produced, and the checks are given to the run as an ordered list"
    from: "the every-refusal rule speaks of checks a validation carries and the refusals those checks produced, the task's rationale makes the checks parameters of the run, and no bound node states how checks are registered or ordered — a list is the least structure that carries every check and a stable answer order"
  - inferred: "refusals are answered in check-registration order and, within one check, in the order produced"
    from: "no bound node states an order for the answer; the input's own order is the only order the run receives"
  - inferred: "each collected refusal is copied field-for-field into a frozen value on collection"
    from: "the refusal node's value-object rationale — two refusals naming the same rule, position and text are interchangeable — and the tree's copy-on-construct precedent at src/investigation/assessment.ts and src/knowledge/case.ts, so the answer reads back what was produced even if a returned object is mutated afterwards"
divergences:
  - from: "definition/knowledge/draft-case, whose hypotheses attribute declares min_items: 1"
    departure: "the DraftCase type admits a hypotheses list that is empty at runtime, enforcing no minimum"
    why: "the bound every-refusal rule requires a check to walk a case with no hypothesis at all without failing, and the refusal definition makes both position parts optional precisely because a refusal exists with no hypothesis to name — encoding min_items in the type would make the case the rule requires checks to survive unrepresentable as validation input; the minimum is a publication check's to refuse, not the shape's to forbid"
preserved:
  - "the exported shapes this delivery imports — Hypothesis and HypothesisName at src/knowledge/hypothesis.ts, Resolution at src/knowledge/resolution.ts, SubjectTypeName at src/glossary/subject-type.ts — read exactly as declared; no existing file was modified"
  - "the published Case and createCase at src/knowledge/case.ts stand untouched beside the new DraftCase, and their copy-on-construct readback is unaffected"
  - "the existing specs under src/__tests__/unit/ exercise only modules this delivery did not touch"
deferred:
  - what: "copyResolution and copyReferral now exist module-private in both src/investigation/assessment.ts and src/knowledge/case.ts, the duplication the inventory's risk entry predicted"
    why: "unifying module-private helpers across modules reaches outside this task's objective, which is the run's composition; this delivery's own copy helper copies a flat refusal and duplicates neither"
  - what: "constructing a case under edit — the authoring act that produces a DraftCase"
    why: "the run validates a case it is handed; editing belongs to no task of this plan, so draft-case.ts declares the shape with no constructor, the same claim resolution.ts makes"
  - what: "the act that turns a case under edit into a published case"
    why: "the binding's REMAINDER — this run refuses without publishing, and the aggregate's whole-or-not-at-all publishing clause belongs to a publication act this plan does not hold"
---

## What it is

The one entry point through which a case under edit is validated whole — validate() at src/knowledge/validation.ts runs every registered publication check whatever an earlier one decided and answers with every refusal produced, over the DraftCase and Refusal shapes this delivery declares beside it.

## Notes

The run's case input is the case under edit rather than the published case, decided from the draft-case node's own rule that a case under edit is what a publication check refuses.
The two UNDERDETERMINED notes of the binding are answered by collecting per refusal with no merging and by answering refusals as the full refusal construct.
The DraftCase type deliberately does not enforce the base's one-hypothesis minimum so the malformed case every check must walk stays representable — a disclosed divergence, not an oversight.

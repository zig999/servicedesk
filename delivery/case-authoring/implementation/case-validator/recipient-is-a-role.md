---
title: "A referral goes to a published role"
summary: "The publication check that refuses a case under edit whose referral names a recipient the glossary does not publish, reading every hypothesis's resolution and both of the case's fallback resolutions alike, and staying safe over an empty hypotheses list or an absent fallback."
task: sha256:24c6bacee4dc37ad3dd729cf3b0dea8849b2e9dfcc3546280ff4592ecf1c9d0a
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/recipient-is-a-role.ts
    effect: "exports createRecipientIsARoleCheck(glossary), a factory closing over a PublishedGlossary and returning a PublicationCheck that refuses a draft case once for every referral — each hypothesis's own resolution, in declared order, then the no-data fallback, then the hypotheses-exhausted fallback — whose recipient the glossary does not publish under exact-match lookup; walks an empty hypotheses list and reads either fallback as possibly absent, producing no refusal for a fallback that is not there rather than indexing into it and throwing"
criteria:
  - criterion: "A case whose referral names a recipient the glossary does not publish as an operational role is refused by this check."
    met: true
    how: "unpublishedRecipientRefusal calls isPublished(glossary, recipient, 'recipient'); where it answers false the function returns a Refusal naming the rule, the offending recipient as offendedTerm, and — for a hypothesis's own referral — the hypothesis's name, and the outer loops push every such refusal into the answer"
  - criterion: "A case whose every referral names a recipient the glossary publishes as an operational role is not refused by this check."
    met: true
    how: "where isPublished answers true for every hypothesis's resolution and both present fallbacks, unpublishedRecipientRefusal returns undefined each time, nothing is pushed, and createRecipientIsARoleCheck's returned function answers a frozen empty array"
  - criterion: "A case whose fallback resolution carries a referral is read by this check the same as one carried by a hypothesis's resolution."
    met: true
    how: "both loops in the returned check call the identical unpublishedRecipientRefusal(glossary, resolution, hypothesis) against the same Resolution shape — once per hypothesis's own resolution and once per present fallback — differing only in that a fallback call passes undefined where a hypothesis call passes its name, which is the position field and not a difference in how the referral itself is read; both of the case's fallbacks are read, not only one, per the task's own second UNDERDETERMINED note"
nodes:
  - node: aggregate/knowledge/cases
    how: "honored rather than encoded: recipientIsARole is one PublicationCheck taking the whole draft case as its only input and reading all of it — every hypothesis's resolution and both fallback resolutions — matching the aggregate's rule that the contract checks run over the whole"
  - node: definition/knowledge/case
    how: "not reached directly — the check runs over the case under edit, before a case exists, and its shape governs only through draft-case.ts. The task's waived gap, attributes.version.derivation, is untouched: nothing in this module reads a version or a content hash"
  - node: definition/knowledge/draft-case
    encoded_at:
      - src/knowledge/recipient-is-a-role.ts
    how: "encoded as the check's parameter type: reads exactly draftCase.hypotheses, draftCase.noDataFallback and draftCase.hypothesesExhaustedFallback, and walks an empty hypotheses list or either fallback being absent without throwing — the same malformed shape draft-case.ts documents as admitted on purpose so a check can walk it"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/recipient-is-a-role.ts
    how: "reads hypothesis.name as the refusal's position and hypothesis.resolution as the resolution checked for that hypothesis; nothing else of the hypothesis (its collects list or its criterion prose) is read"
  - node: definition/knowledge/resolution
    encoded_at:
      - src/knowledge/recipient-is-a-role.ts
    how: "each of the three resolutions a case can carry a referral in — a hypothesis's own, the no-data fallback, the hypotheses-exhausted fallback — is passed through the identical unpublishedRecipientRefusal function via its .referral field, which is what criterion 3 answers to"
  - node: definition/knowledge/referral
    encoded_at:
      - src/knowledge/recipient-is-a-role.ts
    how: "reads resolution.referral.recipient, the one term this check tests; the referral's action half is deliberately left unread — the task's first REMAINDER note assigns the action clause to the sibling checks"
  - node: definition/glossary/recipient
    how: "read through the shared exact-match lookup (isPublished(glossary, recipient, 'recipient') in src/glossary/lookup.ts) rather than restated — the check's condition is exactly this node's own stated rule that a recipient a case names must exist in the glossary, compared character for character. The task's waived gap, attributes.name.values, is untouched: no recipient name is enumerated or hardcoded, only compared against whatever the given glossary happens to publish"
  - node: rule/glossary/recipient-is-a-role
    how: "honored, not encoded as its own refusal: the rule's own text states it holds over the glossary's entries and not over a case, so a check over a case tests only that the recipient exists — which is exactly what this module does. Its role-versus-person statement reaches no criterion of this task (the task's third REMAINDER note), so it produces no refusal of its own; see the first inference below for how the refusal's rule identifier was chosen instead"
  - node: rule/knowledge/case-terms-exist-in-the-glossary
    encoded_at:
      - src/knowledge/recipient-is-a-role.ts
    how: "the recipient clause of this rule's compound statement is exactly what unpublishedRecipientRefusal decides, and RULE_IDENTIFIER/REFUSAL_TEXT cite this rule, quoting its full statement verbatim; the other four clauses (subject type, concept, outcome, action) are the sibling checks' own, per the task's first REMAINDER note"
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    how: "honored for its one bound clause: presentFallbacks() reads the case's two fallbacks rather than indexing into them, and the loop over draftCase.hypotheses walks an empty list without failing, so the check stays safe over the malformed shapes the task's second UNDERDETERMINED note names. The rule's two composition clauses — running every check regardless of an earlier refusal, and answering every refusal produced — are validation-run's own to bind, per the task's fourth REMAINDER note; this check only had to be writable as a PublicationCheck under them, which it is"
inferences:
  - inferred: "the refusal this check produces cites rule/knowledge/case-terms-exist-in-the-glossary rather than rule/glossary/recipient-is-a-role, even though the file and the task are both named for the latter"
    from: "the task's first REMAINDER note, which states this task answers 'the recipient one' of the terms-exist rule's five clauses, read together with its third REMAINDER note, which states the role-versus-person statement of recipient-is-a-role 'reaches no criterion' — together they read as: the sentence this check actually decides is existence, so the refusal is the existence rule's, and recipient-is-a-role is bound to explain why existence is what a case-level check may decide, not to supply its own refusal"
  - inferred: "the check reads both of the case's declared fallback resolutions, not only one, applying the identical test used for a hypothesis's own resolution"
    from: "the task's second UNDERDETERMINED note in the binder's own words: a check reading only one fallback would ship unrefused a bad recipient sitting in the other, which aggregate/knowledge/cases' statement that the contract checks run over the whole refuses"
  - inferred: "the check treats an absent fallback (draftCase.noDataFallback or .hypothesesExhaustedFallback being undefined) as nothing to refuse for, rather than throwing or refusing for the absence itself"
    from: "the task's third UNDERDETERMINED note, which requires the check to be safe over a case missing a fallback rather than indexing into a well-formed shape and throwing, read together with draft-case.ts's own documented precedent of admitting an empty hypotheses list on purpose so a check can walk it without failing"
  - inferred: "the check is built as a factory over the glossary (createRecipientIsARoleCheck(glossary): PublicationCheck) rather than as a plain function of the case"
    from: "the convention already established by src/knowledge/concept-accepts-the-declared-subject-type.ts and src/knowledge/every-collected-concept-declares-a-ttl.ts, both glossary-consuming sibling checks built the same way for the same stated reason — PublicationCheck is a function of the case alone, so closing over the glossary is what lets the run register the result unmodified"
  - inferred: "the recipient-kind constant is typed as the shared GlossaryKind rather than a bare string literal"
    from: "src/glossary/lookup.ts's own exported GlossaryKind type, reused rather than restated, consistent with the inventory's convention against duplicating a shape the tree already declares"
divergences:
  - from: "the inventory's convention that a source module holds one file per base node, observed at all seven prior modules and each named for the single node it encodes"
    departure: "src/knowledge/recipient-is-a-role.ts is named for the task and for rule/glossary/recipient-is-a-role, but the refusal it produces cites rule/knowledge/case-terms-exist-in-the-glossary, so this one file spans two rule nodes rather than encoding exactly one"
    why: "the task's own REMAINDER notes assign this task the recipient clause of the shared terms-exist rule while recipient-is-a-role's own role/person statement reaches no criterion at all; naming the file for the task keeps it discoverable from the plan and avoids colliding with the sibling terms-exist-in-the-glossary task's own module for the other four clauses, at the cost of the file no longer mapping one-to-one to the rule its refusal names"
deferred:
  - what: "whether a case declares both fallbacks at all"
    why: "belongs to whichever check enforces definition/knowledge/case's own rule that a case declares both fallbacks; the task's second and third UNDERDETERMINED notes only require this check to be safe over a case missing one, never to refuse for the absence itself"
  - what: "the subject-type, concept, outcome and action clauses of rule/knowledge/case-terms-exist-in-the-glossary"
    why: "the task's first REMAINDER note assigns them to the sibling checks of the same epic (task/case-validator/terms-exist-in-the-glossary, per the inventory's risk list), the action clause specifically being the other half of the referral this check does not read"
  - what: "whether a registered recipient actually names an operational role rather than a person"
    why: "the task's third REMAINDER note states this statement reaches no criterion of this task; role-ness belongs to the act of registering a recipient entry, outside this plan"
  - what: "how this check's refusal is ordered, deduplicated or composed with the refusals of other checks across a validation run"
    why: "the task's fourth REMAINDER note assigns the every-refusal rule's composition clauses to validation-run's own binding; this check only had to be writable as a PublicationCheck under it"
---

## What it is

The check standing behind the base's statement that a referral goes to an operational role and never to a named person — a refusal decided over every referral a case declares, including the two it declares for when nothing confirms.

## Notes

A case can fail this check and the published-terms check at once, and they remain two checks because the base holds two rules that refuse for two reasons.
The third criterion fixes the reach of the check over all of a case's referrals rather than only those hanging from hypotheses.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.

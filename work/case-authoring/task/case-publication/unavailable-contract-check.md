---
title: The contract check that could not be decided
summary: What the publication contract check answers when the capability registry cannot be consulted — that it could not be decided, and never a refusal.
objective: The publication contract check over a capability registry that cannot be consulted answers that the check could not be decided, and answers no refusal.
rationale: This task is cut because commit a50f278 answered what the plan carried as an open question — what publication does when the registry cannot be consulted at all. It is cut apart from the contract check rather than folded into it because a registry being unreachable and a registry holding no registration are two outcomes with two reasons to change, and because the whole point of the base's new rules is that the two are never the same answer.
sources:
- intake/scope-2026-08-07.md
criteria:
- The contract check over a registry that cannot be consulted answers with an unavailable contract check.
- That answer carries a text written for the curator.
- The text that answer carries is written in Portuguese.
- That answer carries no refusal.
- That answer names no rule.
- The contract check over a registry that can be consulted and holds no capability for a collected concept answers with a refusal and never with an unavailable contract check.
- The contract check over a registry that can be consulted and holds a capability for every collected concept answers with neither a refusal nor an unavailable contract check.
depends_on:
- task/case-publication/capability-contract-check
- task/published-language-ports/capability-read-port
nodes:
- node: aggregate/knowledge/cases
  digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
- node: definition/integration/capability
  digest: sha256:d1cab846d7f441726474619d6dc845204f1da20b84a23db0ad3dcf22fd9cbab3
- node: definition/knowledge/check-unavailable
  digest: sha256:8937564a636f64d5fa9feafcb4edd35d9a644a7c7baac01e8e2b4e203f53a7b7
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/refusal
  digest: sha256:309393768aaec5c1fa69a62da0f18443ca25d3f2bb49ed1da901c923e3132270
- node: lifecycle/knowledge/case-publication
  digest: sha256:998c9ad8d2139b3c357f97fd9a3d1e89af282d2e38c17b82816e0ef9bbc12d2a
- node: rule/knowledge/a-case-does-not-publish-without-the-contract-check
  digest: sha256:151147ca40e48632470001b72e226644fd43d6c42579b30472a5277f4a04625a
- node: rule/knowledge/a-validation-answers-with-every-refusal
  digest: sha256:b467b515e8551ff4f6f914376608842fce28cf02545031f8c2aab4b369898886
- node: rule/knowledge/an-unavailable-check-is-not-a-refusal
  digest: sha256:f0a5343dc726fd7dcb01783be015487fac991f48a309c662804f0edf92656010
- node: rule/knowledge/every-collected-concept-has-a-read-only-capability
  digest: sha256:2e41ebeb0d6e56b56aab0a2b44d1ccf640b05c7b5df02bc2b123c3539df622f9
- node: rule/knowledge/the-contract-check-reads-the-current-registration
  digest: sha256:242b37f434d0fa118452db112597df140bf8a8889b0b58222ef1a6c011162d52
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: No node states the Portuguese sentence the unavailable contract check carries. definition/knowledge/check-unavailable requires a text attribute and says in prose only that the curator is told the check could not be decided and to try again; rule/knowledge/what-the-curator-reads-is-written-in-portuguese requires that text to be in Portuguese; and the node that supplies texts, rule/knowledge/the-refusal-text-comes-from-the-rule, reaches only refusals — this answer names no rule, so no rule declares its text. Criteria 2 and 3 cannot be met without writing a sentence the business never stated, in the one place a reviewer would read it as one.
- question: No node states what makes the capability registry impossible to consult — the condition that tells criterion 1 apart from criterion 6. definition/knowledge/check-unavailable and rule/knowledge/a-case-does-not-publish-without-the-contract-check say only cannot be consulted and cannot be reached, and no node gives a deadline, an error condition or a retry for the publication-time registry consultation.
- question: No node says whether a lookup that fails for one collected concept while others answer makes the whole contract check unavailable, or leaves the check decided over the concepts that answered. The base speaks of the registry as consultable or not as a whole, while aggregate/knowledge/cases puts the check over the whole case, concept by concept.
- question: No node says what publication answers when the registry cannot be consulted and other checks of the validation produced refusals over the same case. definition/knowledge/check-unavailable says publication answers with the unavailable check and never with a refusal, and rule/knowledge/an-unavailable-check-is-not-a-refusal states publication MUST NOT answer with any refusal; rule/knowledge/a-validation-answers-with-every-refusal states a validation runs every check whatever an earlier one decided and answers with every refusal those checks produced. The two are stated over the same case and the base does not reconcile them.
waived:
- gap: definition/integration/capability#attributes.timeout.unit
  why: The contract check reads that a timeout is declared and never its value. Nothing in criteria 1-7 compares a timeout to anything, so the missing unit changes no answer this task produces.
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: The gap is about which identifier a refusal names for the two checks held as required attributes rather than as rule nodes. Neither is this task's check; the only refusal this task produces is the one criterion 6 names, and the rule it names exists as a node with an identifier.
- gap: lifecycle/knowledge/case-publication#transitions.published.publish
  why: The gap asks how a slug already published becomes editable again. This task's criteria are all about what the contract check answers over the three registry conditions at the publish trigger from draft; no criterion turns on republication, and the check's answer over an unconsultable registry is the same whichever way that transition is later settled.
---
## What it is

The third answer the contract check can give, beside refusing and passing.
It says the check could not be decided, and it says nothing about the case, which may be perfect.

## Notes

This task is new, and it exists because the base now holds a construct and three rules where the plan carried a question.
It delivers the check's answer; that a case carrying this answer does not publish is delivered by the transition, which depends on this task.
No criterion here names a rule the answer offends, because the answer names none: a refusal names a rule the case broke, and nothing here established anything about the case.
UNDERDETERMINED, from the binding — the base requires the case not to publish while the check cannot be decided, and no criterion of this task says the case does not publish; all seven speak only of what the check answers.
UNDERDETERMINED passes — a publication that answers with the unavailable contract check, carrying Portuguese text, naming no rule and carrying no refusal, and nevertheless publishes the case.
UNDERDETERMINED, from the binding — criterion 6 says a refusal, singular, and says nothing about the count, while the base counts refusals per position refused.
UNDERDETERMINED passes — a contract check that stops at the first collected concept with no registered capability and answers a single refusal, over a case two of whose collected concepts have no registered capability.
UNDERDETERMINED, from the binding — criterion 6 does not say what the refusal it requires carries, while the base fixes its rule identifier, its position and its declared text.
UNDERDETERMINED passes — a refusal carrying wording the check invented, or English wording, and a position naming the case root rather than the path reaching the hypothesis by name and then the collected concept.
UNDERDETERMINED, from the binding — criterion 7 reads as holding a capability for every collected concept, while the bound rule refuses publication while any named concept has no registered read-only capability declaring an output schema and a timeout.
UNDERDETERMINED passes — a check that treats a concept as satisfied because some capability is registered for it, where that registration declares no output schema or no timeout.
UNDERDETERMINED, from the binding — criteria 6 and 7 state no lookup discipline, while the base fixes the comparison character for character, the cardinality at one, and the registration as the current one.
UNDERDETERMINED passes — a check that resolves a collected concept by a normalised name comparison, or that falls back to an earlier registered version of a capability.
UNDERDETERMINED, from the binding — two bound nodes contradict each other over one case, the registry unconsultable while another check has refused, and criterion 4 settles nothing because it scopes no refusal to the check's own answer.
UNDERDETERMINED passes — a publication over an unreachable registry that suppresses the refusals the other checks produced and answers only the unavailable contract check.
REMAINDER, from the binding — the read-failure clause of `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` and the bound node's clause about a file that does not parse reach no criterion here.
REMAINDER belongs — `task/case-shape/case-file-reader`, over `definition/knowledge/read-failure` and `rule/knowledge/an-unreadable-case-is-not-validated`.
REMAINDER, from the binding — the first clause of `rule/knowledge/a-validation-answers-with-every-refusal` reaches no criterion, this task delivering one check rather than the composition of them.
REMAINDER belongs — `task/case-publication/publish-transition`, which composes the validation over all of a case's checks.
REMAINDER, from the binding — clauses of the lifecycle about the index keeping every published version, nothing approving a publication and publication counting the version reach no criterion here.
REMAINDER belongs — `task/case-publication/publish-transition` and `task/case-publication/content-hash`.
REMAINDER, from the binding — clauses of `definition/knowledge/hypothesis` about one falsifiable claim, unique names and the criterion sitting in the frontmatter reach no criterion, this task reading only its collects list.
REMAINDER belongs — the hypothesis-validation tasks of `epic/case-validation`, and `task/case-shape/case-file-reader` for the frontmatter clause.
REMAINDER, from the binding — clauses of `definition/integration/capability` about the registry refusing a non-read-only nature and about running in the requester's scope reach no criterion here.
REMAINDER belongs — the integration context's own acts, which this plan does not build.
REMAINDER, from the binding — the clause of `aggregate/knowledge/cases` about duplicating a hypothesis until the third duplication reaches no criterion here.
REMAINDER belongs — the authoring act, which no task of this plan performs.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` and `rule/knowledge/an-unreadable-case-is-not-validated` are `epic/case-shape`'s claim; `rule/knowledge/the-refusal-text-comes-from-the-rule`, `rule/knowledge/a-position-indexes-a-hypothesis-by-name` and the hypothesis-validation rules are `epic/case-validation`'s; and `rule/integration/a-registry-lookup-names-a-concept-exactly`, `rule/integration/one-capability-answers-one-concept` and `definition/glossary/concept` are `epic/published-language-ports`', bound by `task/published-language-ports/capability-read-port`, which this task depends on — each delivered once where it is owned rather than restated here.
From the binding — `rule/knowledge/every-collected-concept-has-a-read-only-capability` declares `constrains: definition/knowledge/case`, the published value, while the check it states runs over the case under edit, so the two rules disagree about which construct the contract check reads.
From the binding — `definition/glossary/concept` is what the registry lookup names and is outside this epic's candidates, so its own open gap cannot be triaged by this binding.

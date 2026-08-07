---
title: Every collected concept has a read-only capability
summary: The contract between curated knowledge and integration, checked against the registration in force when a case is published.
objective: Publishing refuses a case that collects a concept for which the registry holds no capability, once at the position of each such collected concept.
rationale: The decomposition placed this check under publication rather than beside the other checks because the base registers it as the point where the contract with the integration context is verified, and it reads the capability registry that no other check reads. The criteria asking for a registered capability declaring no output schema or no timeout were removed after a binder found the base holds both as declared by construction. Criteria six and seven were added after commit a50f278 stated which registration the check reads, and the criteria on position and count were re-cut from the same commit's making a position a path.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- A case collecting a concept for which the registry holds no capability is answered with a refusal naming this rule.
- Each such refusal carries the text this rule declares, with the concept named in place.
- Each such refusal's position is the path at which the concept was collected.
- A case collecting the same unbacked concept in two hypotheses is answered with two refusals, one at the position of each.
- A hypothesis collecting two unbacked concepts is answered with two refusals, one at the position of each.
- The check reads the capability registered for a concept at the moment of publication.
- The check considers no earlier version of a capability.
- The check reads the output schema and the timeout of every registered capability it finds.
- The check invokes no capability.
- Publishing a case runs this check.
- A case every collected concept of which has a registered capability is not refused by this rule.
depends_on:
- task/case-validation/refusal-and-accumulation
- task/published-language-ports/capability-read-port
nodes:
- node: aggregate/knowledge/cases
  digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
- node: definition/integration/capability
  digest: sha256:d1cab846d7f441726474619d6dc845204f1da20b84a23db0ad3dcf22fd9cbab3
- node: definition/knowledge/draft-case
  digest: sha256:9c3360b04b1eb11db3c2d54299b2909173b3ec7bfdfb6a4e5d47e69acbc668e9
- node: definition/knowledge/hypothesis
  digest: sha256:690eee99a05f5f75e890b6f1f06c278656b0fabd56ab9f6aac158dfdce3b065d
- node: definition/knowledge/refusal
  digest: sha256:309393768aaec5c1fa69a62da0f18443ca25d3f2bb49ed1da901c923e3132270
- node: lifecycle/knowledge/case-publication
  digest: sha256:998c9ad8d2139b3c357f97fd9a3d1e89af282d2e38c17b82816e0ef9bbc12d2a
- node: rule/integration/a-capability-is-read-only
  digest: sha256:6f1b47c0c28b725ee3e78d38e96521c2be925bb60ab09c06340f944a6f269dfa
- node: rule/knowledge/a-validation-answers-with-every-refusal
  digest: sha256:b467b515e8551ff4f6f914376608842fce28cf02545031f8c2aab4b369898886
- node: rule/knowledge/every-collected-concept-has-a-read-only-capability
  digest: sha256:2e41ebeb0d6e56b56aab0a2b44d1ccf640b05c7b5df02bc2b123c3539df622f9
- node: rule/knowledge/the-contract-check-reads-the-current-registration
  digest: sha256:242b37f434d0fa118452db112597df140bf8a8889b0b58222ef1a6c011162d52
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- question: No node says whether this check also refuses at the position of a concept the glossary does not publish, or leaves that position to the term check alone. rule/knowledge/a-validation-answers-with-every-refusal states that an unpublished concept is one refusal rather than three at the same position, without naming which three checks those are; definition/glossary/concept names the term check as refusing alone and names only the ttl and the subject-type checks as refusing nothing over it, and never names the capability check either way. Criterion 1 refuses at every collected concept the registry holds no capability for, and a concept the glossary does not publish is one of those, so the two readings differ in the refusals a curator is answered with.
waived:
- gap: definition/integration/capability#attributes.timeout.unit
  why: Criterion 8 has the check read the timeout only to establish that a registered capability declares one — definition/integration/capability states the publication check reads that the declaration is present, invoking nothing. Nothing in this task compares the timeout against a bound, converts it, elapses against it, or renders it to the curator. A criterion that measured or displayed the timeout would un-waive this.
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
  why: The gap is about which identifier a refusal names when one of the two checks held as required attributes rather than as rule nodes refuses. Every refusal this task produces is produced by rule/knowledge/every-collected-concept-has-a-read-only-capability, which is a rule node and has an identifier.
- gap: lifecycle/knowledge/case-publication#transitions.published.publish
  why: The gap asks how a slug already published becomes editable again. This task delivers the check that runs on the publish trigger, and definition/knowledge/draft-case settles what the check reads and refuses in either reading. The check's input, its refusals and their positions are the same whichever way the case under edit came to exist; the gap bears on the task that assigns a published case its version.
---
## What it is

The check that runs when a case is published, over the registrations in force at that moment.

## Notes

No criterion here asks whether a registered capability is read-only, declares an output schema or declares a timeout, because the base holds that a capability lacking any of the three is never registered; criterion one is what carries all three.
Criterion nine keeps the check a reading of declarations rather than a call to the capability.
Criteria four and five together settle what the plan carried as an open reading of what counts as one position for this rule: two positions are two paths, whether they sit in one hypothesis or in two.
What this check answers when the registry cannot be consulted at all is a different answer and is cut as its own task.
UNDERDETERMINED, from the binding — the clause that a validation runs every check whatever an earlier one decided reaches no criterion, since criteria 4 and 5 count this check's own refusals against each other.
UNDERDETERMINED passes — an implementation that runs the capability check only where the checks before it refused nothing.
UNDERDETERMINED, from the binding — no criterion exercises the check over a case under edit that violates the declared shape, which the base requires a check to walk safely.
UNDERDETERMINED passes — an implementation that raises over a case under edit declaring no hypothesis, or over a hypothesis whose collects is absent or empty.
UNDERDETERMINED, from the binding — criterion 11 makes a registered capability sufficient while the bound rule conditions publication on one declaring an output schema and a timeout, so the branch criterion 8 exists for has no stated outcome.
UNDERDETERMINED passes — an implementation that answers no refusal for a concept whose registered capability declares no output schema or no timeout, on the ground that a capability is registered for it.
UNDERDETERMINED, from the binding — criterion 3 requires the position to be the path at which the concept was collected, and no candidate states how the collected-concept segment is written; the node that settles it is outside this epic's candidates.
UNDERDETERMINED passes — an implementation whose position names the collected concept by its ordinal in the hypothesis's collects list rather than by the concept's name.
UNDERDETERMINED, from the binding — no criterion exercises the ordinal fallback, and the case that needs it is exactly a case under edit whose uniqueness rule refuses, which this check must still walk.
UNDERDETERMINED passes — an implementation that indexes a position by the hypothesis name alone, yielding two refusals at one identical path over a case carrying two same-named hypotheses each collecting an unbacked concept.
UNDERDETERMINED, from the binding — the bound rule's clause that a registry which cannot be consulted is answered as an unavailable check rather than as a refusal of this rule reaches no criterion, and nothing in these eleven criteria excludes the wrong reading.
UNDERDETERMINED passes — an implementation that treats a registry it cannot consult as a registry that holds no capability, answering a refusal of this rule at the position of every collected concept.
UNDERDETERMINED, from the binding — no criterion states the character-for-character comparison that decides criterion 1's antecedent, and the node whose statement owns it is not among the candidates.
UNDERDETERMINED passes — an implementation whose registry lookup compares concept names case-insensitively or after normalisation.
REMAINDER, from the binding — `rule/integration/a-capability-is-read-only`'s statement reaches no criterion; it is bound because it licenses criteria 8 and 11 to speak of a registered capability without the check verifying nature, the guarantee being the registry's and made at registration.
REMAINDER belongs — the act of registering a capability in the integration context, which this plan does not build.
REMAINDER, from the binding — the identity half of publishing reaches no criterion here: that a published version is identified by its content and the index keeps all of them, that publication counts the version, and that a case is published whole or not at all.
REMAINDER belongs — `task/case-publication/content-hash` and `task/case-publication/publish-transition`.
REMAINDER, from the binding — the clauses about a case file that does not parse reach no criterion here.
REMAINDER belongs — `task/case-shape/case-file-reader`, which answers a read failure over a file that does not parse.
REMAINDER, from the binding — that nothing approves a publication reaches no criterion of this task, which delivers one of the checks rather than the trigger they bound.
REMAINDER belongs — `task/case-publication/publish-transition`.
Decision, beyond the covers — stand: `rule/integration/one-capability-answers-one-concept` and `definition/glossary/concept` are `epic/published-language-ports`' claim, bound by `task/published-language-ports/capability-read-port`, which this task depends on and reads the registry through; `rule/knowledge/the-refusal-text-comes-from-the-rule` and `rule/knowledge/a-position-indexes-a-hypothesis-by-name` are `epic/case-validation`'s, bound by `task/case-validation/refusal-and-accumulation`, which this task also depends on — so the comparison, the cardinality, the text and the position are each delivered once at the seam rather than restated at this consumer.
From the binding — no node states the interface by which publication consults the capability registry; the one published integration interface is the investigation's call to have a concept answered, which criterion 9 forbids this check from invoking.
From the binding — criterion 2 follows this rule's own text, which carries one placeholder for the concept and none for a position, while the generic wording requires the text instantiated with the position; worth reconciling in the base rather than in the task.

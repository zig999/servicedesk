---
title: A case moves from being edited to being published
summary: The transition that validates a case under edit and, where nothing refuses and the contract check decided, produces the published case carrying its counted version and its hash.
objective: A case under edit that no check refuses and whose contract check was decided becomes a published case carrying its counted version and its hash, and one that a check refuses or whose contract check could not be decided does not.
rationale: The decomposition cut the transition as its own task because the base registers a case and its hypotheses as written, validated and published as one thing, and the transition is the one place the three meet. Criteria three through five were added after commit a50f278 closed the open gap over how a version is derived by stating that publication counts it per slug; criteria nine, eleven, twelve and thirteen were added from the same commit, which states that every refusal is answered, what an unconsultable registry answers with, and that nobody approves the act.
sources:
- intake/scope.md
- intake/scope-2026-08-07.md
criteria:
- Publishing a case under edit that no check refuses yields a published case.
- The published case carries the hash of the file it was published from.
- The published case's version is 1 where no version of its slug has been published.
- The published case's version is one greater than the greatest version already published for its slug.
- The published case carries no version a curator wrote.
- The published case holds its hypotheses in the order the case under edit declared them.
- The published case holds everything the case under edit declared.
- Publishing a case under edit that a check refuses yields the refusals and no published case.
- Publishing a case under edit that two checks refuse yields both refusals.
- Publishing a case whose collected concept has no registered read-only capability yields that refusal and no published case.
- Publishing a case while the capability registry cannot be consulted yields no published case.
- Publishing a case while the capability registry cannot be consulted yields the unavailable contract check and no refusal.
- Publishing a case that no check refuses takes no approval as an input and records no approver.
depends_on:
- task/case-publication/capability-contract-check
- task/case-publication/content-hash
- task/case-publication/unavailable-contract-check
- task/case-validation/refusal-and-accumulation
nodes:
- node: aggregate/knowledge/cases
  digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
- node: definition/integration/capability
  digest: sha256:d1cab846d7f441726474619d6dc845204f1da20b84a23db0ad3dcf22fd9cbab3
- node: definition/knowledge/case
  digest: sha256:d512d19003a13abdf718191e259fb2a9d22a8389ad46c5461aa43bdd6eebe32f
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
- node: rule/knowledge/a-case-is-one-file
  digest: sha256:58b96adc27a29ee585501b48210ed953e0575736fe400d200014277e8a4e6593
- node: rule/knowledge/a-validation-answers-with-every-refusal
  digest: sha256:b467b515e8551ff4f6f914376608842fce28cf02545031f8c2aab4b369898886
- node: rule/knowledge/an-unavailable-check-is-not-a-refusal
  digest: sha256:f0a5343dc726fd7dcb01783be015487fac991f48a309c662804f0edf92656010
- node: rule/knowledge/every-collected-concept-has-a-read-only-capability
  digest: sha256:2e41ebeb0d6e56b56aab0a2b44d1ccf640b05c7b5df02bc2b123c3539df622f9
- node: rule/knowledge/nothing-approves-a-publication
  digest: sha256:56ccb01efb2936b5bf85116df359809e5c2911e0172ef42a60a131c30eb27e96
- node: rule/knowledge/publication-counts-the-version
  digest: sha256:c9477424e89cfcc4c217faf73f166b9cbc7afc57adc563b417dcaaa77f29a6e6
- node: rule/knowledge/the-content-hash-covers-the-whole-file
  digest: sha256:ff34ab8bff09ffeb96aff532289e784ed6087dbdb6b3b8d820a82cb1a47885ea
- node: rule/knowledge/the-content-hash-is-a-named-sha-256
  digest: sha256:6397fe1f41e13c6ba22d6784d73e51e2a1ec987c1054994380d8199431317286
- node: rule/knowledge/the-contract-check-reads-the-current-registration
  digest: sha256:242b37f434d0fa118452db112597df140bf8a8889b0b58222ef1a6c011162d52
- node: rule/knowledge/two-positions-are-two-refusals
  digest: sha256:430c295bf94b5e207717a04222a0cf91c54397a1701adc77d674e36d0546833a
- node: rule/knowledge/what-the-curator-reads-is-written-in-portuguese
  digest: sha256:46716746cab8ff38b085f7267455aa6ea6b4ec1fa354479227cff3f2ec68cae9
unresolved:
- gap: lifecycle/knowledge/case-publication#transitions.published.publish
- gap: definition/knowledge/refusal#attributes.rule.structural-checks
- question: The base does not say what publication answers when the capability registry cannot be consulted and some other check of the same case has refused. rule/knowledge/an-unavailable-check-is-not-a-refusal requires that publication answer the unavailable contract check and no refusal; rule/knowledge/a-validation-answers-with-every-refusal requires that the validation answer with every refusal its checks produced. Criterion 12 restates the first flatly, and the two cannot both hold over one case that is both wrong and unchecked.
waived:
- gap: definition/integration/capability#attributes.timeout.unit
  why: The publication check reads that a timeout declaration is present and never a duration. No criterion of this task compares, elapses or displays a timeout, so what unit the number is in changes nothing this transition decides. The unit bears on whoever runs a capability against a deadline, which is the investigation context and not this act.
---
## What it is

The one act where the validation, the contract check, the hash and the version meet, and where a case under edit becomes a published value or does not.

## Notes

The refusal path, the undecided path and the publishing path are all criteria here, because the transition is the one place any of the three can be observed.
Criteria three through five are new and are what the plan previously carried as an unresolved gap over the version's derivation, now stated in the base.
Criterion nine states the totality the plan left to any non-empty answer, which the base decides per position.
Criterion thirteen is the complement of a prohibition and asserts only that this rule does not refuse the act.
The form of the hash is the hash task's, and this transition carries only that the published case holds the one taken from the file it was published from.
UNDERDETERMINED, from the binding — no criterion reaches the read-failure path, which two bound nodes state, and the nodes holding the construct are outside this epic's candidates.
UNDERDETERMINED passes — a publish that answers an unparseable case file with a refusal, or with the unavailable contract check, or with the refusals of checks it ran over a half-parsed file.
UNDERDETERMINED, from the binding — criteria 11 and 12 describe the unconsultable registry as an outcome and never as a point in a sequence, so nothing holds the transition to running the rest of the validation first.
UNDERDETERMINED passes — a publish that consults the registry first, finds it unreachable, stops, and answers only the unavailable contract check, running none of the case's other checks.
UNDERDETERMINED, from the binding — criterion 10 stops at a concept having no registered read-only capability, while the bound rule conditions on one declaring an output schema and a timeout.
UNDERDETERMINED passes — a contract check that refuses only where the registry answers nothing for the concept, never reading whether the capability it did get back declares an output schema and a timeout.
UNDERDETERMINED, from the binding — neither clause of `rule/knowledge/the-contract-check-reads-the-current-registration` reaches a criterion, since criterion 10 states the outcome of the lookup and not its moment or its subject.
UNDERDETERMINED passes — a contract check reading a registry snapshot cached before the publish was requested, or one falling back to the last capability registered for the concept.
UNDERDETERMINED, from the binding — criterion 2 requires only that the published case carry the hash of the file, and says nothing of its form, while `definition/knowledge/case` carries `content_hash` as a bare string.
UNDERDETERMINED passes — a published case whose content hash is a bare sixty-four-character digest with no algorithm prefix, or one written in uppercase hexadecimal.
UNDERDETERMINED, from the binding — criteria 8, 9 and 10 say refusals are yielded and never say what one carries, while the base makes rule, position and text all required.
UNDERDETERMINED passes — a publish answering refusals carrying sentences the implementation composed itself, in English, with no position, and an unavailable check whose text is in English.
UNDERDETERMINED, from the binding — criterion 9 counts checks, not positions, so nothing reaches the per-position count the base requires; the contract check is the likeliest one to refuse a case at two positions.
UNDERDETERMINED passes — a publish that answers one refusal naming the contract rule and listing both concepts it refused.
UNDERDETERMINED, from the binding — the kept-under-version-control clause of `rule/knowledge/a-case-is-one-file` reaches no criterion.
UNDERDETERMINED passes — a publish that takes its case from any readable source, hashes those bytes and publishes.
Decision, beyond the covers — stand: `definition/knowledge/read-failure` and `rule/knowledge/an-unreadable-case-is-not-validated` are `epic/case-shape`'s claim, bound by `task/case-shape/case-file-reader`; `rule/knowledge/the-refusal-text-comes-from-the-rule`, `rule/knowledge/a-position-indexes-a-hypothesis-by-name` and the six validation check rules are `epic/case-validation`'s, bound by the tasks this one depends on — so what a refusal carries and what an unreadable file answers are each delivered once where they are owned.
From the binding — criterion 9 requires two checks to refuse one case while exactly one check in this epic's covers produces a refusal, so it is demonstrable only through the dependency on `task/case-validation/refusal-and-accumulation`, which owns the other checks.
From the binding — criterion 7 requires the published case to hold everything the case under edit declared, and three of those declarations are values whose shape lives outside this epic's candidates, so what everything contains stops at a reference under this binding.
From the binding — `rule/integration/a-capability-is-read-only` is a candidate left unbound, because its obligation falls on the registry at the moment a capability is registered and this task never registers one; `task/case-publication/capability-contract-check` binds it.

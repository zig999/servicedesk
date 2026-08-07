---
title: A case moves from being edited to being published
summary: The transition that validates a case under edit and, where nothing refuses, produces the published case carrying its version and its hash.
rationale: The decomposition cut the transition as its own task because the base registers a case and its hypotheses as written, validated and published as one thing, and the transition is the one place the three meet.
sources:
  - intake/scope.md
objective: A case under edit that no check refuses becomes a published case carrying its version and its hash, and one that a check refuses does not.
criteria:
  - Publishing a case under edit that no check refuses yields a published case.
  - The published case carries a version.
  - The published case carries the hash of the file it was published from.
  - The published case holds its hypotheses in the order the case under edit declared them.
  - The published case holds everything the case under edit declared.
  - Publishing a case under edit that a check refuses yields the refusals and no published case.
  - Publishing a case whose collected concept has no registered read-only capability yields that refusal and no published case.
depends_on:
  - task/case-publication/capability-contract-check
  - task/case-publication/content-hash
  - task/case-validation/refusal-and-accumulation
nodes:
  - node: aggregate/knowledge/cases
    digest: sha256:cb2f4e40c9d78a66b2b0001e1ba2ed7f45e5bd5f833e89fed97e0ef5dec113c8
  - node: definition/integration/capability
    digest: sha256:80676c92ef8286fcfba04996c1672bef02ef9ec1426f7baa9ec4b2a79ed95a3b
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: lifecycle/knowledge/case-publication
    digest: sha256:ac7d1d514b2cff06e1d519e80a06a27feb30d6ea5276630afb98e958123813fa
  - node: rule/integration/a-capability-is-read-only
    digest: sha256:6f1b47c0c28b725ee3e78d38e96521c2be925bb60ab09c06340f944a6f269dfa
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
  - node: rule/knowledge/every-collected-concept-has-a-read-only-capability
    digest: sha256:a675657d26c23639438a7eb06b4d1204c4ba9898042bd05974251f622f1e4b80
  - node: rule/knowledge/the-content-hash-covers-the-whole-file
    digest: sha256:4874d358e10ea040974b075a80a5ef12ff4e9c77dae165ac048df88aa5ae7728
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
unresolved:
  - gap: definition/knowledge/case#attributes.version.derivation
  - gap: lifecycle/knowledge/case-publication#rejections
  - question: No node states what publication does when the capability registry cannot be consulted at all. Integration is a separate context that knowledge consumes as a customer, criterion seven turns on whether a concept has a registered read-only capability, and the objective is total — refused, or published. Whether an unreachable registry refuses the publication, and with what refusal, is a fact the base does not hold.
waived:
  - gap: definition/integration/capability#attributes.timeout.unit
    why: The publication check reads that the timeout declaration is present and invokes nothing, which definition/integration/capability states in its own body, so no path of this transition compares a timeout to a duration. The unit is needed where a capability is actually called, which this task never does.
  - gap: lifecycle/knowledge/case-publication#transitions.published.publish
    why: This task performs only the draft-to-published transition the lifecycle declares, and no criterion begins from a published case. The version fact the two share is carried separately as unresolved on definition/knowledge/case#attributes.version.derivation, so waiving here does not hide it.
---
## What it is

The one move from the case under edit to the published case.
It runs the validation, and where nothing refuses it produces the published case with the version and the hash it did not previously carry.

## Notes

The refusal path and the publishing path are both criteria here, because the transition is the one place either can be observed.
UNDERDETERMINED, from the binding — the clause of `rule/knowledge/a-validation-answers-with-every-refusal` requiring every check to run whatever an earlier one decided reaches no criterion, since criterion six says only that a refused case yields the refusals and no published case, which any non-empty answer satisfies.
UNDERDETERMINED passes — a publication that stops at the first refusing check and answers that one refusal, leaving the curator to publish and correct once per mistake.
UNDERDETERMINED, from the binding — the statement of `rule/knowledge/two-positions-are-two-refusals` reaches no criterion, and no criterion states what a refusal carries.
UNDERDETERMINED passes — a publication whose refusals are bare message strings naming neither the rule nor the position, answering one refusal for a rule that refused at two positions of the same case.
UNDERDETERMINED, from the binding — the clause of `rule/knowledge/every-collected-concept-has-a-read-only-capability` requiring the capability to declare an output schema and a timeout reaches no criterion, since criterion seven stops at the capability being registered and read-only.
UNDERDETERMINED passes — a publication that accepts the mere presence of a registered capability without reading that it declares an output schema and a timeout.
UNDERDETERMINED, from the binding — the clause of `rule/knowledge/the-content-hash-covers-the-whole-file` requiring the hash to cover the curator's prose reaches no criterion, since criterion three says only that the published case carries the hash of the file it was published from.
UNDERDETERMINED passes — a publication computing the hash over the case's structured fields, or over a canonical re-serialisation of them, so that correcting a sentence of curator prose republishes the same hash instead of a different published case.
UNDERDETERMINED, from the binding — the base states six further publication checks in rule nodes this binding cannot reach, and only criterion seven names a check at all.
UNDERDETERMINED passes — a publication whose validation carries exactly one check, the registered read-only capability, and therefore publishes a case with no hypothesis, with two hypotheses sharing a name, or naming a term the glossary does not publish.
Decision, beyond the covers — stand: `rule/knowledge/case-has-at-least-one-hypothesis`, `rule/knowledge/hypothesis-collects-at-least-one-concept`, `rule/knowledge/hypothesis-name-is-unique-in-its-case`, `rule/knowledge/case-terms-exist-in-the-glossary`, `rule/knowledge/every-collected-concept-declares-a-ttl` and `rule/knowledge/concept-accepts-the-declared-subject-type` are `epic/case-validation`'s claim, each delivered by a task of that epic and assembled by `task/case-validation/refusal-and-accumulation`, which this task depends on; claiming them here would put one check under two epics that each answer for it.
UNDERDETERMINED, from the binding — criterion seven matches a case's collected concepts against registered capabilities, and how that match is decided is not bindable here.
UNDERDETERMINED passes — a publication matching a collected concept to a capability's concept case-insensitively or after normalisation, so a case naming ONU-Offline publishes against a capability registered for onu-offline.
Decision, beyond the covers — stand: `definition/glossary/concept` and `rule/glossary/a-lookup-matches-a-published-name-exactly` are claimed by `epic/published-language-ports` and `epic/case-validation`, where the lookup and its exactness are delivered.
UNDERDETERMINED, from the binding — what the published case must hold for criterion five is stated in nodes this task may not bind.
UNDERDETERMINED passes — a published case carrying its two fallbacks and each hypothesis's resolution as opaque text rather than the outcome-and-referral pair the base declares.
Decision, beyond the covers — stand: `definition/knowledge/resolution`, `definition/knowledge/referral` and `definition/glossary/subject-type` are claimed by `epic/case-shape` and `epic/case-validation`, where those shapes are declared and their terms checked.
REMAINDER, from the binding — the statement of `rule/integration/a-capability-is-read-only` reaches no criterion, because nothing here registers a capability; it is bound because it is what guarantees criterion seven's predicate.
REMAINDER belongs — the act that registers a capability in the integration context, which this plan does not build.
REMAINDER, from the binding — the clause of `lifecycle/knowledge/case-publication` that a published version is identified by its content and that the index keeps all of them reaches no criterion, since criteria one through seven stop at producing the published case.
REMAINDER belongs — a task that persists published cases and keeps every published version reachable, which this plan does not hold.
REMAINDER, from the binding — clauses of three bound nodes describe running a case rather than publishing one, and publication invokes nothing.
REMAINDER belongs — the investigation act, at `interface/integration/capability-query` and `rule/investigation/collection-runs-in-the-requester-scope`.
Decision, beyond the covers — stand: `interface/integration/capability-query` and `rule/investigation/collection-runs-in-the-requester-scope` belong to contexts this plan does not build.
From the binding — `rule/knowledge/hypotheses-are-ordered-by-precedence` states why criterion four's order matters and says no validator can check the precedence, so criterion four can only ever hold order-preservation and never the precedence itself.
Decision, beyond the covers — stand: `rule/knowledge/hypotheses-are-ordered-by-precedence` is `epic/case-shape`'s claim, bound by `task/case-shape/draft-case-shape`, where the order a curator declares is preserved.

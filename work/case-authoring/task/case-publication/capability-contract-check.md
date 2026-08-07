---
title: Every collected concept has a read-only capability
summary: The contract between curated knowledge and integration, checked when a case is published.
rationale: The decomposition placed this check under publication rather than beside the other checks because the base registers it as the point where the contract with the integration context is verified, and it reads the capability registry that no other check reads. The criteria asking for a registered capability declaring no output schema or no timeout were removed after a binder found the base holds both as declared by construction; the check now stops at what registration itself decides, and the rule's remaining substance is that publication reads those declarations while invoking nothing.
sources:
  - intake/scope.md
objective: Publishing refuses a case that collects a concept with no registered capability.
criteria:
  - A case collecting a concept with no registered capability is answered with a refusal naming this rule.
  - Each such refusal carries the concept as the offended term.
  - Each such refusal carries the hypothesis the concept was collected in.
  - A case collecting the same unbacked concept in two hypotheses is answered with one refusal per hypothesis.
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
    digest: sha256:80676c92ef8286fcfba04996c1672bef02ef9ec1426f7baa9ec4b2a79ed95a3b
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
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
unresolved:
  - question: No node describes the capability registry as a construct this check reads — what it is keyed by, whether a concept's registration is looked up across a capability's versions given that a capability is identified by name and version, and how the knowledge context reaches it. The one published integration interface is the investigation-time call that answers one concept about one subject rather than a lookup of registrations, and the integration context names the registry only as where the read-only nature is enforced. The objective's no-registered-capability and criterion five's every registered capability it finds both rest on this.
waived:
  - gap: definition/integration/capability#attributes.timeout.unit
    why: Criterion five has the check read that a timeout is declared and criterion six has it invoke nothing, so no criterion compares, converts or elapses the value, and a unit changes no refusal this task produces.
  - gap: lifecycle/knowledge/case-publication#rejections
    why: The gap names the refusals of the publish trigger beyond the contract checks, which is who approves a publication, and this task delivers exactly one contract check. Criterion eight claims only that such a case is not refused by this rule, never that it publishes, so an unknown approval refusal neither adds nor removes anything this task decides.
  - gap: lifecycle/knowledge/case-publication#transitions.published.publish
    why: This check attaches to the publish trigger the lifecycle does declare, from draft to published. How a further version begins from a published one is absent from the base as a whole, so no construct this task builds sits on that path.
---
## What it is

One check that reads the capability registry through the declared port and produces refusals through the same refusal shape as every other check.
It asks one thing of each collected concept, that a capability is registered for it.
The output schema and the timeout are read rather than checked for presence, because the base holds a registered capability as declaring both.
It is reached from publishing rather than from reading or editing a case.

## Notes

No criterion here asks whether a registered capability is read-only, declares an output schema or declares a timeout, because the base holds that a capability lacking any of the three is never registered; criterion one is what carries all three.
Criterion six keeps the check a reading of declarations rather than a call to the capability.
UNDERDETERMINED, from the binding — no criterion states that this check runs over a case an earlier check has already refused, which `rule/knowledge/a-validation-answers-with-every-refusal` requires of every check a validation carries.
UNDERDETERMINED passes — publication runs its checks in sequence and stops at the first that refuses, so this check never runs over a case another check already refused.
UNDERDETERMINED, from the binding — no criterion states what this check does over a case that declares no hypothesis, which the same rule requires a check to walk safely and refuse nothing over, using this exact example.
UNDERDETERMINED passes — the check walks the case's hypotheses assuming the declared minimum of one and raises over a case that declares none.
UNDERDETERMINED, from the binding — the statement of `rule/knowledge/every-collected-concept-has-a-read-only-capability` conditions on a capability declaring an output schema and a timeout, and no criterion says what happens when a registered capability declares neither.
UNDERDETERMINED passes — the check finds the registered capability, reads its output schema and timeout, ignores that either is absent or empty, and refuses only where no capability is registered at all.
UNDERDETERMINED, from the binding — `rule/knowledge/two-positions-are-two-refusals` counts a position as the hypothesis and the offended term together, and criterion four covers only the same unbacked concept in two hypotheses while no criterion covers two unbacked concepts collected in one hypothesis.
UNDERDETERMINED passes — one refusal per hypothesis carrying a single one of that hypothesis's unbacked concepts as the offended term.
REMAINDER, from the binding — the whole statement of `rule/integration/a-capability-is-read-only`, and the read-only qualifier in the bound contract rule, reach no criterion of this task, because criterion eight's registered capability is equivalent to the invariant only through the registry having refused every other nature.
REMAINDER belongs — registering a capability in the integration context, which this plan does not build.
REMAINDER, from the binding — the second clause of `rule/knowledge/a-validation-answers-with-every-refusal` reaches this task only for this rule's own refusals, and assembling one answer carrying every check's refusals is answered by no criterion here.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles the validation's answer over all of its checks.
From the binding — `definition/knowledge/case` and `rule/knowledge/the-content-hash-covers-the-whole-file` sit in this epic's covers and no criterion of this task reaches them, since a publication check refuses the case under edit and the version and hash publication assigns are the translation rather than this check.
From the binding — deciding that a collected concept has a registered capability needs a comparison between the concept a hypothesis collects by identity and the capability's own concept attribute, and the two facts that decide it are that a concept's identity is its name and that the comparison is character for character.
Decision, beyond the covers — stand: `definition/glossary/concept` and `rule/glossary/a-lookup-matches-a-published-name-exactly` are `epic/published-language-ports`' claim, bound by `task/published-language-ports/capability-read-port`, which this task depends on and reads the registry through, so the comparison is made once at the port rather than restated at each consumer.
Decision, beyond the covers — stand: `context/integration` and `interface/integration/capability-query` are claimed by `epic/published-language-ports` and by no epic of this plan respectively, because the registry seam is declared at the port and invoking a capability belongs to the investigation act.

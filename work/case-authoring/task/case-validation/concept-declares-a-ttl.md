---
title: Every collected concept declares a ttl
summary: The check that each concept a case collects declares a ttl in the glossary.
rationale: The decomposition cut one task per rule the base registers, so each check can be shown met on its own.
sources:
  - intake/scope.md
objective: A validation refuses a case that collects a concept whose glossary entry declares no ttl.
criteria:
  - A case collecting a concept whose glossary entry declares no ttl is answered with a refusal naming this rule.
  - That refusal names the position where the concept was collected.
  - A case every collected concept of which declares a ttl is not refused by this rule.
depends_on:
  - task/case-validation/refusal-and-accumulation
  - task/published-language-ports/glossary-read-port
nodes:
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: rule/glossary/a-lookup-matches-a-published-name-exactly
    digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
  - node: rule/knowledge/every-collected-concept-declares-a-ttl
    digest: sha256:31b0203249035edc85ea0986a0544ca512bc7aa238d2732bdc567f85a6795e44
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: This task refuses only where a glossary entry declares no ttl at all; a presence check never reads the unit the integer is expressed in, and no criterion of this task compares a ttl to a duration, to a freshness, or to another ttl.
---
## What it is

One check that reads the concept's glossary entry through the declared port.

## Notes

UNDERDETERMINED, from the binding — criterion one says a refusal and criterion two says that refusal, so as written both are satisfied by one refusal per case, while `rule/knowledge/two-positions-are-two-refusals` requires one refusal per position and `rule/knowledge/a-validation-answers-with-every-refusal` requires the count answered to equal the count that refused.
UNDERDETERMINED passes — a validation that answers one refusal, naming one hypothesis, for a case in which two hypotheses each collect a concept whose glossary entry declares no ttl.
REMAINDER, from the binding — the first clause of `rule/knowledge/a-validation-answers-with-every-refusal`, that a validation runs every check whatever an earlier one decided, reaches no criterion of this task, which delivers one check rather than the validation that carries them.
REMAINDER belongs — `task/case-validation/refusal-and-accumulation`, which assembles the validation and answers with every refusal its checks produced.
From the binding — no candidate says what this check answers for a concept a case collects that the glossary does not publish at all, since the bound rule reads literally as refusing it while the validation rule requires each check to be safe over a malformed case and leave that fault to the check that owns it.
From the binding — `rule/knowledge/case-terms-exist-in-the-glossary` is the refusal that owns absence and this binding did not bind it, so the two readings are left as the seam between the two checks.
From the binding — the bound rule states every concept a case names while the criteria say collects, and the binding read the two as coextensive because `definition/knowledge/draft-case` gives a case no attribute naming a concept outside a hypothesis's collects list.
From the binding — nothing in the candidates says when this validation runs, and `lifecycle/knowledge/case-publication`, which stages it, sits outside the candidates.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` is `epic/case-publication`'s claim and is bound by `task/case-publication/publish-transition`, which is where every check is reached from; this task delivers a check and not a trigger.
From the binding — `definition/glossary/concept` types the ttl as a required integer and no candidate states a lower bound, so an entry declaring a ttl of zero or a negative integer counts as declaring one and this rule will not refuse it, whether a non-positive tolerance is a declared tolerance being a fact the base does not hold.

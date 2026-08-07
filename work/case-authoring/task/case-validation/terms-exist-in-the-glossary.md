---
title: Every term a case names exists in the glossary
summary: The check that every subject type, concept, outcome, action and recipient a case names matches a published name in the glossary exactly.
rationale: The decomposition kept the five vocabularies in one task because the base registers them as one rule over the whole of what a case names, and splitting them would produce five tasks that change together and refuse through the same rule. The criteria now name where in a case each kind of term sits and require an exact match, after binders found that a check comparing names loosely satisfied the criteria as first written.
sources:
  - intake/scope.md
objective: A validation refuses a case that names a subject type, a concept, an outcome, an action or a recipient that does not match a published glossary name exactly.
criteria:
  - A case declaring a subject type the glossary does not register is answered with a refusal naming this rule.
  - A case whose hypothesis collects a concept the glossary does not register is answered with a refusal naming this rule.
  - A case whose resolution names an outcome the glossary does not register is answered with a refusal naming this rule.
  - A case whose referral names an action the glossary does not register is answered with a refusal naming this rule.
  - A case whose referral names a recipient the glossary does not register is answered with a refusal naming this rule.
  - A term differing from a published name only in letter case is answered with a refusal naming this rule.
  - A term differing from a published name only in surrounding whitespace is answered with a refusal naming this rule.
  - Each such refusal carries the offended term.
  - Each such refusal carries the hypothesis the term was named in, where the term was named inside a hypothesis.
  - A case every term of which matches a published name exactly is not refused by this rule.
depends_on:
  - task/case-validation/refusal-and-accumulation
  - task/published-language-ports/glossary-read-port
nodes:
  - node: definition/glossary/subject-type
    digest: sha256:a2b480065c98dc6b15f228f1e05fb84e2729cd075f9c14579970db5efe45bb89
  - node: definition/glossary/concept
    digest: sha256:078ee8a3f41d7cbe9cfc248e92b98a3460df2c3249b2a945466a40ad02cca3b7
  - node: definition/glossary/outcome
    digest: sha256:40fad9d974f611796cc3974eeb6b311ac0ef6c6de39c5615f3eba4681eedaf2d
  - node: definition/glossary/action
    digest: sha256:f77670004b9b0aa3d01b7010e239c57c98609cb837b6f7fb64a11d51b85b43cb
  - node: definition/glossary/recipient
    digest: sha256:a5bc8e2e81ed13dfdf8b8ceabffab526153b6380b623c1cec46bc50d5e3e1654
  - node: definition/knowledge/draft-case
    digest: sha256:d462aa67ef753d09497e314fa00d0d9b5279bf0c5cea0063c6dd12a2e1bdcced
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: definition/knowledge/refusal
    digest: sha256:d0458e6eb99c1d11d6255524ceb9ca0f756d02c24001130643a58a71f16ac2d2
  - node: rule/knowledge/case-terms-exist-in-the-glossary
    digest: sha256:4f3ff8e59ed4e0d1bc5808b7cc98a98d065e094650e493032a8aa309cdc376a1
  - node: rule/glossary/a-lookup-matches-a-published-name-exactly
    digest: sha256:2ea8ba89149becd1179fe9623d09227d5dafbcdb1534a29a57f1f9951b2dbbc5
  - node: rule/knowledge/two-positions-are-two-refusals
    digest: sha256:8b64fd982e3ecc3ff92302f478f813f6215204358fc9947fc720f499819b15d3
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    digest: sha256:889848c729ee77b4fd4e51b6a436b0080eeaf208532749a45126011704fe21fa
unresolved:
  - question: No bound node states what the text a refusal from this rule carries says. definition/knowledge/refusal makes the text required and states only that it is written for the curator, so a delivery must write curator-facing words the base does not hold, which is exactly the sentence a reviewer would later read as a decision the business made.
  - question: No bound node says how a refusal locates a term this rule offends when the term sits in one of the case's two fallback resolutions rather than in a hypothesis. Both fallbacks are embedded resolutions and a refusal's position is the hypothesis name and the offended term, both identical for the two, so a case naming the same unregistered outcome in both produces two refusals the construct cannot tell apart while the two-positions rule requires one naming each position.
waived:
  - gap: definition/glossary/subject-type#attributes.name.values
    why: This check decides membership by looking the term up in the published glossary, never against a list the base enumerates. Criterion one turns on the lookup answering not-published, so which subject types are published is data at validation time and no member of the vocabulary has to be named to build or to falsify the check.
  - gap: definition/glossary/action#attributes.name.values
    why: Criterion four is decided by the lookup rather than by any named action, and the published set is what the glossary holds when a case is validated.
  - gap: definition/glossary/recipient#attributes.name.values
    why: Criterion five is decided by the lookup rather than by any named recipient, and the published set is what the glossary holds when a case is validated.
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: The node states an outcome is contributed by each confirmable hypothesis and then registered, so the vocabulary grows with the cases and this check must read the registry rather than any enumeration. Criterion three is decided by the lookup, and the two outcomes of non-conclusion the node does name are enough to exercise criterion ten.
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: This task never reads a concept's ttl. Whether a collected concept declares one, and in what unit, is what the ttl rule decides; criterion two asks only whether the concept's name is published.
---
## What it is

One check that reads the glossary through the declared port and never reaches a store.
It covers every term a case names, wherever the case names it — the subject type on the case, the concepts on a hypothesis, and the outcome, action and recipient a resolution and its referral carry.
It refuses a near miss, because a lookup matches a published name exactly.

## Notes

The terms a fallback names are reached the same way, since a fallback carries a resolution like any other.
Whether a registered concept declares a ttl and whether it accepts the case's subject type are two further checks, cut as their own tasks.
UNDERDETERMINED, from the binding — no criterion states how many refusals a case with more than one offending term is answered with, while `rule/knowledge/two-positions-are-two-refusals` requires one per position and each of criteria one through seven is satisfied by a case carrying a single fault.
UNDERDETERMINED passes — a check that answers exactly one refusal for a case with two unregistered terms, stopping at the first offending term or listing both in one refusal.
UNDERDETERMINED, from the binding — `rule/knowledge/a-validation-answers-with-every-refusal` states a check must be safe over a malformed case, and no criterion of this task exercises a case that does not hold together.
UNDERDETERMINED passes — a term check that raises, or returns nothing at all, over a case whose hypotheses list is empty or whose fallback resolution is missing.
UNDERDETERMINED, from the binding — the same rule requires every check to run whatever an earlier check decided, and no criterion states that this check runs over a case another check has already refused.
UNDERDETERMINED passes — a validation that skips the term check once another check has already refused the case.
UNDERDETERMINED, from the binding — no criterion says which of the base's two models of a case this validation reads, and only `definition/knowledge/draft-case` settles it.
UNDERDETERMINED passes — a check that reads the published value, version and content hash included, rather than the case under edit a curator is still writing.
REMAINDER, from the binding — the clauses of `definition/knowledge/draft-case` about publication reach no criterion of this task, which delivers the check and not its invocation.
REMAINDER belongs — `task/case-publication/publish-transition`, over `lifecycle/knowledge/case-publication` and `definition/knowledge/case`.
Decision, beyond the covers — stand: `lifecycle/knowledge/case-publication` and `definition/knowledge/case` are `epic/case-publication`'s claim, and this epic delivers checks over the case a curator can still fix.
REMAINDER, from the binding — `definition/glossary/concept` carries the clause that a concept named by a case with no registered read-only capability makes the case unpublishable, which reaches no criterion here.
REMAINDER belongs — `task/case-publication/capability-contract-check`, which binds `rule/knowledge/every-collected-concept-has-a-read-only-capability`.
Decision, beyond the covers — stand: `rule/knowledge/every-collected-concept-has-a-read-only-capability` is `epic/case-publication`'s claim, because the base registers that contract as verified when publishing rather than when validating.
From the binding — five candidates are left unbound because they govern other checks of the same validation, and this epic reconciles them through its sibling tasks.

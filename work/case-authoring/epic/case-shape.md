---
title: The shape of a case
summary: What a curator writes — a case, its hypotheses in the order it declares them, the resolution and referral each one states, and the two fallbacks — read out of the one file that holds it, or answered with a read failure.
rationale: The scope names the initiative without cutting it, so the decomposition separated the declared shape of a case from the checks over it and from publication, because the shape changes when the base changes what a case declares, a check changes when a rule changes, and publication changes when the transition changes. The claim grew to hold what commit a50f278 added about the file itself — that a case is one file, that its frontmatter is the boundary of what it declares, and what the reading answers when that frontmatter does not parse — because the reading task could not be stated without them and carried all three as questions the base did not hold.
sources:
  - intake/scope.md
  - intake/scope-2026-08-07.md
covers:
  - context/knowledge
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/knowledge/read-failure
  - definition/knowledge/referral
  - definition/knowledge/resolution
  - rule/knowledge/a-case-is-one-file
  - rule/knowledge/an-unreadable-case-is-not-validated
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/knowledge/the-body-does-not-change-what-is-collected
  - rule/knowledge/the-fallback-follows-what-the-collection-returned
  - rule/knowledge/the-frontmatter-holds-everything-the-case-declares
  - rule/knowledge/what-the-curator-reads-is-written-in-portuguese
uncovered:
  - node: rule/knowledge/the-fallback-follows-what-the-collection-returned
    why: The rule states which fallback a case answers with at resolve time, given what the evidence carried, and it constrains the published case and the investigation's evidence. This plan builds neither the resolve-time selection nor any evidence, so no task under this epic binds it; the epic claims it because a case under edit declares both fallbacks, and declares it here so the omission is stated rather than silent.
---
## What it is

Everything a case declares, as a shape source can hold and one file can be read into.
It holds the case under edit rather than the published case, because the version and the hash belong to publication.
It holds the resolution-and-referral pair once, because a case states that pair in more than one place.
It holds the declaration order of the hypotheses, because the base registers that order as carrying meaning.
It holds what the reading answers when the file's frontmatter does not parse, because that answer is produced by the reading and by nothing else.

## Notes

The claim grew by five nodes, all of them added by commit a50f278.
`rule/knowledge/a-case-is-one-file` and `rule/knowledge/the-frontmatter-holds-everything-the-case-declares` grew it because the reading task carried as an unanswered question what a case file is and where the boundary between its structured part and its prose sits, and the base now states both.
`definition/knowledge/read-failure`, `rule/knowledge/an-unreadable-case-is-not-validated` and `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` grew it because the same task carried as an unanswered question what a file that does not parse answers with, and the base now states the construct, that no check runs over it, and the language its text is written in.
`rule/knowledge/a-case-is-one-file` and `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` sit in this claim and in `epic/case-publication`'s, and the two reconcile independently.
The scope names "case-validator" and "published-case", and the base registers `context/knowledge`; this epic and the three beside it are cut against what the base holds.
The task that builds the project's manifest, compiler configuration and lint configuration sits under this epic, because an epic claims base nodes and no epic can be cut for a task that answers to none.
The investigation context is reached in one hop from these nodes and this plan builds none of it.

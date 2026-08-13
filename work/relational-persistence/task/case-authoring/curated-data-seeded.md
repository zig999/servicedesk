---
title: The curated vocabularies, registrations and case are in the database
summary: The seed that carries the fixture-era glossary, capability registry and one curated case version into the database, the case entering through the authoring command.
rationale: The inventory names the curated fixture data as something to carry over rather than re-invent, and the scope leaves how it arrives open; it is cut as its own task because data being present is one falsifiable outcome, separate from the command that admits it.
sources:
  - intake/scope.md
depends_on:
  - task/case-authoring/author-case-version-command
objective: The database holds the vocabularies, the capability registrations and the one curated case version the system needs to answer a diagnosis.
criteria:
  - The glossary holds the two non-conclusion outcomes, inconclusive-no-data and inconclusive-hypotheses-exhausted, before any case version is authored against it.
  - The glossary holds every subject type, subject attribute, outcome, action and recipient the curated case names.
  - The glossary holds every concept the curated case collects, each with the subject types it accepts and its ttl.
  - The registry holds one read-only capability, with its declared contract, for every concept the curated case collects.
  - The curated case version enters through the authoring command and by no other write.
  - The seeded case version reads back whole and holds against every validator rule at that read.
implements:
  - contracts/knowledge/author-case-version
  - contracts/knowledge/vocabulary-terms
  - contracts/knowledge/capability-check
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
---

## What it is

The data a first diagnosis needs to exist before it can run.
Only a subset of the vocabularies has to precede the first case — its recipients, its actions and the two outcomes of non-conclusion — and the rest is what the curated case itself contributes.

## Notes

The inventory names src/src/fixtures as holding one case version, five glossary vocabularies, the capability registry and the canned observations.
The inventory reports the fixture case at src/src/fixtures/case/intermittent-connection-outage/1.json is the one case document in the tree and was authored by hand.
UNDERDETERMINED, from the specification — criterion 2 names subject attribute among the terms to seed, but no candidate states that a case names a subject attribute at all; a seed writing none would pass criterion 2 vacuously while leaving the glossary unable to answer the subject a diagnosis request assembles, and a test must exclude that gap.
UNDERDETERMINED, from the specification — criterion 4's "declared contract" is stated in full only by domain/integration/capability, outside this task's implements; a seed writing a registration carrying only an output schema and a timeout would pass criterion 4 as written.
Decision, beyond the covers — stand: domain/integration/capability is named only to identify the gap the test must exclude; it is answered by task/relational-stores/capability-store, not by this seed's own criteria.
UNDERDETERMINED, from the specification — criterion 6's "whole" is not defined by any candidate here; constraints/a-case-is-read-whole and contracts/knowledge/case-query, which state it, are outside this task's implements, so a read-back bringing only the case root and its hypotheses would pass criterion 6 as written.
Decision, beyond the covers — stand: constraints/a-case-is-read-whole and contracts/knowledge/case-query are named only to identify the gap the test must exclude; both are answered elsewhere in this plan, not by this seed's own criteria.
REMAINDER, from the specification — the defaulting clause of rules/knowledge/a-collected-concept-declares-a-ttl reaches no criterion here, since criterion 3 requires every seeded concept to state its ttl; it belongs to the glossary's own concept-registration path.
REMAINDER, from the specification — the second clause of rules/knowledge/validation-runs-at-every-read, that a replay reads without revalidation, reaches no criterion of this task, which validates only the freshly seeded version; it belongs to the investigation act that replays a pinned version.
REMAINDER, from the specification — rules/knowledge/the-contract-check-reads-the-current-registration is left out: its whole statement is a property of the check's behaviour, which no criterion here exercises since the seed only supplies registrations that stand at the authoring read; it belongs to the case validator's capability check.
ADVISORY, from the specification — scenarios/knowledge/a-subject-mismatch-refuses-the-case and contracts/system/case-authoring are left out: neither is exercised by criteria 5 and 6, which seed a case that validates rather than one that is refused.
ADVISORY, from the specification — no candidate states the content of the curated case or the fixture-era glossary; the seeded terms answer to the plan's inventory of the existing fixtures rather than to any specification node, and the implementation record should say where they came from.

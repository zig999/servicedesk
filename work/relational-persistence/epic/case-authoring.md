---
title: The curator authors against the database
summary: The command contracts/knowledge/author-case-version publishes, with every validator rule answering at that write, and the curated vocabularies, registrations and case the database has to hold for a case to validate at all.
rationale: The scope states the curator stops authoring a file and authors through the command, and the inventory reports the tree holds no authoring entry point of any kind, so this is new work rather than a change to an existing one; the seed is cut beside it because curated data entering the database is one outcome, demonstrable on its own, and the case among it enters through the command this epic builds.
sources:
  - intake/scope.md
covers:
  - contracts/knowledge/author-case-version
  - contracts/system/case-authoring
  - contracts/knowledge/vocabulary-terms
  - contracts/knowledge/capability-check
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - rules/glossary/a-recipient-is-a-role
  - rules/glossary/an-action-names-what-its-recipient-does
  - rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis
  - scenarios/knowledge/a-subject-mismatch-refuses-the-case
uncovered:
  - node: rules/glossary/a-recipient-is-a-role
    why: Whether a recipient names an operational role or a person is decided by whoever curates the vocabulary, and nothing in this plan can tell one from the other by reading a stored term.
  - node: rules/glossary/an-action-names-what-its-recipient-does
    why: Whether a new action names a changed act or only a changed motive is a curation judgment over two terms' meanings, and no task here decides it.
  - node: rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis
    why: The outcome vocabulary is contributed by curation as cases are written, and this plan authors one curated case rather than deciding which outcomes the vocabulary should hold.
---

## What it is

One entrance for the curator, where a case version is submitted whole and every rule answers before anything is stored.
The coherence the validators already hold a case to — its terms against the glossary, its concepts against the subject type and against the current registrations — runs at this write and at each read.
Beside it, the curated data the fixtures carried moves into the database, so a case has a glossary and a registry to validate against.

## Notes

The structural validator at src/src/case/parse-case-document.ts and the coherence validator at src/src/case/validate-case-coherence.ts are reused rather than rewritten, as the inventory requires.
The inventory reports the curated fixture data under src/src/fixtures — one case version, five glossary vocabularies, the capability registry and the canned observations — which the seed carries over rather than re-invents.
The specification names this command and the payload it carries and names no transport for it.

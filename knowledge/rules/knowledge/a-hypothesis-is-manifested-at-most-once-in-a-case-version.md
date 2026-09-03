---
type: invariant
statement: "A case version's manifest holds at most one entry for any one hypothesis: no two entries of one case version reference revisions of the same hypothesis."
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

A case version composes which hypotheses it investigates and, for each one, exactly which revision of that hypothesis's content it uses.
A second entry for a hypothesis the manifest already holds would place one claim at two positions at once — `a-hypothesis-position-is-unique-within-its-case` makes those two positions different by construction — and would adopt two revisions of one content inside one version, so the declared precedence would reach the same claim twice and nothing would say which revision the version actually uses.

The derivations the manifest already feeds read each hypothesis once: `requires-evaluation-of-names-exactly-the-manifested-hypotheses` contributes the name of the hypothesis every entry's revision belongs to, and `one-evaluation-per-required-hypothesis` holds an investigation to exactly one evaluation for every hypothesis that list requires — a name arriving there twice has no reading that is not a duplicate or a name silently dropped.
The rules that read a draft's manifest for one hypothesis read it the same way: `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` compares the revision a revise wrote against the revision that draft version's entry for the hypothesis pins, and knows exactly two states of a manifest with respect to a hypothesis — one entry, or none.
`a-new-drafts-manifest-is-copied-from-an-existing-version` copies entry for entry, so a draft starts holding this exactly as the version it continues from did.

This rule states what a manifest may hold, and nothing about what `place-hypothesis` then does with a request naming a hypothesis the manifest already holds.

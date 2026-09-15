---
title: A drafted capability schema applied to the local edit
summary: What a stated draft may do to the Input schema and Output schema fields of the capability authoring surface -- nothing at all on arrival, exactly one field at the operator's own act of applying -- and the staleness marking a draft carries once the link or the chosen operation moves away from what it was generated for.
rationale: I separated the form's write path from the helper's own panel because the inventory records three distinct risks concentrated there -- save-gating, the detail screen's dirty baseline, and the minify-at-submit contract -- all of which turn on the onChange path and none of which turn on how the request is made or stated.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
covers:
- rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
- rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
- rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes
- scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale
---

## What it is

The one seam where a drafted schema crosses into the capability form: the Input schema and Output schema fields, each written only by the operator's own act of applying, each independently, and never over an unsubmitted edit without confirmation.
It also holds the marking that tells an operator a draft still standing was generated for a link or an operation they have since moved away from.

## Notes

The inventory records that CapabilityFormFields is rendered by both the create screen and the detail screen, so the work in this epic is observed by both screens' own suites together.
Several specification nodes touch the capability this feature edits but are reused rather than redelivered here, so this epic's `covers` does not claim them: domain/integration/capability, domain/integration/capability-nature and domain/glossary/concept (the capability's own attributes and background, already delivered — this plan adds no attribute and changes no registration, only who may write two existing fields); domain/integration/connector-configuration-draft (the sibling draft whose frontend the scope names as the precedent to mirror — surveyed and reused, never rebuilt here); rules/integration/a-capability-declares-its-contract, rules/integration/a-capability-declares-well-formed-schemas, rules/integration/a-capability-input-schema-holds-a-well-formed-object and rules/integration/a-capability-is-read-only (registration refusals the registry already delivers; applying a draft registers nothing and the applied text is written through the field's existing validity contract, submitted or not by the operator's own later act); and rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them and rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it (the detail screen's own reading and statement of a registered capability, already delivered and untouched by a helper standing beneath it).

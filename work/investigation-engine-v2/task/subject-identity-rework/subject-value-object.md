---
title: Subject as type plus attribute-value set
summary: The canonical Subject domain type, replacing the bare-id shape wherever it is declared.
objective: domain/investigation/subject is represented in code as a governed subject type paired with a non-empty set of attribute-value pairs, replacing every bare-id representation of a subject.
criteria:
  - A Subject value requires a subject type drawn from domain/glossary/subject-type and a set of subject-attribute-value pairs.
  - Constructing a Subject with an empty attribute-value set is refused, per a-subject-carries-at-least-one-attribute.
  - One subject-attribute-value pair carries exactly one governed attribute name and one string value.
  - The inline Subject type previously left duplicated in observation-source.port.ts is replaced by this canonical module rather than kept as a second declaration.
rationale: The scope states the subject's new shape once; giving the type itself its own task, ahead of every module that builds, ports or keys off it, is how the one-seam rule is kept — a later task changes a consumer, never the type and a consumer together.
implements:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-attribute
  - domain/glossary/subject-type
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - contracts/investigation/observation-source
sources:
  - intake/scope.md
---

## What it is

The Subject value object rebuilt as subject type plus a set of subject-attribute-value pairs.
The removal of the inline duplicate Subject shape the prior task deliberately left in observation-source.port.ts.

## Notes

UNDERDETERMINED, from the specification — rules/investigation/a-subject-attribute-is-drawn-from-the-glossary constrains exactly the types this task builds, but none of this task's four criteria reach its clause that every named attribute exists in the glossary: criterion 3 only requires the pair to be typed as one governed attribute name plus one string value, a structural requirement that does not check the name against the glossary's actual current content. Passes: a SubjectAttributeValue constructed with an attribute name that is not, and has never been, registered as a domain/glossary/subject-attribute term — this satisfies criteria 1 through 4 exactly as written, while rules/investigation/a-subject-attribute-is-drawn-from-the-glossary refuses it.
REMAINDER, from the specification — rules/investigation/an-investigation-is-idempotent-within-a-window, and its two scenarios a-repeated-request-returns-the-same-investigation and no-ticket-reference-never-repeats, constrain the repeat-request key, not anything this task builds: this task's criteria produce only the Subject value type and edit observation-source.port.ts, never a built aggregate or a key. Belongs to task/subject-identity-rework/idempotency-key-subject-attributes for the key-computation piece and epic/diagnose-entry-point's window-dedup task for the return/join/start-fresh piece.
ADVISORY, from the specification — contracts/integration/concept-observation, contracts/investigation/glossary-source and constraints/the-domain-depends-on-no-infrastructure neighbor this task's edits to observation-source.port.ts and subject.ts without any of the four stated criteria addressing them; the domain-purity constraint is already enforced automatically by the existing directory-wide observation-source-modules.spec.ts fitness test.

---
title: Backend corrections
summary: "Four fixes triaged from the subject-attribute-glossary-removal-backend review: one reachability bug against a decided rule, one removal residue, two pre-existing defects the review surfaced."
rationale: Cut as one epic across four small, independent fixes because none needs its own decomposition — each is a single-file (or two-file) correction the review already fully diagnosed, and splitting them into separate epics would add ceremony without separating any real concern.
sources:
- intake/scope.md
covers:
- rules/investigation/a-subject-carries-at-least-one-attribute
- rules/investigation/no-stage-aborts-on-its-deadline
---

## What it is
Three of the four tasks touch code no specification node governs at all (a leftover type alias, an unmapped error class, a wrong variable read into an error's own field) — each is a defect against the code's own prior behavior, not against a domain fact. The fourth makes an already-decided HTTP refusal reachable where a stricter wire-level schema was silently pre-empting it.

## Notes
None.

---
title: The investigation stops holding subject attribute names to the glossary
summary: Removal of the glossary name check from the two simulate controllers and from investigation building,
  leaving a subject attribute name free text and the diagnose door's own coverage refusal the only check
  a subject is held to.
rationale: 'Cut as its own epic rather than merged with the vocabulary removal because the two answer
  to different halves of the impact set: this one decides what a subject attribute name is and what may
  refuse a call over it, and the other decides what the published language holds. The two tasks under
  it are the check''s consumers and the check itself, split because the exported refuseAttributesNotInGlossary
  is an interface with call sites outside its own file.'
sources:
- work/subject-attribute-glossary-removal-backend/intake/scope.md
covers:
- domain/investigation/subject-attribute-value
- domain/knowledge/case-input-requirement
- contracts/investigation/glossary-source
- rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
- rules/investigation/a-subject-holds-one-value-per-attribute
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/investigation/a-subject-carries-at-least-one-attribute
uncovered:
- node: domain/knowledge/case-input-requirement
  why: The derived read, refuseSubjectMissingRequiredCaseInputs, SubjectDoesNotCoverCaseInputsError and
    ICaseInputRequirementsQuery are all already in the tree and already wired into diagnose.controller.ts;
    the inventory names them as must-not-duplicate, so no task here builds any part of this entry — the
    tasks only stop a second, glossary-based check from standing beside it.
- node: rules/investigation/a-subject-holds-one-value-per-attribute
  why: The first-recorded-value-wins dedup is traced today to the frontend composer alone, and the scope's
    known impact names no backend file for it; the removal touches nothing that assembles attribute-values,
    so this plan leaves it where it stands.
- node: rules/investigation/a-composed-subject-presents-every-case-input-requirement
  why: It states what the interface assembling a subject presents, which the scope assigns to the separately
    delivered frontend increment; no backend file in the known impact presents an input.
- node: rules/investigation/a-composed-subjects-interface-discloses-an-empty-requirement-set
  why: The same — it states a disclosure the composing interface makes, and the scope puts the frontend
    out of this increment.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  why: The test-connector path reads its attribute names from the registered configuration's own placeholders
    and never called the glossary check, so the removal leaves that path byte-for-byte unchanged; it is
    in the impact set because it states the attribute names it assembles are read rather than governed,
    which this plan does not have to deliver.
---

## What it is
The half of the removal that lives in the investigation: the glossary lookup that stood between a subject's attribute names and any diagnose, simulate-case or simulate-hypothesis call.
It claims the nodes deciding what a subject attribute name is, what the investigation reads from the published language, and which refusals a subject may still meet.

## Notes
Both tasks here must land before the vocabulary itself can be removed, because the check names the vocabulary by a typed literal.
The pipeline-level glossary dependency threaded through investigation-pipeline, simulate-hypothesis-pipeline and the three production factories is a different dependency from the one removed here and stays.

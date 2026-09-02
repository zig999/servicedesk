---
title: The schema refuses an alteration only for a released revision
summary: The migration that replaces the unconditional refusal of any change to a hypothesis revision with one conditioned on a released case version referencing it.
rationale: The survey found the stored refusal is unconditional, so an overwrite issued by any code above it would be silently discarded; this is cut as its own task because it changes the database's own rule, which has a different reason to change than any code that writes through it, and because it is demonstrable against the database alone.
sources:
- intake/scope.md
objective: The stored schema leaves an alteration of a hypothesis revision unrefused exactly when no case version in released state references that revision, and refuses it when one does.
criteria:
- Applying every migration script in its numbered order to an empty database produces the schema the tree expects, with no step performed by hand.
- An update to a hypothesis revision that no case version in released state references is not refused by the schema's own rule over that relation.
- An update to a hypothesis revision that a case version in released state references through its manifest leaves that revision's stored content exactly as it was.
- An update to a hypothesis revision that only case versions in draft state reference is not refused by the schema's own rule over that relation.
implements:
- constraints/the-schema-replays-from-its-scripts
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- domain/knowledge/hypothesis-revision
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
---

## What it is
A migration replacing the relation's unconditional no-update rule with one that reads whether a released case version's manifest references the revision being altered.
The refusal it keeps is the one a released reference earns; the refusal it drops is the one that stood over every revision alike.

## Notes
The survey reports two existing rules in the schema already read the released state through the same manifest join, so the condition this task needs has a written shape to follow rather than one to invent.
UNDERDETERMINED, from the specification — rules/knowledge/a-released-hypothesis-revision-is-never-altered's statement now says an attempt to alter such a revision's content "is refused at the point of the attempt with an HTTP 409 response reporting a ReleasedHypothesisRevisionNotAlterableError, rather than being accepted and left with no effect", but criterion three asks only that the stored content be left unchanged, which a refusal and a silently dropped write satisfy identically; a migration that silently suppresses the write with a BEFORE UPDATE trigger, raising nothing, would pass every criterion here while the rule refuses exactly that. What is missing is that the schema raise a distinguishable error the layer above can surface as the HTTP 409 — the response shaping is the revise-hypothesis endpoint's, but the distinguishable error is this task's to raise and no criterion requires it.
REMAINDER, from the specification — the clauses of rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's statement that decide where a revise writes (into the hypothesis's own highest existing revision, in place, number unchanged; creating the next revision when a released case version references it; always creating revision 1 for a hypothesis holding none yet) reach no criterion of this task; only the rule's negative side (an update to a revision no released case version references is not refused) is held here. This belongs to the task implementing the revise-hypothesis operation published by contracts/knowledge/case-lifecycle, which also carries scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves and scenarios/knowledge/revising-a-released-revision-creates-the-next.

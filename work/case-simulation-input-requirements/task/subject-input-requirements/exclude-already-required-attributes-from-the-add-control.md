---
title: Offer only attributes the requirement set does not already name
summary: The "+ attribute" control's glossary Select, filtered against the attributes the pinned version's
  read already names.
rationale: Cut as its own task because this control changes for its own reason -- the requirement set
  is now what says an attribute is already present -- and because the filtering has to sit in this region
  rather than in the glossary hook other screens read unfiltered.
sources:
- work/case-simulation-input-requirements/intake/scope.md
objective: The curator's "+ attribute" control offers no subject attribute the pinned version's requirement
  set already names.
criteria:
- The attribute Select offers no attribute name the state's own requirement set already names.
- Every option the Select still offers is drawn from the glossary's subject-attribute vocabulary, never
  typed as free text.
- No attribute the requirement set already names can be added a second time through this control.
- useGlossaryVocabularyOptions still answers with the whole vocabulary for its other consumers.
- Where the requirement set already names every attribute the vocabulary holds, the control offers no
  option rather than offering one already named.
depends_on:
- task/subject-input-requirements/derive-subject-fields-from-input-requirements
implements:
- domain/knowledge/case-input-requirement
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
- rules/investigation/a-subject-holds-one-value-per-attribute
---

## What it is
The control that lets a curator add an attribute the version's requirements do not name, keeping exactly that purpose and losing the options that duplicate a field already on the screen.
The filtering happens where the requirement set is known, which is this region, not the vocabulary read.

## Notes
rules/investigation/a-subject-attribute-is-drawn-from-the-glossary is why the remaining options stay glossary-drawn rather than becoming free text once the list is filtered.
rules/investigation/a-subject-holds-one-value-per-attribute already decides what a subject carrying two values for one attribute holds, and this control ceases to be a way of reaching that case for a requirement-named attribute.
UNDERDETERMINED, from the specification -- every criterion scopes the filter to the requirement set alone, so nothing here excludes an attribute the composer already added through this same control; a passing implementation must not let the same non-requirement attribute be offered and added a second time, producing a duplicate rules/investigation/a-subject-holds-one-value-per-attribute would only silently drop.
REMAINDER, from the specification -- rules/investigation/a-composed-subject-presents-every-case-input-requirement's own presentation, required-flag and disclosure clauses reach no criterion of this task, which only filters a manual control's offer.
Belongs: the task that presents the requirement-derived attribute inputs, carries each requirement's required flag and discloses its asking capabilities.
REMAINDER, from the specification -- the same rule's opening clause, over the interface assembling the subject before a diagnose call, reaches no criterion of this task.
Belongs: the diagnose entry point's own subject-assembly interface.
REMAINDER, from the specification -- rules/investigation/a-subject-holds-one-value-per-attribute's own first-recorded-wins resolution reaches no criterion of this task for an attribute the requirement set already names -- this task keeps the control from ever offering one -- but the resolution still has to be held wherever the whole attribute-value set is assembled.
Belongs: the act that assembles a subject's whole attribute-value set before a diagnose, simulate-case or simulate-hypothesis call.
Advisory: criterion 4 ("useGlossaryVocabularyOptions still answers with the whole vocabulary for its other consumers") answers to no candidate node; it is a non-regression condition over an existing frontend hook rather than a specification fact.
Advisory: criteria 2 and 4 both rest on the glossary-vocabulary read and the case-input-requirements read, neither of which this task implements; if the delivery must be held to either, the epic's claim grew beyond what these criteria answer.

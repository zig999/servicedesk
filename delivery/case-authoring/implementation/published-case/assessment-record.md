---
title: "The assessment that carries a resolution, re-delivered against the re-bound task"
summary: "Confirms the existing assessment constructor and the shapes it reads back answer the task's unchanged criteria and its four re-bound nodes, with no source modified."
task: sha256:fadf5cf66837128b2f251c8f80701b6709a1320bdb1e3e7608ee26701c872d75
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/investigation/assessment.ts
    effect: "declares the Assessment value — one required embedded resolution, an optional determining hypothesis bound by name, a required text — and createAssessment, which freezes what it is handed, copies the resolution and its referral whole so readback survives later mutation of the argument, and refuses nothing."
  - path: src/knowledge/resolution.ts
    effect: "declares the Resolution shape — an outcome bound by identity and an embedded referral, read-only — and deliberately offers no way to build one, so a resolution is carried, never produced, here."
  - path: src/knowledge/referral.ts
    effect: "declares the Referral shape — the read-only pair of an action name and a recipient name — that a carried resolution embeds and the assessment's copy step reproduces."
  - path: src/knowledge/hypothesis.ts
    effect: "declares HypothesisName, the name a value binding a hypothesis by identity holds, which is what an assessment's determining-hypothesis slot carries."
  - path: src/glossary/outcome.ts
    effect: "declares OutcomeName, the identity a resolution binds its outcome by, with the vocabulary neither enumerated nor checked."
  - path: src/glossary/action.ts
    effect: "declares ActionName, the identity a referral binds its action by, with the vocabulary neither enumerated nor checked."
  - path: src/glossary/recipient.ts
    effect: "declares RecipientName, the identity a referral binds its recipient by, with the vocabulary neither enumerated nor checked."
criteria:
  - criterion: "An assessment reads back the resolution it was constructed with."
    met: true
    how: "createAssessment in src/investigation/assessment.ts copies the resolution whole — copyResolution and copyReferral rebuild the outcome, action and recipient into frozen objects — so the constructed value's resolution field holds exactly the parts handed in, even after the argument is mutated."
  - criterion: "An assessment carries exactly one resolution."
    met: true
    how: "the Assessment type declares a single required readonly resolution field and no other slot that could hold a second one, and createAssessment fills exactly that field."
  - criterion: "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
    met: true
    how: "determiningHypothesis is typed HypothesisName — the name src/knowledge/hypothesis.ts declares as the hypothesis's identity, unique within a case per the bound node — and createAssessment passes it through unchanged into the frozen value."
  - criterion: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
    met: true
    how: "determiningHypothesis is optional on the Assessment type, createAssessment has no branch that examines or refuses its absence, and the constructed value reads the field back as undefined with no sentinel."
  - criterion: "An assessment reads back the text it was constructed with."
    met: true
    how: "createAssessment passes text through unchanged into the frozen value it returns."
nodes:
  - node: definition/investigation/assessment
    encoded_at:
      - src/investigation/assessment.ts
    how: "the Assessment type is the node's three attributes — resolution embedded and required, determining_hypothesis optional and bound by identity as HypothesisName, text required — declared readonly and frozen on construction as a value object; the node's Rules on what the writing of the text receives reach no criterion here, the task's REMAINDER note placing them in the diagnose step this plan does not hold, and the open attributes.text.audience gap is waived on the task because this source carries the text without deciding its content."
  - node: definition/knowledge/resolution
    encoded_at:
      - src/knowledge/resolution.ts
    how: "the Resolution shape encodes the node's two attributes — outcome by identity, referral embedded — read-only and with no constructor, which is how the source honors the node's rule that a resolution is declared by the case and never produced during an investigation; src/investigation/assessment.ts carries one whole and copies it, originating nothing."
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/hypothesis.ts
    how: "only the node's identity is encoded — HypothesisName, the name that identifies a hypothesis and that two hypotheses of one case never share — because the assessment binds its determining hypothesis by-identity and so holds the name and nothing else; the node's remaining attributes describe the case's inline hypothesis shape, which this task never sees."
  - node: rule/investigation/the-outcome-comes-from-the-case
    how: "honored, not encoded — nothing in this source produces an outcome or a referral; createAssessment accepts a resolution assembled by its caller and reproduces its values verbatim, so the module cannot originate either, and the rule's guarantee that what is carried is what the case resolved is stated by the behaviour that reads the case and produces the assessment, which the task's notes place outside this task."
inferences:
  - inferred: "an assessment carrying no determining hypothesis represents absence as the optional field left undefined, with no sentinel value and no wrapper type."
    from: "the assessment node marks the attribute required false and no bound node states a representation for absence; the inventory records this representation as one a later consumer depends on."
  - inferred: "the pairing of a determining hypothesis with the kind of resolution beside it is not checked at construction — a hypothesis alongside any resolution, or none alongside any, constructs."
    from: "the task's UNDERDETERMINED binding note, which states criteria 3 and 4 test each attribute in isolation and a resolution carries no marker distinguishing fallback from hypothesis-borne, and the outcome rule assigning that guarantee to the behaviour that reads the case."
  - inferred: "reading back the resolution unchanged means the constructed value survives later mutation of the object handed in, so the resolution and its embedded referral are copied whole rather than shared."
    from: "criterion 1's phrase the resolution it was constructed with, which nothing narrows to reference identity, and the assessment node's statement that the assessment carries what the case resolved."
preserved:
  - "the Assessment type's shape and createAssessment's signature taking the value's own type, which the inventory lists under must_not_duplicate and names as a reuse point for task/published-case/outcome-resolution."
  - "the copy-on-construct readback — a resolution handed in and then mutated still reads back as constructed — which the existing spec file asserts and the inventory names as a consumer-facing behaviour."
  - "the representation of an absent determining hypothesis as undefined with no sentinel, which the inventory records task/published-case/outcome-resolution as depending on."
  - "the Resolution module's deliberate absence of any constructor, which encodes the bound resolution node's rule and which the inventory flags as a claim other tasks must not erode."
deferred:
  - what: "the full hypothesis shape — name, collects, confirms_when and its embedded resolution — has no encoding anywhere in src/."
    why: "this task binds a hypothesis only by the name an assessment carries; the inline hypothesis shape belongs to the case's structure, which other tasks of this plan hold."
---

## What it is

The confirmation, against the task as re-bound to four nodes, that the existing assessment construct — one resolution carried whole, an optional determining hypothesis by name, a text read back unchanged — already answers every criterion, with no source modified.

## Notes

This re-delivery read the four bound nodes, the inventory and the standard fresh and changed nothing: the newly bound outcome rule is honored by construction, since createAssessment produces no outcome or referral and only copies the resolution its caller assembled.
The absence of a determining hypothesis reads back as undefined with no sentinel, an inference the inventory records a later consumer depending on.
The pairing of a determining hypothesis with the kind of resolution beside it is not checked at construction, per the task's own UNDERDETERMINED note placing that guarantee with the behaviour that reads the case.

---
title: "The assessment that carries a resolution"
summary: "The assessment as the construct that names the determining hypothesis, carries the resolution reached and reads back the text it was written with."
rationale: "An earlier statement of the resolution behaviour spoke of what the answer carried without any construct carrying it, and what an assessment holds changes for what an investigation reports while the precedence reading changes for how a winner is chosen, so the construct is cut out and the behaviour that produces it depends on it; the tie between the assessment and the case that resolved it is deliberately not stated here, because this task is handed a resolution and never reads a case."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "An assessment is constructed carrying exactly one resolution and the hypothesis it names as determining, and every part it was constructed with reads back unchanged."
criteria:
  - "An assessment reads back the resolution it was constructed with."
  - "An assessment carries exactly one resolution."
  - "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
  - "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
  - "An assessment reads back the text it was constructed with."
nodes:
  - definition/investigation/assessment
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/knowledge/hypothesis
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/investigation/assessment#attributes.text.audience
    why: "The gap asks what an assessment may expose to the end customer; this task constructs the value and reads its text back unchanged, and nothing here presents it to anyone, so the exposure decision lands on the response path."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "The resolution binds its outcome by identity, so this task carries the outcome name it was constructed with and never enumerates or validates the vocabulary."
  - gap: definition/glossary/action#attributes.name.values
    why: "The referral binds its action by identity, so this task carries the action name it was constructed with and never enumerates or validates the vocabulary."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "The referral binds its recipient by identity, so this task carries the recipient name it was constructed with and never enumerates or validates the vocabulary."
---

## What it is

The construct an investigation's conclusion is carried in, holding the resolution reached and what determined it.
The naming of the determining hypothesis by the name unique within its case, so what decided the conclusion is readable from the conclusion.
The two shapes the base allows, one determined by a hypothesis and one not.

## Notes

This task builds the construct and nothing here chooses what goes in it, which is the behaviour that depends on this one.
That an assessment's outcome and referral are the ones the case resolved is stated by the behaviour that reads the case and produces the assessment, since this task never sees the case.
From the binding — neither clause of the rule that an outcome comes from the case is demonstrable by a construct that never sees a case, which is why the sibling that reads the case binds it.
From the binding — the assessment node also carries the writing-input rules, and no criterion here answers them because the text arrives already written.
From the binding — the assessment carries no case reference, so within this construct only the hypothesis name is read back and the scope in which that name is unique sits elsewhere.
The pin was restated deliberately rather than re-bound: the base moved by three nodes and this task binds none of them — the case under edit closed its own gap, the published case gained three, and the capability's output-schema gap kept its field name and changed only its why. The validator's totality check over every bound node's open gaps is what holds that judgment, and it refuses this task if the reading is wrong.

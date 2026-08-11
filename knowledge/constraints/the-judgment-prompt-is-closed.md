---
statement: A judgment prompt contains only one hypothesis's criterion, its own evidence, the field names declared in the output schema of each evidence item's own producing capability, and the pinned case's title and when_to_use, in a delimited data block, with no tool calling available to the model.
scope: investigation
fitness: Prompt assembly is a pure function of the hypothesis's criterion, its own evidence, the field names declared in each evidence item's own producing capability's output schema, and the pinned case's title and when_to_use, and the provider call grants no tools.
---

## Description

Without tool calling the model cannot be led to act, and the delimited block plus the fixed system rule keep a free-text field from leading it to judge wrongly — data is data, never instruction.
The case's title and when_to_use enter as situational context, so the model judges knowing which troubleshooting scenario it stands in; no other hypothesis's criterion and none of the subject's identifying attributes enter, and the block stays closed — only its permitted content grew by these two case facts.
rules/investigation/a-cited-field-exists-in-the-capability-output-schema demands a citation's field exist in its evidence's own producing capability's output schema, and a model never shown that schema has no way to satisfy it; the field names declared there are exactly the vocabulary that rule requires, entering per evidence item alongside its observation, still as data the model reads and never as an instruction — the schema's types, descriptions and any other content stay outside the block, since only the field name is what the citation rule holds a citation to.

---
statement: A judgment prompt contains only one hypothesis's criterion and its own evidence in a delimited data block, with no tool calling available to the model.
scope: investigation
fitness: Prompt assembly is a pure function of one hypothesis and its evidence, and the provider call grants no tools.
---

## Description

Without tool calling the model cannot be led to act, and the delimited block plus the fixed system rule keep a free-text field from leading it to judge wrongly — data is data, never instruction.

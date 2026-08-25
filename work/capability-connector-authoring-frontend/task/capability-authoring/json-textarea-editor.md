---
title: Shared JSON beautify/minify textarea control
summary: One reusable textarea control for editing JSON text that formats for reading, blocks on malformed input, and hands back the minified value.
rationale: No specification node states that an editing control must exist; this task is cut out of the capability editor because the same beautify/minify/inline-error contract is needed, unchanged, by three separate consumers across two other tasks (a capability's two schemas, a connector configuration's configuration field, and the test-connector panel's sample input), and building it once fixes that contract for every consumer rather than letting the first one to reach it decide it informally.
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
objective: A JSON-aware textarea control exists that any field needing JSON text can use, independent of which screen or field embeds it.
criteria:
  - A "Beautify" control reformats the control's current text as indented, pretty-printed JSON without changing what the text means as data.
  - Entering syntactically invalid JSON shows an inline error message next to the control.
  - While the control's current text is invalid JSON, the value it reports upward is marked invalid rather than silently passed on as if it were acceptable.
  - The value the control hands to its caller for submission is the same JSON minified — whitespace, tabs and other insignificant characters stripped — regardless of how the text is currently displayed.
  - The control's props (value, onChange, validity) are the same for every field that embeds it, so a second and third consumer wire it without re-implementing its parsing or formatting.
implements:
  - rules/integration/a-capability-declares-well-formed-schemas
---

## What it is

One shared textarea control — pretty-print on demand, inline error on invalid JSON, minified value on submit — that the capability, connector-configuration and test-connector editors each embed rather than reimplement.

## Notes

None.

---
title: Increase the capability schema editors' height without affecting the connector-configuration form
summary: The capability detail screen's input-schema and output-schema editors grow from 160px to 200px
  minimum height while the connector-configuration form's editor, which reuses the same shared component,
  keeps its current height.
rationale: JsonTextareaField's Textarea height class is shared verbatim with ConnectorConfigurationFormFields,
  and the scope leaves it to this cut whether to raise both consumers or scope the increase to the capability
  screen alone. The scope's own request names only the capability screen's two schema editors and never
  asks for the connector-configuration form's editor to change, so this task scopes the increase to the
  capability screen through an opt-in mechanism on the shared component (e.g. a prop), leaving JsonTextareaField's
  default height, and therefore the connector-configuration form's rendered height, unchanged. The execution-contract-binder
  confirmed, on a fresh reread of domain/integration/capability and domain/integration/capability-nature
  and a check of the decision log, that neither node nor the log states anything about editor height or
  rendering, so this task implements no specification node.
sources:
- work/capability-detail-layout-adjustment/intake/scope.md
objective: The capability detail screen's input-schema and output-schema editors have a minimum height
  of 200px (12.5rem), 25% taller than today's 160px, while the connector-configuration form's editor keeps
  its current 160px height.
criteria:
- The Textarea rendered by JsonTextareaField for the capability form's input-schema field has a minimum
  height of exactly 200px (12.5rem).
- The Textarea rendered by JsonTextareaField for the capability form's output-schema field has a minimum
  height of exactly 200px (12.5rem).
- The Textarea rendered by JsonTextareaField for the connector-configuration form's configuration field
  keeps a minimum height of 160px (10rem), unchanged from today.
- JsonTextareaField's default rendered height, used by any consumer that does not explicitly opt into
  the taller variant, remains 160px (10rem).
---

## What it is

One task of the capability-detail-layout-adjustment epic: a purely presentational height increase scoped to one consumer of a shared component.

## Notes

None.
